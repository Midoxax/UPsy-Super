import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Events = lazy(() => import("@/ops/pages/Events"));

export const Route = createFileRoute("/ops/$workspace/events/")({
  component: () => <Events />,
});
