import { createFileRoute } from "@tanstack/react-router";
import { EmptyStates } from "../screens/internal-chat";

export const Route = createFileRoute("/empty")({
  component: EmptyStates,
});
