import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const BookRedirect = lazy(() => import("@/pages/BookRedirect"));

export const Route = createFileRoute("/$locale/b/$slug")({
  component: () => (
    <BookRedirect />
  ),
});
