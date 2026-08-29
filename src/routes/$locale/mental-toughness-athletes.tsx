import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const MentalToughnessAthletes = lazy(() => import("@/pages/MentalToughnessAthletes"));

export const Route = createFileRoute("/$locale/mental-toughness-athletes")({
  component: () => (
    <PageTransition><MentalToughnessAthletes /></PageTransition>
  ),
});
