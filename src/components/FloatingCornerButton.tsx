import { ActionIcon, Tooltip } from "@mantine/core";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function FloatingCornerButton({
  to,
  label,
  children,
  pos = "left",
}: {
  to: string;
  label: string;
  children: ReactNode;
  pos?: "left" | "right";
}) {
  const side = pos === "left" ? { left: 16 } : { right: 16 };
  return (
    <Tooltip label={label} openDelay={300}>
      <ActionIcon
        component={Link}
        to={to}
        variant="light"
        size="lg"
        aria-label={label}
        style={{ position: "fixed", top: 16, zIndex: 10000, ...side }}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
}
