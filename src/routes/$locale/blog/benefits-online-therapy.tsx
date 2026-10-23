import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const BenefitsOnlineTherapy = lazy(
  () => import("@/pages/blog/BenefitsOnlineTherapy"),
);

export const Route = createFileRoute("/$locale/blog/benefits-online-therapy")({
  loader: () => blogLoader("benefits-online-therapy"),
  component: () => (
    <PageTransition>
      <BenefitsOnlineTherapy />
    </PageTransition>
  ),
});
