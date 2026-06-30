import { createFileRoute } from "@tanstack/react-router";
import { ChatDesignGuide } from "../screens/chat-design-guide";

export const Route = createFileRoute("/")({
  component: ChatDesignGuide,
});
