import { useLocale } from "@/contexts/LocaleContext";

const SkipToContent = () => {
  const { t } = useLocale();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:start-4 focus:top-4 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {t("common.skipToContent")}
    </a>
  );
};

export default SkipToContent;
