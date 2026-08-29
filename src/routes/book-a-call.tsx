import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Contact = lazy(() => import("@/pages/Contact"));

export const Route = createFileRoute("/book-a-call")({
  component: () => (
    <PageTransition><Contact /></PageTransition>
  ),
});
