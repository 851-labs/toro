import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type {
  CreateTerminalRequest,
  CreateTerminalResponse,
  TerminalOutputResponse,
  WaitForTerminalExitResponse,
} from "@agentclientprotocol/sdk";

interface TerminalState {
  readonly process: ChildProcessWithoutNullStreams;
  readonly outputLimit: number;
  output: string;
  exit: WaitForTerminalExitResponse | null;
}

export class TerminalManager {
  private readonly terminals = new Map<string, TerminalState>();
  private nextId = 1;

  create(request: CreateTerminalRequest, workspacePath: string): CreateTerminalResponse {
    const terminalId = `terminal-${this.nextId++}`;
    const child = spawn(request.command, request.args ?? [], {
      cwd: request.cwd ?? workspacePath,
      env: { ...process.env, ...envRecord(request.env) },
      stdio: ["pipe", "pipe", "pipe"],
    });

    const state: TerminalState = {
      exit: null,
      output: "",
      outputLimit: request.outputByteLimit ?? 256_000,
      process: child,
    };

    child.stdout.on("data", (chunk: Buffer) => appendOutput(state, chunk.toString("utf8")));
    child.stderr.on("data", (chunk: Buffer) => appendOutput(state, chunk.toString("utf8")));
    child.on("exit", (exitCode, signal) => {
      state.exit = { exitCode, signal };
    });
    this.terminals.set(terminalId, state);
    return { terminalId };
  }

  output(terminalId: string): TerminalOutputResponse {
    const state = this.requireTerminal(terminalId);
    return {
      exitStatus: state.exit,
      output: state.output,
      truncated: state.output.length >= state.outputLimit,
    };
  }

  waitForExit(terminalId: string): Promise<WaitForTerminalExitResponse> {
    const state = this.requireTerminal(terminalId);
    if (state.exit) {
      return Promise.resolve(state.exit);
    }
    return new Promise((resolve) => {
      state.process.once("exit", (exitCode, signal) => resolve({ exitCode, signal }));
    });
  }

  kill(terminalId: string): void {
    this.requireTerminal(terminalId).process.kill();
  }

  release(terminalId: string): void {
    const state = this.terminals.get(terminalId);
    if (state && !state.exit) {
      state.process.kill();
    }
    this.terminals.delete(terminalId);
  }

  killAll(): void {
    for (const terminalId of this.terminals.keys()) {
      this.release(terminalId);
    }
  }

  private requireTerminal(terminalId: string): TerminalState {
    const state = this.terminals.get(terminalId);
    if (!state) {
      throw new Error(`Unknown terminal: ${terminalId}`);
    }
    return state;
  }
}

function appendOutput(state: TerminalState, chunk: string): void {
  state.output = `${state.output}${chunk}`;
  if (state.output.length > state.outputLimit) {
    state.output = state.output.slice(state.output.length - state.outputLimit);
  }
}

function envRecord(
  env: readonly { readonly name: string; readonly value: string }[] | null | undefined,
): Record<string, string> {
  return Object.fromEntries((env ?? []).map((entry) => [entry.name, entry.value]));
}
