import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { Readable, Writable } from "node:stream";
import * as acp from "@agentclientprotocol/sdk";
import { createHttpStream } from "@agentclientprotocol/sdk/experimental/http-client";
import type {
  ActiveSession,
  ClientConnection,
  RequestPermissionResponse,
} from "@agentclientprotocol/sdk";
import type {
  AgentProfile,
  HostEvent,
  PermissionRequestId,
  SessionId,
  Workspace,
} from "@toro/domain";
import { permissionRequestId } from "@toro/domain";
import { readWorkspaceTextFile, writeWorkspaceTextFile } from "./file-access";
import { AcpEventNormalizer } from "./normalizer";
import { TerminalManager } from "./terminal-manager";

type EventSink = (event: HostEvent) => void;

interface PendingPermission {
  readonly sessionId: SessionId;
  resolve(response: RequestPermissionResponse): void;
}

export interface AcpAgentSessionOptions {
  readonly agent: AgentProfile;
  readonly workspace: Workspace;
  readonly sessionId: SessionId;
  readonly emit: EventSink;
}

export class AcpAgentSession {
  private readonly normalizer: AcpEventNormalizer;
  private readonly terminals = new TerminalManager();
  private readonly pendingPermissions = new Map<PermissionRequestId, PendingPermission>();
  private activeSession: ActiveSession | null = null;
  private child: ChildProcessWithoutNullStreams | null = null;
  private connection: ClientConnection | null = null;
  private promptRunning = false;

  constructor(private readonly options: AcpAgentSessionOptions) {
    this.normalizer = new AcpEventNormalizer(options.sessionId);
  }

