import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const MindfulnessForBeginners = lazy(
  () => import("@/pages/blog/MindfulnessForBeginners"),
);

export const Route = createFileRoute("/$locale/blog/mindfulness-for-beginners")(
  {
    loader: () => blogLoader("mindfulness-for-beginners"),
    component: () => (
      <PageTransition>
        <MindfulnessForBeginners />
      </PageTransition>
    ),
  },
);
