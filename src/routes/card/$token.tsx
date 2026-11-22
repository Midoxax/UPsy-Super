import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/CardVerify"));

export const Route = createFileRoute("/card/$token")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
