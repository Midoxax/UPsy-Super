/// <reference types="npm:@types/react@18.3.1" />
// Newsletter emails: the monthly digest and the sign-up confirmation.
import * as React from "npm:react@18.3.1";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";

export type Lang = "en" | "fr" | "ar";

export interface DigestItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  url: string;
  image: string | null;
}

const LOGO =
  "https://skxxvgjjdshcopybokdt.supabase.co/storage/v1/object/public/email-assets/logo.png";

const T = {
  en: {
    preview: (n: number) =>
      `${n} new article${n > 1 ? "s" : ""} from U.Psy this month`,
    title: "This month on U.Psy",
    hello: "Hello,",
    intro: "Here are the articles our psychologists published this month.",
    read: "Read",
    minutes: "min read",
    cta: "Find a psychologist",
    footer: "You receive this because you subscribed to the U.Psy newsletter.",
    unsubscribe: "Unsubscribe",
    confirmPreview: "Confirm your subscription to the U.Psy newsletter",
    confirmTitle: "One click to confirm",
    confirmBody:
      "Confirm your address to receive one email a month with our new articles on mental health and performance. If you did not ask for this, ignore this email.",
    confirmCta: "Confirm my subscription",
  },
  fr: {
    preview: (n: number) =>
      `${n} nouvel${n > 1 ? "s" : ""} article${n > 1 ? "s" : ""} U.Psy ce mois-ci`,
    title: "Ce mois-ci sur U.Psy",
    hello: "Bonjour,",
    intro: "Voici les articles publiés ce mois-ci par nos psychologues.",
    read: "Lire",
    minutes: "min de lecture",
    cta: "Trouver un psychologue",
    footer:
      "Vous recevez cet email car vous êtes inscrit(e) à la newsletter U.Psy.",
    unsubscribe: "Se désinscrire",
    confirmPreview: "Confirmez votre inscription à la newsletter U.Psy",
    confirmTitle: "Un clic pour confirmer",
    confirmBody:
      "Confirmez votre adresse pour recevoir un email par mois avec nos nouveaux articles sur la santé mentale et la performance. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    confirmCta: "Confirmer mon inscription",
  },
  ar: {
    preview: (n: number) => `${n} مقالات جديدة من U.Psy هذا الشهر`,
    title: "هذا الشهر على U.Psy",
    hello: "مرحباً،",
    intro: "إليك المقالات التي نشرها أخصائيونا هذا الشهر.",
    read: "اقرأ",
    minutes: "دقائق قراءة",
    cta: "ابحث عن أخصائي",
    footer: "تتلقى هذا البريد لأنك مشترك في نشرة U.Psy.",
    unsubscribe: "إلغاء الاشتراك",
    confirmPreview: "أكّد اشتراكك في نشرة U.Psy",
    confirmTitle: "نقرة واحدة للتأكيد",
    confirmBody:
      "أكّد عنوانك لتتلقى بريداً واحداً في الشهر بمقالاتنا الجديدة حول الصحة النفسية والأداء. إن لم تطلب ذلك، تجاهل هذا البريد.",
    confirmCta: "تأكيد اشتراكي",
  },
};

export const digestSubject = (lang: Lang, period: string) => {
  const d = new Date(period + "-01T12:00:00Z");
  const month = d.toLocaleDateString(
    lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "ar-MA",
    {
      month: "long",
      year: "numeric",
    },
  );
  return lang === "en"
    ? `U.Psy — the ${month} newsletter`
    : lang === "fr"
      ? `U.Psy — la newsletter de ${month}`
      : `U.Psy — نشرة ${month}`;
};

export const confirmSubject = (lang: Lang) =>
  lang === "en"
    ? "Confirm your U.Psy newsletter subscription"
    : lang === "fr"
      ? "Confirmez votre inscription à la newsletter U.Psy"
      : "أكّد اشتراكك في نشرة U.Psy";

export function Digest({
  lang,
  intro,
  items,
  siteUrl,
  unsubscribeUrl,
}: {
  lang: Lang;
  intro?: string | null;
  items: DigestItem[];
  siteUrl: string;
  unsubscribeUrl: string;
}) {
  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const prefix = lang === "en" ? "" : `/${lang}`;
  return (
    <Html lang={lang} dir={dir}>
      <Head />
      <Preview>{t.preview(items.length)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={LOGO}
            alt="U.Psy"
            width="120"
            height="auto"
            style={{ margin: "0 auto 24px" }}
          />
          <Heading style={h1}>{t.title}</Heading>
          <Text style={text}>{t.hello}</Text>
          <Text style={text}>{intro?.trim() || t.intro}</Text>
          {items.map((it) => (
            <Section key={it.slug} style={card}>
              <Text style={category}>{it.category}</Text>
              <Heading as="h2" style={h2}>
                <Link
                  href={it.url}
                  style={{ color: "#1A1A1A", textDecoration: "none" }}
                >
                  {it.title}
                </Link>
              </Heading>
              <Text style={text}>{it.description}</Text>
              <Text style={meta}>
                {it.readMinutes} {t.minutes} ·{" "}
                <Link href={it.url} style={link}>
                  {t.read} →
                </Link>
              </Text>
            </Section>
          ))}
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              style={button}
              href={`${siteUrl}${prefix}/psychologists?utm_source=newsletter`}
            >
              {t.cta}
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            {t.footer}{" "}
            <Link href={unsubscribeUrl} style={footerLink}>
              {t.unsubscribe}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Confirm({
  lang,
  confirmUrl,
}: {
  lang: Lang;
  confirmUrl: string;
}) {
  const t = T[lang];
  return (
    <Html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Head />
      <Preview>{t.confirmPreview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={LOGO}
            alt="U.Psy"
            width="120"
            height="auto"
            style={{ margin: "0 auto 24px" }}
          />
          <Heading style={h1}>{t.confirmTitle}</Heading>
          <Text style={text}>{t.confirmBody}</Text>
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button style={button} href={confirmUrl}>
              {t.confirmCta}
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Inter, Arial, sans-serif",
};
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "600px" };
const h1 = {
  color: "#7A0C20",
  fontSize: "26px",
  fontWeight: "700",
  margin: "0 0 16px",
};
const h2 = {
  fontSize: "19px",
  fontWeight: "700",
  margin: "4px 0 8px",
  lineHeight: "1.3",
};
const text = {
  color: "#333333",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};
const card = { borderTop: "1px solid #eee2d4", padding: "20px 0" };
const category = {
  color: "#B07A00",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  margin: "12px 0 0",
};
const meta = { color: "#666666", fontSize: "13px", margin: "0" };
const link = { color: "#7A0C20", fontWeight: "600" };
const button = {
  backgroundColor: "#7A0C20",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 24px",
  textDecoration: "none",
};
const hr = { borderColor: "#eee2d4", margin: "24px 0" };
const footer = { color: "#888888", fontSize: "12px", lineHeight: "1.5" };
const footerLink = { color: "#888888", textDecoration: "underline" };
