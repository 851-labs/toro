import { Check, X } from "lucide-react";
import { Button } from "../button";

export interface CodexPermissionActionProps {
  readonly allow: boolean;
  readonly label: string;
  readonly onClick: () => void;
}

export function CodexPermissionAction({ allow, label, onClick }: CodexPermissionActionProps) {
  return (
    <Button
      className="h-8"
      icon={allow ? <Check size={14} /> : <X size={14} />}
      onClick={onClick}
      variant={allow ? "primary" : "danger"}
    >
      {label}
    </Button>
  );
}
