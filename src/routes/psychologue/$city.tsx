import { createFileRoute, notFound } from "@tanstack/react-router";
import PageTransition from "@/components/PageTransition";
import { CityPage } from "@/pages/LocalLanding";
import { CITIES } from "@/content/seo/places";
import { localPsychologists } from "@/lib/seo/localPsychologists";

export const Route = createFileRoute("/psychologue/$city")({
  // In the loader so the nearest psychologists are in the server HTML.
  loader: async ({ params }) => {
    const city = CITIES.find((c) => c.slug === params.city);
    if (!city) throw notFound();
    return { city, list: await localPsychologists(city) };
  },
  component: function City() {
    const { city, list } = Route.useLoaderData();
    return (
      <PageTransition>
        <CityPage city={city} list={list} />
      </PageTransition>
    );
  },
});
