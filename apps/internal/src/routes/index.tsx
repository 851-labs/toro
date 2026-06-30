import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChatElements } from "../screens/internal-chat";

export const Route = createFileRoute("/")({
  component: ChatElementsRoute,
});

function ChatElementsRoute() {
  const [permissionDecision, setPermissionDecision] = useState<
    "allowed once" | "rejected" | "waiting"
  >("waiting");

  return (
    <ChatElements
      permissionDecision={permissionDecision}
      onPermissionDecision={setPermissionDecision}
    />
  );
}
