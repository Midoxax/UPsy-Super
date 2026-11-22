import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/PassportPublic"));

export const Route = createFileRoute("/$locale/passport/$token")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
