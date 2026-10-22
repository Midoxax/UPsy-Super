import { createFileRoute } from "@tanstack/react-router";
import PageTransition from "@/components/PageTransition";
import { PlacesIndex } from "@/pages/LocalLanding";

export const Route = createFileRoute("/$locale/psychologue-en-ligne/")({
  component: () => (
    <PageTransition>
      <PlacesIndex kind="countries" />
    </PageTransition>
  ),
});
