import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LiveClassRoom"));

export const Route = createFileRoute("/$locale/learn/live/$id")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
