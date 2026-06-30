import { createFileRoute } from "@tanstack/react-router";
import { ComposerStates } from "../screens/internal-chat";

export const Route = createFileRoute("/composer")({
  component: ComposerStates,
});
