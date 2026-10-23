import { createFileRoute } from "@tanstack/react-router";
import PageTransition from "@/components/PageTransition";
import { CountryPage } from "@/pages/LocalLanding";
import { countryLoader } from "@/lib/seo/loaders";

export const Route = createFileRoute("/psychologue-en-ligne/$country")({
  loader: ({ params }) => countryLoader(params.country),
  component: function Country() {
    const { country, list } = Route.useLoaderData();
    return (
      <PageTransition>
        <CountryPage country={country} list={list} />
      </PageTransition>
    );
  },
});
