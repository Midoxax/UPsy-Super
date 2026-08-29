import { useLocale } from "@/contexts/LocaleContext";
import SEOHead from "@/components/SEOHead";

const Legal = () => {
  const { t } = useLocale();
  
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        path="/legal"
        title="Legal & Privacy — U.Psy"
        description="Legal information, terms of service, and Moroccan Law 09-08 privacy notice for U.Psy users and partners."
      />
      <div className="container-custom section-spacing">
        <div className="text-center">
          <h1 className="text-h1 text-foreground mb-6">{t('placeholder.legal.title')}</h1>
          <p className="text-body text-muted-foreground">{t('placeholder.legal.content')}</p>
        </div>
      </div>
    </main>
  );
};

export default Legal;