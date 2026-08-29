import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const BlogIndex = lazy(() => import("@/pages/blog/BlogIndex"));

export const Route = createFileRoute("/blog")({
  component: () => (
    <PageTransition><BlogIndex /></PageTransition>
  ),
});
