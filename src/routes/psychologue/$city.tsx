import { createFileRoute } from "@tanstack/react-router";
import PageTransition from "@/components/PageTransition";
import { CityPage } from "@/pages/LocalLanding";
import { cityLoader } from "@/lib/seo/loaders";

export const Route = createFileRoute("/psychologue/$city")({
  loader: ({ params }) => cityLoader(params.city),
  component: function City() {
    const { city, list } = Route.useLoaderData();
    return (
      <PageTransition>
        <CityPage city={city} list={list} />
      </PageTransition>
    );
  },
});
