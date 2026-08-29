import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const BookRedirect = lazy(() => import("@/pages/BookRedirect"));

export const Route = createFileRoute("/b/$slug")({
  component: () => (
    <BookRedirect />
  ),
});
