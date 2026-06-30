import type { EnvironmentId } from "@toro/domain";
import { LocalDesktopEnvironment } from "./local-desktop";
import type { EnvironmentProvider } from "./provider";
import { RemoteSandboxEnvironment } from "./remote-sandbox";

export class EnvironmentRegistry {
  private readonly providers = new Map<EnvironmentId, EnvironmentProvider>();

  constructor(
    providers: readonly EnvironmentProvider[] = [
      new LocalDesktopEnvironment(),
      new RemoteSandboxEnvironment(),
    ],
  ) {
    for (const provider of providers) {
      this.providers.set(provider.id, provider);
    }
  }

  get(id: EnvironmentId): EnvironmentProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Unknown environment: ${id}`);
    }
    return provider;
  }
}
