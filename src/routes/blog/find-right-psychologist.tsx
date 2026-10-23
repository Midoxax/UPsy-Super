import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const FindRightPsychologist = lazy(
  () => import("@/pages/blog/FindRightPsychologist"),
);

export const Route = createFileRoute("/blog/find-right-psychologist")({
  loader: () => blogLoader("find-right-psychologist"),
  component: () => (
    <PageTransition>
      <FindRightPsychologist />
    </PageTransition>
  ),
});
