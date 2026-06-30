import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function createRouter() {
  return createTanStackRouter({
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  });
}

const getRouter = createRouter;

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export { createRouter, getRouter };
