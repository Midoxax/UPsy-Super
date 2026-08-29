import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const BookingResponse = lazy(() => import("@/pages/BookingResponse"));

export const Route = createFileRoute("/$locale/booking/respond/$token")({
  component: () => (
    <PageTransition><BookingResponse /></PageTransition>
  ),
});
