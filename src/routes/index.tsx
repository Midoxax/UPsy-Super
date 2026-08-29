import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import PageTransition from "@/components/PageTransition";

export const Route = createFileRoute("/")({
  component: () => (
    <PageTransition><Index /></PageTransition>
  ),
});
