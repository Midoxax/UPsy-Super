import { Info, CheckCircle2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocale } from "@/contexts/LocaleContext";
import { translations } from "@/lib/i18n/translations";

export const MethodsMetricsBand = () => {
  const { locale, t } = useLocale();
  const band = (translations[locale] as any).services?.methodsBand ?? (translations.en as any).services.methodsBand;

  return (
    <section className="py-12 md:py-16 bg-accent/5 border-y border-accent/10">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Left: Heading */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full theme-accent theme-halo" />
              <h3 className="text-h3 font-bold">{band.heading}</h3>
            </div>
            <p className="text-body text-muted-foreground">
              {band.subheading}
            </p>
          </div>

          {/* Middle: Methods */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 theme-accent" strokeWidth={2} />
              <h4 className="font-semibold text-foreground">{band.methodsTitle}</h4>
            </div>
            <div className="space-y-3">
              {band.methods.map((method: any, index: number) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="bg-background/50 border-accent/20 text-xs font-mono shrink-0"
                    >
                      {method.name}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        {/* Icon-only trigger: needs a name for screen readers, and
                            p-2/-m-2 lifts the 16px icon to a 32px tap target
                            without shifting the layout around it. */}
                        <button
                          type="button"
                          aria-label={`${t("common.learnMore") || "Learn more about"} ${method.name}`}
                          className="ml-auto p-2 -m-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Info className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" strokeWidth={2} aria-hidden="true" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-background">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {method.name}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription className="text-body text-muted-foreground pt-2">
                            {method.description}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">
                    {method.description.split(' — ')[1] || method.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 theme-accent" strokeWidth={2} />
              <h4 className="font-semibold text-foreground">{band.metricsTitle}</h4>
            </div>
            <div className="space-y-3">
              {band.metrics.map((metric: any, index: number) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="bg-background/50 border-accent/20 text-xs font-mono shrink-0"
                    >
                      {metric.name}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${t("common.learnMore") || "Learn more about"} ${metric.name}`}
                          className="ml-auto p-2 -m-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Info className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" strokeWidth={2} aria-hidden="true" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-background">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {metric.name}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription className="text-body text-muted-foreground pt-2">
                            {metric.description}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">
                    {metric.description.split(' — ')[1] || metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
