import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const LeaguePortal = lazy(() => import("@/pages/LeaguePortal"));

export const Route = createFileRoute("/league")({
  component: () => (
    <ProtectedRoute>
      <PageTransition>
        <LeaguePortal />
      </PageTransition>
    </ProtectedRoute>
  ),
});
