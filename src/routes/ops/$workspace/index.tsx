import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ops/$workspace/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/ops/$workspace/command", params, replace: true });
  },
});
