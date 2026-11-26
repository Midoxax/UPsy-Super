import { useLocale } from "@/contexts/LocaleContext";

/** Copy of the League portal's training desk (webinars run by U.Psy). */
const fr = {
  desk: "Formation",
  title: "Webinaires de la Ligue",
  intro:
    "Organisés et animés par U.Psy pour la Ligue : inscriptions, présence, certificats, replays et places payantes. Chiffres en temps réel.",
  period: "Année",
  webinars: "Webinaires",
  registered: "Inscrits",
  attended: "Présents",
  certificates: "Certificats",
  hours: "Heures de formation délivrées",
  revenue: "Places payantes",
  leagueShare: "Part de la Ligue",
  upsyShare: "Part U.Psy",
  licence: "Licence annuelle",
  date: "Date",
  webinar: "Webinaire",
  access: "Accès",
  accessOpen: "Ouvert",
  accessMembers: "Membres",
  accessPaid: "Payant",
  replay: "Replay",
  yes: "Oui",
  no: "—",
  none: "Aucun webinaire sur cette période.",
  export: "Exporter",
  mad: "MAD",
  manage: "Programmer un webinaire",
};

type Copy = typeof fr;

const en: Copy = {
  desk: "Training",
  title: "League webinars",
  intro:
    "Organised and hosted by U.Psy for the League: registrations, attendance, certificates, replays and paid seats. Live figures.",
  period: "Year",
  webinars: "Webinars",
  registered: "Registered",
  attended: "Attended",
  certificates: "Certificates",
  hours: "Training hours delivered",
  revenue: "Paid seats",
  leagueShare: "League share",
  upsyShare: "U.Psy share",
  licence: "Annual licence",
  date: "Date",
  webinar: "Webinar",
  access: "Access",
  accessOpen: "Open",
  accessMembers: "Members",
  accessPaid: "Paid",
  replay: "Replay",
  yes: "Yes",
  no: "—",
  none: "No webinar in this period.",
  export: "Export",
  mad: "MAD",
  manage: "Schedule a webinar",
};

const ar: Copy = {
  desk: "التكوين",
  title: "ندوات الرابطة",
  intro:
    "تنظمها وتنشطها U.Psy لفائدة الرابطة: التسجيلات، الحضور، الشهادات، التسجيلات المصورة والمقاعد المؤدى عنها. أرقام محيّنة.",
  period: "السنة",
  webinars: "الندوات",
  registered: "المسجَّلون",
  attended: "الحاضرون",
  certificates: "الشهادات",
  hours: "ساعات التكوين المقدَّمة",
  revenue: "المقاعد المؤدى عنها",
  leagueShare: "حصة الرابطة",
  upsyShare: "حصة U.Psy",
  licence: "الرخصة السنوية",
  date: "التاريخ",
  webinar: "الندوة",
  access: "الولوج",
  accessOpen: "مفتوح",
  accessMembers: "الأعضاء",
  accessPaid: "مؤدى عنه",
  replay: "التسجيل",
  yes: "نعم",
  no: "—",
  none: "لا توجد ندوات في هذه الفترة.",
  export: "تصدير",
  mad: "درهم",
  manage: "برمجة ندوة",
};

export function useTrainingCopy() {
  const { locale } = useLocale();
  return { t: locale === "ar" ? ar : locale === "en" ? en : fr, locale };
}
