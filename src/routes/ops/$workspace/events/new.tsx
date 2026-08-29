import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewEvent = lazy(() => import("@/ops/pages/NewEvent"));

export const Route = createFileRoute("/ops/$workspace/events/new")({
  component: () => <NewEvent />,
});
