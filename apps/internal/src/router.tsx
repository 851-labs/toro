import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function createInternalRouter() {
  return createRouter({ routeTree });
}

export function getRouter() {
  return createInternalRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createInternalRouter>;
  }
}
