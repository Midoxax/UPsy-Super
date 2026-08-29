import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import "@/ops/ops-theme.css";

// Self-hosted rather than fetched from Google Fonts: no third-party request on
// a prototype route, and the type never falls back mid-render.
import "@fontsource/sora/200.css";
import "@fontsource/sora/300.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/ibm-plex-sans/300.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/jetbrains-mono/300.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

const Preview = lazy(() => import("@/ops/pages/Preview"));

export const Route = createFileRoute("/ops/preview")({
  head: () => ({
    meta: [
      { title: "UPSY OS — Operational Command Prototype | U.Psy" },
      {
        name: "description",
        content:
          "Cinematic prototype of the UPSY OS command interface: live protocol telemetry, task orchestration and the Director console.",
      },
      { property: "og:title", content: "UPSY OS — Operational Command Prototype" },
      {
        property: "og:description",
        content:
          "Cinematic prototype of the UPSY OS command interface: live protocol telemetry, task orchestration and the Director console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Preview />,
});
