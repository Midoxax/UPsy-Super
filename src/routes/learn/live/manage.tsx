import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LiveClassManage"));

export const Route = createFileRoute("/learn/live/manage")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
