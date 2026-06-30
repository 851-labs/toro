import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function createDesignGuideRouter() {
  return createRouter({ routeTree });
}

export function getRouter() {
  return createDesignGuideRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createDesignGuideRouter>;
  }
}
