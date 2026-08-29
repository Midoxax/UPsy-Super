import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Command = lazy(() => import("@/ops/pages/Command"));

export const Route = createFileRoute("/ops/$workspace/command")({
  component: () => <Command />,
});
