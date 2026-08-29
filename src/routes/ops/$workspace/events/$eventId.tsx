import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EventDetail = lazy(() => import("@/ops/pages/EventDetail"));

export const Route = createFileRoute("/ops/$workspace/events/$eventId")({
  component: () => <EventDetail />,
});
