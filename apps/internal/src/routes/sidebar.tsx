import { createFileRoute } from "@tanstack/react-router";
import { SidebarGroups } from "../screens/internal-chat";

export const Route = createFileRoute("/sidebar")({
  component: SidebarGroups,
});
