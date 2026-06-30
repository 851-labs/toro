import {
  createRoute,
  createRootRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChatDesignGuide } from "./screens/chat-design-guide";
import "./styles.css";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  component: ChatDesignGuide,
  getParentRoute: () => rootRoute,
  path: "/",
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RootLayout() {
  return <Outlet />;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
