import { useLocale } from "@/contexts/LocaleContext";

/** Copy of /newsletter and /newsletter/$period (20261127120000_newsletter_web). */
const fr = {
  eyebrow: "La lettre U.Psy",
  title: "La santé mentale, un mois à la fois.",
  sub: "Chaque 1er du mois : les articles de nos psychologues, les formations à venir et une question pour vous. Un seul email, désinscription en un clic.",
  voted:
    "Merci, votre vote est enregistré. Le sujet le plus demandé ouvrira le prochain numéro.",
  inside: "Dans chaque numéro",
  perks: [
    {
      title: "L'article du mois",
      body: "Écrit par un psychologue du réseau, sourcé, lisible en moins de dix minutes.",
    },
    {
      title: "Les formations à venir",
      body: "Cours en direct, webinaires de la Ligue et replays, avec un lien pour s'inscrire.",
    },
    {
      title: "Vous choisissez le sujet",
      body: "Un clic sur un thème dans l'email : le plus demandé ouvre le numéro suivant.",
    },
  ],
  latest: "Le dernier numéro",
  readIssue: "Lire le numéro",
  read: "Lire",
  minutes: "min",
  archive: "Tous les numéros",
  articles: (n: number) => `${n} article${n > 1 ? "s" : ""}`,
  empty: "Le premier numéro arrive le 1er du mois prochain.",
  issue: "Numéro",
  back: "Tous les numéros",
  notFound: "Ce numéro n'existe pas ou n'a pas encore été envoyé.",
  bandTitle: "Où en êtes-vous en ce moment ?",
  bandText:
    "Faites le point en 2 minutes, ou parlez à un psychologue vérifié dans votre langue.",
  bandScore: "Faire le score gratuit",
  bandFind: "Trouver un psychologue",
  seoTitle: "Newsletter U.Psy : santé mentale et performance, chaque mois",
  seoDescription:
    "Un email par mois : les articles des psychologues U.Psy, les formations à venir et le sujet que vous choisissez. Archive de tous les numéros.",
};

type Copy = typeof fr;

const en: Copy = {
  eyebrow: "The U.Psy letter",
  title: "Mental health, one month at a time.",
  sub: "On the 1st of each month: our psychologists' articles, upcoming trainings and one question for you. A single email, unsubscribe in one click.",
  voted:
    "Thank you, your vote is in. The most requested topic opens the next issue.",
  inside: "In every issue",
  perks: [
    {
      title: "The read of the month",
      body: "Written by a psychologist from the network, with sources, under ten minutes.",
    },
    {
      title: "Upcoming trainings",
      body: "Live classes, League webinars and replays, with a link to register.",
    },
    {
      title: "You pick the topic",
      body: "One click on a theme in the email: the most requested opens the next issue.",
    },
  ],
  latest: "The latest issue",
  readIssue: "Read the issue",
  read: "Read",
  minutes: "min",
  archive: "All issues",
  articles: (n: number) => `${n} article${n > 1 ? "s" : ""}`,
  empty: "The first issue arrives on the 1st of next month.",
  issue: "Issue",
  back: "All issues",
  notFound: "This issue does not exist or has not been sent yet.",
  bandTitle: "Where are you right now?",
  bandText:
    "Take stock in 2 minutes, or talk to a verified psychologist in your language.",
  bandScore: "Take the free score",
  bandFind: "Find a psychologist",
  seoTitle: "U.Psy newsletter: mental health and performance, monthly",
  seoDescription:
    "One email a month: articles by U.Psy psychologists, upcoming trainings and the topic you choose. Archive of every issue.",
};

const ar: Copy = {
  eyebrow: "رسالة U.Psy",
  title: "الصحة النفسية، شهرًا بعد شهر.",
  sub: "في الأول من كل شهر: مقالات أخصائيينا، التكوينات القادمة وسؤال لك. بريد واحد، وإلغاء الاشتراك بنقرة.",
  voted: "شكرًا، تم تسجيل صوتك. الموضوع الأكثر طلبًا سيفتتح العدد المقبل.",
  inside: "في كل عدد",
  perks: [
    {
      title: "مقال الشهر",
      body: "يكتبه أخصائي من الشبكة، بمصادره، ويُقرأ في أقل من عشر دقائق.",
    },
    {
      title: "التكوينات القادمة",
      body: "دروس مباشرة، ندوات الرابطة وتسجيلاتها، مع رابط للتسجيل.",
    },
    {
      title: "أنت تختار الموضوع",
      body: "نقرة على موضوع في البريد: الأكثر طلبًا يفتتح العدد التالي.",
    },
  ],
  latest: "العدد الأخير",
  readIssue: "اقرأ العدد",
  read: "اقرأ",
  minutes: "د",
  archive: "كل الأعداد",
  articles: (n: number) => `${n} مقالات`,
  empty: "يصل العدد الأول في الأول من الشهر المقبل.",
  issue: "العدد",
  back: "كل الأعداد",
  notFound: "هذا العدد غير موجود أو لم يُرسَل بعد.",
  bandTitle: "أين أنت الآن؟",
  bandText: "قيّم حالتك في دقيقتين، أو تحدّث مع أخصائي موثَّق بلغتك.",
  bandScore: "المؤشر المجاني",
  bandFind: "ابحث عن أخصائي",
  seoTitle: "نشرة U.Psy: الصحة النفسية والأداء كل شهر",
  seoDescription:
    "بريد واحد في الشهر: مقالات أخصائيي U.Psy، التكوينات القادمة والموضوع الذي تختاره. أرشيف كل الأعداد.",
};

export function useNewsletterCopy() {
  const { locale } = useLocale();
  const t = locale === "ar" ? ar : locale === "en" ? en : fr;
  return { t, locale };
}

/** "décembre 2026" from "2026-12", in the reader's language. */
export function issueMonth(period: string, locale: string) {
  return new Date(`${period}-01T12:00:00Z`).toLocaleDateString(
    locale === "en" ? "en-GB" : locale === "ar" ? "ar-MA" : "fr-FR",
    { month: "long", year: "numeric" },
  );
}
