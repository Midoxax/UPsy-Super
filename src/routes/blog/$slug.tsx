import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const BlogArticle = lazy(() => import("@/pages/blog/BlogArticle"));

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => blogLoader(params.slug),
  component: () => (
    <PageTransition>
      <BlogArticle />
    </PageTransition>
  ),
});
