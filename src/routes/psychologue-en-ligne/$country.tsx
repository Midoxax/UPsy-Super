import { createFileRoute, notFound } from "@tanstack/react-router";
import PageTransition from "@/components/PageTransition";
import { CountryPage } from "@/pages/LocalLanding";
import { COUNTRIES } from "@/content/seo/places";
import { localPsychologists } from "@/lib/seo/localPsychologists";

export const Route = createFileRoute("/psychologue-en-ligne/$country")({
  loader: async ({ params }) => {
    const country = COUNTRIES.find((c) => c.slug === params.country);
    if (!country) throw notFound();
    return { country, list: await localPsychologists({ online: true }) };
  },
  component: function Country() {
    const { country, list } = Route.useLoaderData();
    return (
      <PageTransition>
        <CountryPage country={country} list={list} />
      </PageTransition>
    );
  },
});
