import { createFileRoute } from "@tanstack/react-router";
import { InternalChat } from "../screens/internal-chat";

export const Route = createFileRoute("/")({
  component: InternalChat,
});
