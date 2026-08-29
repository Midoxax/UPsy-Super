import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Tasks = lazy(() => import("@/ops/pages/Tasks"));

export const Route = createFileRoute("/ops/$workspace/tasks")({
  component: () => <Tasks />,
});
