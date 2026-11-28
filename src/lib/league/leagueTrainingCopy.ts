import { useLocale } from "@/contexts/LocaleContext";

/** Copy of /learn/lsspm: the League's training inside U.Psy's training center. */
const fr = {
  badge: "LSSPM × U.Psy",
  title: "La formation continue de la Ligue.",
  sub: "Les webinaires de la Ligue des spécialistes de la santé psychique et mentale, organisés et animés par U.Psy : programme, inscription, certificats de présence et replays.",
  join: "Adhérer à la Ligue",
  allLive: "Tous les cours en direct",
  replays: "Replays",
  facts: [
    {
      title: "Certificat de présence",
      body: "Délivré automatiquement après 75 % de présence, avec les heures de formation.",
    },
    {
      title: "Compte pour la Ligue",
      body: "Chaque webinaire suivi par un membre s'ajoute à sa participation.",
    },
    {
      title: "Replays pour les membres",
      body: "Les membres revoient les webinaires de la Ligue, même sans s'être inscrits.",
    },
  ],
  programme: "Programme",
  desk: "Tableau de bord de la Ligue",
  deskSub: "Réservé à l'équipe de la Ligue et à U.Psy.",
  seoTitle:
    "Formation continue de la Ligue (LSSPM) | Centre de formation U.Psy",
  seoDescription:
    "Webinaires de la Ligue des spécialistes de la santé psychique et mentale, organisés par U.Psy : programme, inscription, certificats de présence et replays.",
  learnTitle: "Formation de la Ligue (LSSPM)",
  learnSub:
    "Webinaires, certificats et replays pour les membres de la Ligue, organisés par U.Psy.",
  learnCta: "Voir le programme",
};

type Copy = typeof fr;

const en: Copy = {
  badge: "LSSPM × U.Psy",
  title: "The League's continuing education.",
  sub: "Webinars of the League of psychic and mental health specialists, organised and hosted by U.Psy: programme, registration, attendance certificates and replays.",
  join: "Join the League",
  allLive: "All live classes",
  replays: "Replays",
  facts: [
    {
      title: "Attendance certificate",
      body: "Issued automatically after 75% attendance, with the training hours.",
    },
    {
      title: "Counts for the League",
      body: "Every webinar a member attends adds to their participation.",
    },
    {
      title: "Replays for members",
      body: "Members can rewatch the League's webinars, even without registering.",
    },
  ],
  programme: "Programme",
  desk: "League dashboard",
  deskSub: "For the League's team and U.Psy only.",
  seoTitle: "League (LSSPM) continuing education | U.Psy training center",
  seoDescription:
    "Webinars of the League of psychic and mental health specialists, run by U.Psy: programme, registration, attendance certificates and replays.",
  learnTitle: "League training (LSSPM)",
  learnSub:
    "Webinars, certificates and replays for League members, run by U.Psy.",
  learnCta: "See the programme",
};

const ar: Copy = {
  badge: "LSSPM × U.Psy",
  title: "التكوين المستمر للرابطة.",
  sub: "ندوات رابطة المختصين في الصحة النفسية والعقلية، تنظمها وتنشطها U.Psy: البرنامج، التسجيل، شهادات الحضور والتسجيلات.",
  join: "الانخراط في الرابطة",
  allLive: "كل الدروس المباشرة",
  replays: "التسجيلات",
  facts: [
    {
      title: "شهادة الحضور",
      body: "تُسلَّم تلقائيًا بعد حضور 75 %، مع ساعات التكوين.",
    },
    {
      title: "تُحتسب في الرابطة",
      body: "كل ندوة يحضرها العضو تُضاف إلى مشاركته.",
    },
    {
      title: "التسجيلات للأعضاء",
      body: "يمكن للأعضاء مشاهدة ندوات الرابطة من جديد، حتى دون تسجيل مسبق.",
    },
  ],
  programme: "البرنامج",
  desk: "لوحة قيادة الرابطة",
  deskSub: "خاصة بفريق الرابطة و U.Psy.",
  seoTitle: "التكوين المستمر للرابطة (LSSPM) | مركز التكوين U.Psy",
  seoDescription:
    "ندوات رابطة المختصين في الصحة النفسية والعقلية، تنظمها U.Psy: البرنامج، التسجيل، شهادات الحضور والتسجيلات.",
  learnTitle: "تكوين الرابطة (LSSPM)",
  learnSub: "ندوات وشهادات وتسجيلات لأعضاء الرابطة، تنظمها U.Psy.",
  learnCta: "اطّلع على البرنامج",
};

export function useLeagueTrainingCopy() {
  const { locale } = useLocale();
  return { t: locale === "ar" ? ar : locale === "en" ? en : fr, locale };
}