  async start(): Promise<void> {
    const child = spawn(this.options.agent.command.command, this.commandArgs(), {
      cwd: process.cwd(),
      env: { ...process.env, ...this.options.agent.command.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child = child;
    child.stderr.on("data", (chunk: Buffer) => this.log(chunk.toString("utf8").trim()));
    child.on("exit", (code, signal) =>
      this.log(`Agent process exited: code=${code ?? "null"} signal=${signal ?? "null"}`),
    );

    const stream = await this.createStream(child);
    this.connection = this.clientApp().connect(stream);
    await this.initializeAgent();
    this.activeSession = await this.connection.agent
      .buildSession(this.options.workspace.path)
      .start();
  }

  async sendPrompt(content: string): Promise<void> {
    if (!this.activeSession) {
      throw new Error("ACP session has not started");
    }
    if (this.promptRunning) {
      throw new Error("A prompt is already running");
    }

    this.promptRunning = true;
    this.emit({
      at: new Date().toISOString(),
      sessionId: this.options.sessionId,
      status: "running",
      type: "session_status_changed",
    });
    const promptPromise = this.activeSession.prompt(content);

    try {
      for (;;) {
        const message = await this.activeSession.nextUpdate();
        if (message.kind === "stop") {
          const at = new Date().toISOString();
          for (const event of this.normalizer.completeOpenMessages(at)) {
            this.emit(event);
          }
          this.emit({
            at,
            sessionId: this.options.sessionId,
            status: message.stopReason === "cancelled" ? "cancelled" : "completed",
            type: "session_status_changed",
          });
          break;
        }
        for (const event of this.normalizer.normalizeSessionUpdate(message.notification)) {
          this.emit(event);
        }
      }
      await promptPromise;
    } catch (error) {
      this.emit({
        at: new Date().toISOString(),
        message: errorMessage(error),
        sessionId: this.options.sessionId,
        type: "session_failed",
      });
    } finally {
      this.promptRunning = false;
    }
  }

  async cancel(): Promise<void> {
    if (!this.connection || !this.activeSession) {
      return;
    }
    await this.connection.agent.notify(acp.methods.agent.session.cancel, {
      sessionId: this.activeSession.sessionId,
    });
  }

  respondToPermission(requestId: PermissionRequestId, optionId: string): void {
    const pending = this.pendingPermissions.get(requestId);
    if (!pending) {
      throw new Error(`Unknown permission request: ${requestId}`);
    }
    pending.resolve({ outcome: { optionId, outcome: "selected" } });
    this.pendingPermissions.delete(requestId);
    this.emit({ requestId, sessionId: pending.sessionId, type: "permission_resolved" });
  }

  close(): void {
    this.terminals.killAll();
    this.connection?.close();
    this.child?.kill();
  }

  private clientApp(): acp.ClientApp {
    return acp
      .client({ name: "Toro" })
      .onRequest(acp.methods.client.session.requestPermission, (ctx) => {
        const requestId = permissionRequestId(String(ctx.requestId));
        return new Promise<RequestPermissionResponse>((resolve) => {
          this.pendingPermissions.set(requestId, { resolve, sessionId: this.options.sessionId });
          this.emit(this.normalizer.normalizePermission(ctx.params, requestId));
        });
      })
      .onRequest(acp.methods.client.fs.readTextFile, async (ctx) => ({
        content: await readWorkspaceTextFile(
          this.options.workspace.path,
          ctx.params.path,
          ctx.params.line,
          ctx.params.limit,
        ),
      }))
      .onRequest(acp.methods.client.fs.writeTextFile, async (ctx) => {
        await writeWorkspaceTextFile(
          this.options.workspace.path,
          ctx.params.path,
          ctx.params.content,
        );
        return {};
      })
      .onRequest(acp.methods.client.terminal.create, (ctx) =>
        this.terminals.create(ctx.params, this.options.workspace.path),
      )
      .onRequest(acp.methods.client.terminal.output, (ctx) =>
        this.terminals.output(ctx.params.terminalId),
      )
      .onRequest(acp.methods.client.terminal.waitForExit, (ctx) =>
        this.terminals.waitForExit(ctx.params.terminalId),
      )
      .onRequest(acp.methods.client.terminal.kill, (ctx) => {
        this.terminals.kill(ctx.params.terminalId);
        return {};
      })
      .onRequest(acp.methods.client.terminal.release, (ctx) => {
        this.terminals.release(ctx.params.terminalId);
        return {};
      });
  }

  private async initializeAgent(): Promise<void> {
    if (!this.connection) {
      throw new Error("ACP connection has not started");
    }
    const result = await this.connection.agent.request(acp.methods.agent.initialize, {
      clientCapabilities: {
        auth: { terminal: true },
        fs: { readTextFile: true, writeTextFile: true },
        plan: {},
        terminal: true,
      },
      clientInfo: { name: "Toro", version: "0.1.0" },
      protocolVersion: acp.PROTOCOL_VERSION,
    });
    this.log(`Connected to ACP agent protocol=${result.protocolVersion}`);
  }

  private log(line: string): void {
    if (line.length === 0) {
      return;
    }
    this.emit({
      at: new Date().toISOString(),
      line,
      sessionId: this.options.sessionId,
      type: "session_log",
    });
  }

  private emit(event: HostEvent): void {
    this.options.emit(event);
  }

  private async createStream(child: ChildProcessWithoutNullStreams): Promise<acp.Stream> {
    if (this.options.agent.transport.kind === "http") {
      await waitForHttp(this.options.agent.transport.url);
      return createHttpStream(this.options.agent.transport.url);
    }

    return acp.ndJsonStream(
      Writable.toWeb(child.stdin) as WritableStream<Uint8Array>,
      Readable.toWeb(child.stdout) as unknown as ReadableStream<Uint8Array>,
    );
  }

  private commandArgs(): string[] {
    return this.options.agent.command.args.map((arg) =>
      arg.replaceAll("{workspacePath}", this.options.workspace.path),
    );
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function waitForHttp(url: string): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      await fetch(url, { method: "GET" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Timed out waiting for ACP HTTP server: ${url}`);
}
