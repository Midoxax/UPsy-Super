import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const DoINeedTherapy = lazy(() => import("@/pages/blog/DoINeedTherapy"));

export const Route = createFileRoute("/$locale/blog/do-i-need-therapy")({
  loader: () => blogLoader("do-i-need-therapy"),
  component: () => (
    <PageTransition>
      <DoINeedTherapy />
    </PageTransition>
  ),
});
