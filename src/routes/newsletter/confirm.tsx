import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const NewsletterConfirm = lazy(() => import("@/pages/NewsletterConfirm"));

export const Route = createFileRoute("/newsletter/confirm")({
  component: () => (
    <PageTransition>
      <NewsletterConfirm />
    </PageTransition>
  ),
});
