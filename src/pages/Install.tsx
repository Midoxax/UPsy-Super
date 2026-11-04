import { useState } from "react";
import UpsyLogo, { withLogo } from "@/components/UpsyLogo";
import {
  Smartphone,
  Apple,
  Chrome,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Share,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import SEOHead from "@/components/SEOHead";
import type { ReactNode } from "react";
import { useLocale } from "@/contexts/LocaleContext";

// Steps use **bold** and {share} / {plus} icon tokens.
function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\{share\}|\{plus\})/).map((part, i) => {
    if (part === "{share}")
      return <Share key={i} className="inline h-4 w-4 mx-1" />;
    if (part === "{plus}")
      return <Plus key={i} className="inline h-4 w-4 mx-1" />;
    if (part.startsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

const COPY = {
  en: {
    seoTitle: "Install U.Psy on your phone",
    seoDescription:
      "Add U.Psy to your home screen for a full-app experience — works on iPhone, Android, and any modern browser.",
    title: "Install the U.Psy app",
    sub: "Get U.Psy on your home screen — faster loading, full-screen, and instant access to Nour AI, your assessments and your bookings.",
    installNow: "Install U.Psy now",
    inAppTitle: "You opened this from an in-app browser",
    inAppBody:
      "Apps like Facebook, Instagram, LinkedIn or TikTok block installation. Open this page in your real browser (Chrome, Safari, Samsung Internet) first.",
    openBrowser: "Open in my browser",
    copied: "Link copied",
    copy: "Copy link",
    ios: "iPhone & iPad (Safari)",
    iosSteps: [
      "Tap the {share} **Share** icon in Safari.",
      "Scroll down → {plus} **Add to Home Screen**.",
      "Tap **Add** — U.Psy lands on your home screen.",
    ],
    android: "Android (Chrome / Samsung / Firefox)",
    androidSteps: [
      "Open the menu (**⋮** top-right, or ☰ on Samsung).",
      "Tap **Install app**, **Add to Home screen**, or **Add page to → Home screen**.",
      "Confirm to add U.Psy.",
    ],
    fallbackTitle: "Can't install? Use the shortcut",
    fallbackBody:
      "Some browsers (older Firefox, in-app browsers) don't support installation. You can still keep U.Psy one tap away — just bookmark or copy the link below.",
    openOther: "Open in another browser",
    tip: "Tip: send this link to yourself by SMS, WhatsApp or email, then open it in Safari (iPhone) or Chrome (Android) and follow the steps above.",
  },
  fr: {
    seoTitle: "Installer U.Psy sur votre téléphone",
    seoDescription:
      "Ajoutez U.Psy à votre écran d'accueil pour une expérience d'application complète, sur iPhone, Android et tout navigateur récent.",
    title: "Installer l'application U.Psy",
    sub: "U.Psy sur votre écran d'accueil : chargement plus rapide, plein écran et accès direct à Nour, à vos évaluations et à vos réservations.",
    installNow: "Installer U.Psy maintenant",
    inAppTitle: "Vous avez ouvert cette page depuis une application",
    inAppBody:
      "Les applications comme Facebook, Instagram, LinkedIn ou TikTok bloquent l'installation. Ouvrez d'abord cette page dans votre navigateur (Chrome, Safari, Samsung Internet).",
    openBrowser: "Ouvrir dans mon navigateur",
    copied: "Lien copié",
    copy: "Copier le lien",
    ios: "iPhone et iPad (Safari)",
    iosSteps: [
      "Touchez l'icône {share} **Partager** dans Safari.",
      "Faites défiler → {plus} **Sur l'écran d'accueil**.",
      "Touchez **Ajouter** : U.Psy apparaît sur votre écran d'accueil.",
    ],
    android: "Android (Chrome / Samsung / Firefox)",
    androidSteps: [
      "Ouvrez le menu (**⋮** en haut à droite, ou ☰ sur Samsung).",
      "Touchez **Installer l'application**, **Ajouter à l'écran d'accueil** ou **Ajouter la page à → Écran d'accueil**.",
      "Confirmez pour ajouter U.Psy.",
    ],
    fallbackTitle: "Installation impossible ? Utilisez le raccourci",
    fallbackBody:
      "Certains navigateurs (anciennes versions de Firefox, navigateurs intégrés aux applications) ne permettent pas l'installation. Gardez quand même U.Psy à portée de main : ajoutez un favori ou copiez le lien ci-dessous.",
    openOther: "Ouvrir dans un autre navigateur",
    tip: "Astuce : envoyez-vous ce lien par SMS, WhatsApp ou e-mail, puis ouvrez-le dans Safari (iPhone) ou Chrome (Android) et suivez les étapes ci-dessus.",
  },
  ar: {
    seoTitle: "ثبّت U.Psy على هاتفك",
    seoDescription:
      "أضف U.Psy إلى شاشتك الرئيسية لتجربة تطبيق كاملة، على iPhone وAndroid وكل متصفح حديث.",
    title: "ثبّت تطبيق U.Psy",
    sub: "U.Psy على شاشتك الرئيسية: تحميل أسرع، ملء الشاشة، ووصول مباشر إلى نور وتقييماتك وحجوزاتك.",
    installNow: "ثبّت U.Psy الآن",
    inAppTitle: "فتحت هذه الصفحة من داخل تطبيق",
    inAppBody:
      "تطبيقات مثل Facebook وInstagram وLinkedIn وTikTok تمنع التثبيت. افتح هذه الصفحة أولاً في متصفحك (Chrome أو Safari أو Samsung Internet).",
    openBrowser: "افتح في متصفحي",
    copied: "تم نسخ الرابط",
    copy: "انسخ الرابط",
    ios: "iPhone وiPad (Safari)",
    iosSteps: [
      "اضغط على أيقونة {share} **مشاركة** في Safari.",
      "مرّر للأسفل ← {plus} **إضافة إلى الشاشة الرئيسية**.",
      "اضغط **إضافة**: يظهر U.Psy على شاشتك الرئيسية.",
    ],
    android: "Android (Chrome / Samsung / Firefox)",
    androidSteps: [
      "افتح القائمة (**⋮** أعلى اليمين، أو ☰ على Samsung).",
      "اضغط **تثبيت التطبيق** أو **إضافة إلى الشاشة الرئيسية**.",
      "أكّد لإضافة U.Psy.",
    ],
    fallbackTitle: "التثبيت غير ممكن؟ استعمل الاختصار",
    fallbackBody:
      "بعض المتصفحات (إصدارات Firefox القديمة، المتصفحات داخل التطبيقات) لا تدعم التثبيت. يمكنك مع ذلك إبقاء U.Psy في متناولك: أضف إشارة مرجعية أو انسخ الرابط أدناه.",
    openOther: "افتح في متصفح آخر",
    tip: "نصيحة: أرسل هذا الرابط لنفسك عبر SMS أو واتساب أو البريد، ثم افتحه في Safari (iPhone) أو Chrome (Android) واتبع الخطوات أعلاه.",
  },
};

const ua = () => (typeof navigator !== "undefined" ? navigator.userAgent : "");
const isIOS = () => /iphone|ipad|ipod/i.test(ua());
const isAndroid = () => /android/i.test(ua());
const isInAppBrowser = () => {
  const u = ua().toLowerCase();
  return /(fban|fbav|fbios|instagram|line|linkedinapp|micromessenger|tiktok|snapchat|pinterest|wv\)|; wv)/.test(
    u,
  );
};

const Install = () => {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined" ? window.location.origin : "https://upsy.ma";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Copy is best-effort; the address stays visible to copy by hand.
      }
      document.body.removeChild(ta);
    }
  };

  const openInBrowser = () => {
    if (isAndroid()) {
      const host = window.location.host;
      window.location.href = `intent://${host}/install#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    window.open(url + "/install", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <SEOHead
        title={c.seoTitle}
        description={c.seoDescription}
        path="/install"
      />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-5">
            <Smartphone className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {withLogo(c.title, "h-[0.9em] mx-1")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{c.sub}</p>
          <div className="mt-6">
            <InstallAppButton size="lg" label={c.installNow} />
          </div>
        </header>

        {isInAppBrowser() && (
          <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-medium">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{c.inAppTitle}</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.inAppBody}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={openInBrowser}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> {c.openBrowser}
                </Button>
                <Button
                  onClick={copy}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? c.copied : c.copy}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 font-medium">
                <Apple className="h-5 w-5" />
                {c.ios}
              </div>
              <ol className="space-y-3 text-sm">
                {c.iosSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{rich(step)}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 font-medium">
                <Chrome className="h-5 w-5" />
                {c.android}
              </div>
              <ol className="space-y-3 text-sm">
                {c.androidSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{rich(step)}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6 space-y-3">
            <h2 className="font-medium">{c.fallbackTitle}</h2>
            <p className="text-sm text-muted-foreground">{c.fallbackBody}</p>
            <div
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm font-mono break-all"
              dir="ltr"
            >
              {url}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={copy}
                variant="default"
                size="sm"
                className="gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? c.copied : c.copy}
              </Button>
              <Button
                onClick={openInBrowser}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" /> {c.openOther}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">{c.tip}</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Install;
