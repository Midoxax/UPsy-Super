import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/NewsletterIssue"));

export const Route = createFileRoute("/newsletter/$period")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
