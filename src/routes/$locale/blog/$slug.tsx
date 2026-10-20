import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const BlogArticle = lazy(() => import("@/pages/blog/BlogArticle"));

export const Route = createFileRoute("/$locale/blog/$slug")({
  component: () => (
    <PageTransition>
      <BlogArticle />
    </PageTransition>
  ),
});
