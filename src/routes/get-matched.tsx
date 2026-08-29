import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const GetMatched = lazy(() => import("@/pages/GetMatched"));

export const Route = createFileRoute("/get-matched")({
  component: () => (
    <PageTransition><GetMatched /></PageTransition>
  ),
});
