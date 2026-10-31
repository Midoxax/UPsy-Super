// The U.Psy pitch in four acts: problem, solution, added value, call to
// action. One page, rewritten for whoever opens it (?for=athlete|club|
// psychologist|partner), so a link sent to a club reads as a club pitch.
//
// The structure borrows from the classic manuals: name the shift before the
// product (Andy Raskin's strategic narrative), give the answer first and the
// proof under it (Minto's pyramid), make the reader the hero and U.Psy the
// guide (StoryBrand), one concrete figure per claim (Made to Stick), and one
// clear next step with the risk taken away (Cialdini, risk reversal).
//
// Every figure is cited in REFERENCES and links to the paper. Platform claims
// are limited to what the product does today: no invented traction.
import type { Locale } from "@/lib/i18n/utils";

export const AUDIENCES = [
  "all",
  "athlete",
  "club",
  "psychologist",
  "partner",
] as const;
export type Audience = (typeof AUDIENCES)[number];
export type PitchLang = "fr" | "en" | "ar";

export function pitchLang(locale: Locale): PitchLang {
  return locale === "en" || locale === "ar" ? locale : "fr";
}

export function parseAudience(v: unknown): Audience {
  return AUDIENCES.includes(v as Audience) ? (v as Audience) : "all";
}

/** A name typed into a shared link: letters, spaces, apostrophes, hyphens. */
export function cleanRecipient(v: unknown): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/[^\p{L}\p{M} '’.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

export type ShareChannel = "copy" | "whatsapp" | "email" | "linkedin";

/** The link a visitor sends: audience, recipient and UTM tags for the CRM. */
export function pitchUrl(
  origin: string,
  path: string,
  audience: Audience,
  recipient: string,
  channel: ShareChannel,
): string {
  const q = new URLSearchParams();
  if (audience !== "all") q.set("for", audience);
  const to = cleanRecipient(recipient);
  if (to) q.set("to", to);
  q.set("utm_source", channel === "copy" ? "direct" : channel);
  q.set("utm_medium", "pitch");
  q.set("utm_campaign", "pitch");
  q.set("utm_content", audience);
  return `${origin.replace(/\/$/, "")}${path}?${q.toString()}`;
}

export interface Reference {
  id: number;
  authors: string;
  year: number;
  title: string;
  source: string;
  url: string;
}

// Verified on PubMed. Numbers in the copy ([1]…) point here.
export const REFERENCES: Reference[] = [
  {
    id: 1,
    authors: "Gouttebarge V, Castaldelli-Maia JM, Gorczynski P, et al.",
    year: 2019,
    title:
      "Occurrence of mental health symptoms and disorders in current and former elite athletes: a systematic review and meta-analysis",
    source: "British Journal of Sports Medicine 53(11):700–706",
    url: "https://doi.org/10.1136/bjsports-2019-100671",
  },
  {
    id: 2,
    authors: "Reardon CL, Hainline B, Aron CM, et al.",
    year: 2019,
    title:
      "Mental health in elite athletes: International Olympic Committee consensus statement (2019)",
    source: "British Journal of Sports Medicine 53(11):667–699",
    url: "https://doi.org/10.1136/bjsports-2019-100715",
  },
  {
    id: 3,
    authors: "Gulliver A, Griffiths KM, Christensen H.",
    year: 2012,
    title:
      "Barriers and facilitators to mental health help-seeking for young elite athletes: a qualitative study",
    source: "BMC Psychiatry 12:157",
    url: "https://doi.org/10.1186/1471-244X-12-157",
  },
  {
    id: 4,
    authors: "Brown DJ, Fletcher D.",
    year: 2017,
    title:
      "Effects of psychological and psychosocial interventions on sport performance: a meta-analysis",
    source: "Sports Medicine 47(1):77–99",
    url: "https://doi.org/10.1007/s40279-016-0552-7",
  },
  {
    id: 5,
    authors: "Kadri N, Agoub M, Assouab F, et al.",
    year: 2010,
    title:
      "Moroccan national study on prevalence of mental disorders: a community-based epidemiological study",
    source: "Acta Psychiatrica Scandinavica 121(1):71–74",
    url: "https://doi.org/10.1111/j.1600-0447.2009.01431.x",
  },
  {
    id: 6,
    authors: "Rice SM, Purcell R, De Silva S, et al.",
    year: 2016,
    title: "The mental health of elite athletes: a narrative systematic review",
    source: "Sports Medicine 46(9):1333–1353",
    url: "https://doi.org/10.1007/s40279-016-0492-2",
  },
];

/** Text with citations: [n] markers are rendered as links to REFERENCES. */
export type Cited = string;

export interface Stat {
  /** Shown big; a number is counted up on screen. */
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: Cited;
}

export interface Act {
  title: string;
  body: Cited;
  points: Cited[];
  stat?: Stat;
}

export interface Cta {
  title: string;
  body: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
  reassurance: string;
}

export interface AudiencePitch {
  label: string;
  hero: { title: string; accent: string; sub: Cited };
  problem: Act;
  solution: Act;
  value: Act;
  cta: Cta;
}

export interface PitchUi {
  eyebrow: string;
  preparedFor: string;
  audienceLabel: string;
  acts: [string, string, string, string];
  scroll: string;
  doorsTitle: string;
  references: string;
  referencesNote: string;
  resources: string;
  resourcesSub: string;
  resourceItems: {
    to: string;
    title: string;
    body: string;
    download?: boolean;
  }[];
  share: {
    title: string;
    sub: string;
    for: string;
    name: string;
    namePlaceholder: string;
    copy: string;
    copied: string;
    whatsapp: string;
    email: string;
    linkedin: string;
    print: string;
    message: string;
    subject: string;
  };
  readTime: string;
  deck: {
    start: string;
    prev: string;
    next: string;
    intro: string;
    send: string;
    hint: string;
  };
}

type Copy = { ui: PitchUi; audiences: Record<Audience, AudiencePitch> };

const en: Copy = {
  ui: {
    eyebrow: "U.Psy · The pitch in four acts",
    preparedFor: "Prepared for",
    audienceLabel: "Read as",
    acts: ["The problem", "The solution", "The added value", "Your move"],
    scroll: "Four acts, three minutes",
    doorsTitle: "Which door is yours?",
    references: "References",
    referencesNote:
      "Every figure on this page comes from a peer-reviewed source. Click to read the paper.",
    resources: "Media and resources",
    resourcesSub: "Everything you need to check, share or write about U.Psy.",
    resourceItems: [
      {
        to: "/observatoire",
        title: "Observatory",
        body: "Public data on mental health in Morocco.",
      },
      {
        to: "/press",
        title: "Press kit",
        body: "Boilerplate, founder bio, logos, press contact.",
      },
      {
        to: "/blog",
        title: "Articles",
        body: "Written by psychologists, in French and English.",
      },
      {
        to: "/academy",
        title: "Academy",
        body: "Training in sport and performance psychology.",
      },
      {
        to: "/founder",
        title: "The founder",
        body: "Mehdi Felji, clinical sport psychologist.",
      },
      {
        to: "/brand",
        title: "Brand",
        body: "Colours, typography and usage rules.",
      },
    ],
    share: {
      title: "Send this pitch",
      sub: "Pick who it is for. The page rewrites itself for them, and their name appears at the top.",
      for: "For",
      name: "Their name (optional)",
      namePlaceholder: "e.g. Coach Amine",
      copy: "Copy link",
      copied: "Link copied",
      whatsapp: "WhatsApp",
      email: "Email",
      linkedin: "LinkedIn",
      print: "Save as PDF",
      message:
        "Three minutes that change how you see the mental side of sport:",
      subject: "U.Psy, in four acts",
    },
    readTime: "3 min read",
    deck: {
      start: "Start the pitch",
      prev: "Previous",
      next: "Next",
      intro: "Intro",
      send: "Send and resources",
      hint: "Use the arrows, your keyboard or swipe",
    },
  },
  audiences: {
    all: {
      label: "Everyone",
      hero: {
        title: "Sport trained the body.",
        accent: "The mind is next.",
        sub: "One elite athlete in three lives with anxiety or depression symptoms [1], and most never ask for help [3]. U.Psy makes mental performance measurable, accessible and confidential, in four languages, from Morocco to the continent.",
      },
      problem: {
        title: "The deciding factor is the least prepared.",
        body: "Pressure, sleep, injury, selection: what decides the last seconds is mental. It is also the only part of preparation still left to chance, and asking for help still feels like weakness.",
        points: [
          "34% of current elite athletes report anxiety or depression symptoms [1]",
          "40.1% of Moroccans live with a current mental disorder [5]",
          "Stigma is the first barrier to seeking help [3]",
        ],
        stat: {
          value: 34,
          suffix: "%",
          label: "of elite athletes report anxiety or depression symptoms [1]",
        },
      },
      solution: {
        title:
          "One platform for the mind, built like a performance department.",
        body: "U.Psy connects athletes, clubs and individuals with verified psychologists, and gives them the tools to measure, train and follow the mind between sessions.",
        points: [
          "A free mental performance score: 12 questions, 2 minutes",
          "Verified psychologists, by video or in person, in Darija, Arabic, French or English",
          "The Athlete Hub: daily readiness, journal and protocols between sessions",
          "Programmes for clubs, federations and companies",
        ],
      },
      value: {
        title: "Measured progress, not motivational speeches.",
        body: "Psychological interventions improve sport performance with a moderate effect that is still there a month later [4]. U.Psy turns that evidence into a routine you can follow.",
        points: [
          "A score, then a trend over the season",
          "Mental strain spotted before it costs an injury or a career [2]",
          "Confidential by default: nothing is shared without consent",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label:
            "average effect of psychological interventions on sport performance [4]",
        },
      },
      cta: {
        title: "Your move.",
        body: "Pick the door that fits you. Each one takes less than two minutes to open.",
        primary: { label: "Take the free score", to: "/free-score" },
        secondary: { label: "Book a call", to: "/book-a-call" },
        reassurance: "Free to start. No commitment.",
      },
    },
    athlete: {
      label: "Athlete",
      hero: {
        title: "You train your body every day.",
        accent: "Your mind, only on match day?",
        sub: "One elite athlete in three lives with anxiety or depression symptoms [1]. The best prepare the mind like the rest: with a method, a measure and a professional.",
      },
      problem: {
        title:
          "What decides the final seconds is the one thing you don't train.",
        body: "Pressure, sleep, injury, selection, a bad run of form. You prepare everything else to the gram. The mind is left to chance, and talking about it still feels like weakness.",
        points: [
          "34% of current elite athletes report anxiety or depression symptoms [1]",
          "Mental strain raises injury risk and slows recovery [2]",
          "Stigma is the first reason athletes don't ask for help [3]",
        ],
        stat: {
          value: 34,
          suffix: "%",
          label: "of elite athletes report anxiety or depression symptoms [1]",
        },
      },
      solution: {
        title: "A psychologist who speaks sport, and your language.",
        body: "Start with a two-minute score. Then work with a verified psychologist, by video or in person, and keep training the mind every day in the Athlete Hub.",
        points: [
          "Free mental performance score: 12 questions, 2 minutes",
          "Verified psychologists in Darija, Arabic, French or English",
          "Athlete Hub: daily readiness check-in, journal, pre-competition protocols",
          "Confidential: your club sees nothing without your consent",
        ],
      },
      value: {
        title: "Train pressure like you train a set piece.",
        body: "In controlled trials, psychological interventions improve sport performance with a moderate effect, still visible a month later [4].",
        points: [
          "You know where you stand: a score, then a trend over the season",
          "You arrive at the big day with a routine, not with hope",
          "You protect your career: sleep, burnout and post-injury strain caught early [2]",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label:
            "average effect on sport performance, across 35 controlled trials [4]",
        },
      },
      cta: {
        title: "Know your mental score in two minutes.",
        body: "Free and private. You get your result straight away, with what to work on first.",
        primary: { label: "Take my free score", to: "/free-score" },
        secondary: { label: "Find my psychologist", to: "/psychologists" },
        reassurance: "Then 20% off your first session with the code WELCOME20.",
      },
    },
    club: {
      label: "Club or federation",
      hero: {
        title: "Your players' minds are",
        accent: "your least managed asset.",
        sub: "Clubs measure every sprint and every gram. Mental readiness, the factor that turns talent into results under pressure, is still handled after the crisis.",
      },
      problem: {
        title: "You find out when it's already a crisis.",
        body: "GPS, nutrition, physio: all measured daily. Mental strain shows up late, as a lost season, a repeated injury or a talent who quits. Players rarely bring it to the staff themselves.",
        points: [
          "One elite athlete in three reports anxiety or depression symptoms [1]",
          "The IOC links mental health symptoms to more injuries and slower recovery [2]",
          "Stigma keeps players from asking for help [3]",
        ],
        stat: {
          value: 1,
          suffix: " in 3",
          label: "elite athletes reports anxiety or depression symptoms [1]",
        },
      },
      solution: {
        title: "A mental performance department, without building one.",
        body: "U.Psy brings the method, the psychologists and the tools. You keep control of the programme; your players keep control of their data.",
        points: [
          "Squad screening with validated questionnaires",
          "Accredited psychologists on site or by video, in your players' languages",
          "Organisation dashboard for staff, with individual answers protected",
          "Workshops for coaches: spot the signs, start the conversation, refer",
        ],
      },
      value: {
        title: "Fewer lost players. A duty of care you can show.",
        body: "Psychological interventions improve sport performance [4]. Catching strain early protects the investment you have made in every player [2].",
        points: [
          "Earlier detection of burnout and post-injury strain",
          "Evidence of care for families, sponsors and federations",
          "Data your performance staff can read",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label:
            "average effect of psychological interventions on performance [4]",
        },
      },
      cta: {
        title: "Let's look at your squad's mental readiness.",
        body: "A short call with our team: your context, a pilot proposal, a price.",
        primary: { label: "Book a call", to: "/book-a-call" },
        secondary: {
          label: "See the organisations offer",
          to: "/for-organizations",
        },
        reassurance: "Start with one team. Scale only if it works.",
      },
    },
    psychologist: {
      label: "Psychologist",
      hero: {
        title: "The demand is there.",
        accent: "The infrastructure wasn't.",
        sub: "40.1% of Moroccans live with a current mental disorder [5]. U.Psy gives psychologists the profile, the bookings and the tools to reach them.",
      },
      problem: {
        title: "Your time goes to admin, not to patients.",
        body: "Finding a psychologist, booking, paying and following up still runs on phone calls and word of mouth. Patients give up before the first session, and you spend evenings on scheduling.",
        points: [
          "40.1% of Moroccans have a current mental disorder [5]",
          "Stigma and access are the first barriers to care [3]",
          "Athletes need psychologists who understand sport [2]",
        ],
        stat: {
          value: 40.1,
          decimals: 1,
          suffix: "%",
          label: "of Moroccans live with a current mental disorder [5]",
        },
      },
      solution: {
        title: "Your practice, online and accredited.",
        body: "A verified profile patients can trust, and everything around the session handled for you.",
        points: [
          "Verified profile seen by patients and athletes across Morocco",
          "Booking, video sessions, reminders and payments handled",
          "Clinical tools: assessments, session notes, summaries",
          "Referrals from clubs and athletes for sport psychology",
        ],
      },
      value: {
        title: "More patients, less admin, a recognised standard.",
        body: "You keep your practice and your methods. U.Psy brings visibility and takes the logistics.",
        points: [
          "0% platform commission for your first three months",
          "Work in your language, from your office or online",
          "Leave whenever you want",
        ],
        stat: {
          value: 0,
          suffix: "%",
          label: "platform commission for your first three months",
        },
      },
      cta: {
        title: "Open your accredited profile.",
        body: "Apply in a few minutes. Our team checks your file and puts your profile online.",
        primary: {
          label: "Apply as a psychologist",
          to: "/campaigns/join-specialist",
        },
        secondary: {
          label: "See specialist pricing",
          to: "/pricing-specialists",
        },
        reassurance: "No commission for three months. No lock-in.",
      },
    },
    partner: {
      label: "Partner, investor or media",
      hero: {
        title: "A huge need,",
        accent: "almost no infrastructure.",
        sub: "40.1% of Moroccans have a current mental disorder [5]. One elite athlete in three shows anxiety or depression symptoms [1]. U.Psy is building the platform the region is missing.",
      },
      problem: {
        title: "Mental health is a performance issue and a public health one.",
        body: "The IOC states that mental health cannot be separated from physical health [2]. Yet care remains fragmented, offline and hard to reach, and stigma keeps people away [3].",
        points: [
          "40.1% of Moroccans have a current mental disorder [5]",
          "34% of current elite athletes report anxiety or depression symptoms [1]",
          "Athletes are not protected by their fitness [6]",
        ],
        stat: {
          value: 40.1,
          decimals: 1,
          suffix: "%",
          label: "of Moroccans live with a current mental disorder [5]",
        },
      },
      solution: {
        title:
          "U.Psy: the platform for mental performance in Morocco and Africa.",
        body: "A marketplace of verified psychologists, programmes for organisations, and tools that keep people engaged between sessions.",
        points: [
          "Verified psychologists in four languages, by video or in person",
          "Programmes for clubs, federations and companies",
          "The Athlete Hub and a longitudinal athlete well-being study",
          "An open observatory of mental health data",
        ],
      },
      value: {
        title: "Impact that compounds.",
        body: "Every partnership funds access: sessions, screening and research. The evidence says it works [4]; U.Psy makes it reach people.",
        points: [
          "Visibility on a cause athletes and families care about",
          "Research-grade data, collected with consent, under Law 09-08",
          "A team led by a clinical sport psychologist",
        ],
        stat: { value: 4, label: "languages: Darija, Arabic, French, English" },
      },
      cta: {
        title: "Let's build it together.",
        body: "Investors, sponsors, institutions and media: one conversation is enough to see if it fits.",
        primary: { label: "Book a partner call", to: "/book-a-call" },
        secondary: { label: "Open the press kit", to: "/press" },
        reassurance: "Tell us who you are: the founder replies personally.",
      },
    },
  },
};

const fr: Copy = {
  ui: {
    eyebrow: "U.Psy · Le pitch en quatre actes",
    preparedFor: "Préparé pour",
    audienceLabel: "Lire en tant que",
    acts: [
      "Le problème",
      "La solution",
      "La valeur ajoutée",
      "À vous de jouer",
    ],
    scroll: "Quatre actes, trois minutes",
    doorsTitle: "Quelle porte est la vôtre ?",
    references: "Références",
    referencesNote:
      "Chaque chiffre de cette page vient d'une source scientifique publiée. Cliquez pour lire l'article.",
    resources: "Médias et ressources",
    resourcesSub: "Tout pour vérifier, partager ou écrire sur U.Psy.",
    resourceItems: [
      {
        to: "/observatoire",
        title: "Observatoire",
        body: "Données publiques sur la santé mentale au Maroc.",
      },
      {
        to: "/press",
        title: "Kit presse",
        body: "Présentation, biographie du fondateur, logos, contact presse.",
      },
      {
        to: "/blog",
        title: "Articles",
        body: "Écrits par des psychologues, en français et en anglais.",
      },
      {
        to: "/academy",
        title: "Académie",
        body: "Formations en psychologie du sport et de la performance.",
      },
      {
        to: "/founder",
        title: "Le fondateur",
        body: "Mehdi Felji, psychologue clinicien du sport.",
      },
      {
        to: "/brand",
        title: "Charte",
        body: "Couleurs, typographie et règles d'usage.",
      },
    ],
    share: {
      title: "Envoyer ce pitch",
      sub: "Choisissez à qui il s'adresse : la page se réécrit pour cette personne et son nom apparaît en haut.",
      for: "Pour",
      name: "Son prénom (facultatif)",
      namePlaceholder: "ex. Coach Amine",
      copy: "Copier le lien",
      copied: "Lien copié",
      whatsapp: "WhatsApp",
      email: "E-mail",
      linkedin: "LinkedIn",
      print: "Enregistrer en PDF",
      message:
        "Trois minutes qui changent le regard sur le mental dans le sport :",
      subject: "U.Psy, en quatre actes",
    },
    readTime: "3 min de lecture",
    deck: {
      start: "Commencer le pitch",
      prev: "Précédent",
      next: "Suivant",
      intro: "Intro",
      send: "Envoyer et ressources",
      hint: "Flèches, clavier ou glisser du doigt",
    },
  },
  audiences: {
    all: {
      label: "Tout le monde",
      hero: {
        title: "Le sport a entraîné le corps.",
        accent: "Le mental est le prochain.",
        sub: "Un sportif de haut niveau sur trois présente des symptômes d'anxiété ou de dépression [1], et la plupart ne demandent jamais d'aide [3]. U.Psy rend la performance mentale mesurable, accessible et confidentielle, en quatre langues, du Maroc au continent.",
      },
      problem: {
        title: "Le facteur décisif est le moins préparé.",
        body: "Pression, sommeil, blessure, sélection : ce qui décide des dernières secondes est mental. C'est aussi la seule partie de la préparation encore laissée au hasard, et demander de l'aide passe toujours pour une faiblesse.",
        points: [
          "34 % des sportifs de haut niveau en activité rapportent des symptômes d'anxiété ou de dépression [1]",
          "40,1 % des Marocains vivent avec un trouble mental actuel [5]",
          "La stigmatisation est le premier frein à la demande d'aide [3]",
        ],
        stat: {
          value: 34,
          suffix: " %",
          label:
            "des sportifs de haut niveau rapportent des symptômes d'anxiété ou de dépression [1]",
        },
      },
      solution: {
        title:
          "Une plateforme pour le mental, pensée comme un pôle performance.",
        body: "U.Psy relie sportifs, clubs et particuliers à des psychologues vérifiés, et leur donne les outils pour mesurer, entraîner et suivre le mental entre les séances.",
        points: [
          "Un score de performance mentale gratuit : 12 questions, 2 minutes",
          "Des psychologues vérifiés, en visio ou au cabinet, en darija, arabe, français ou anglais",
          "L'Athlete Hub : forme du jour, journal et protocoles entre les séances",
          "Des programmes pour clubs, fédérations et entreprises",
        ],
      },
      value: {
        title: "Des progrès mesurés, pas des discours de motivation.",
        body: "Les interventions psychologiques améliorent la performance sportive avec un effet modéré, toujours présent un mois plus tard [4]. U.Psy transforme ces preuves en une routine que l'on peut suivre.",
        points: [
          "Un score, puis une tendance sur la saison",
          "La charge mentale repérée avant qu'elle ne coûte une blessure ou une carrière [2]",
          "Confidentiel par défaut : rien n'est partagé sans consentement",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label:
            "effet moyen des interventions psychologiques sur la performance sportive [4]",
        },
      },
      cta: {
        title: "À vous de jouer.",
        body: "Choisissez la porte qui vous correspond. Chacune s'ouvre en moins de deux minutes.",
        primary: { label: "Faire le score gratuit", to: "/free-score" },
        secondary: { label: "Réserver un appel", to: "/book-a-call" },
        reassurance: "Gratuit pour commencer. Sans engagement.",
      },
    },
    athlete: {
      label: "Sportif",
      hero: {
        title: "Vous entraînez votre corps tous les jours.",
        accent: "Votre mental, seulement le jour du match ?",
        sub: "Un sportif de haut niveau sur trois présente des symptômes d'anxiété ou de dépression [1]. Les meilleurs préparent le mental comme le reste : avec une méthode, une mesure et un professionnel.",
      },
      problem: {
        title:
          "Ce qui décide des dernières secondes, c'est la seule chose que vous n'entraînez pas.",
        body: "Pression, sommeil, blessure, sélection, une mauvaise série. Tout le reste est préparé au gramme près. Le mental est laissé au hasard, et en parler passe encore pour une faiblesse.",
        points: [
          "34 % des sportifs de haut niveau en activité rapportent des symptômes d'anxiété ou de dépression [1]",
          "La charge mentale augmente le risque de blessure et ralentit la récupération [2]",
          "La stigmatisation est la première raison pour laquelle les sportifs ne demandent pas d'aide [3]",
        ],
        stat: {
          value: 34,
          suffix: " %",
          label:
            "des sportifs de haut niveau rapportent des symptômes d'anxiété ou de dépression [1]",
        },
      },
      solution: {
        title: "Un psychologue qui parle sport, et votre langue.",
        body: "Commencez par un score en deux minutes. Travaillez ensuite avec un psychologue vérifié, en visio ou au cabinet, et entraînez le mental chaque jour dans l'Athlete Hub.",
        points: [
          "Score de performance mentale gratuit : 12 questions, 2 minutes",
          "Psychologues vérifiés en darija, arabe, français ou anglais",
          "Athlete Hub : forme du jour, journal, protocoles d'avant-compétition",
          "Confidentiel : votre club ne voit rien sans votre accord",
        ],
      },
      value: {
        title: "Entraînez la pression comme une phase arrêtée.",
        body: "Dans les essais contrôlés, les interventions psychologiques améliorent la performance sportive avec un effet modéré, encore visible un mois plus tard [4].",
        points: [
          "Vous savez où vous en êtes : un score, puis une tendance sur la saison",
          "Vous arrivez au grand jour avec une routine, pas avec de l'espoir",
          "Vous protégez votre carrière : sommeil, épuisement et suites de blessure repérés tôt [2]",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label:
            "effet moyen sur la performance sportive, sur 35 essais contrôlés [4]",
        },
      },
      cta: {
        title: "Connaissez votre score mental en deux minutes.",
        body: "Gratuit et privé. Votre résultat s'affiche tout de suite, avec la priorité à travailler.",
        primary: { label: "Faire mon score gratuit", to: "/free-score" },
        secondary: { label: "Trouver mon psychologue", to: "/psychologists" },
        reassurance:
          "Puis 20 % de réduction sur votre première séance avec le code WELCOME20.",
      },
    },
    club: {
      label: "Club ou fédération",
      hero: {
        title: "Le mental de vos joueurs est",
        accent: "votre actif le moins piloté.",
        sub: "Les clubs mesurent chaque sprint et chaque gramme. La disponibilité mentale, ce qui transforme le talent en résultats sous pression, se gère encore après la crise.",
      },
      problem: {
        title: "Vous l'apprenez quand c'est déjà une crise.",
        body: "GPS, nutrition, kiné : tout est mesuré chaque jour. La charge mentale se voit tard, sous forme de saison perdue, de blessure à répétition ou de talent qui arrête. Les joueurs en parlent rarement au staff d'eux-mêmes.",
        points: [
          "Un sportif de haut niveau sur trois rapporte des symptômes d'anxiété ou de dépression [1]",
          "Le CIO relie les symptômes de santé mentale à plus de blessures et à une récupération plus lente [2]",
          "La stigmatisation empêche les joueurs de demander de l'aide [3]",
        ],
        stat: {
          value: 1,
          suffix: " sur 3",
          label:
            "sportif de haut niveau rapporte des symptômes d'anxiété ou de dépression [1]",
        },
      },
      solution: {
        title: "Un pôle performance mentale, sans avoir à le construire.",
        body: "U.Psy apporte la méthode, les psychologues et les outils. Vous gardez la main sur le programme ; vos joueurs gardent la main sur leurs données.",
        points: [
          "Dépistage de l'effectif avec des questionnaires validés",
          "Psychologues accrédités sur place ou en visio, dans les langues de vos joueurs",
          "Tableau de bord organisation pour le staff, réponses individuelles protégées",
          "Ateliers pour les entraîneurs : repérer, ouvrir la discussion, orienter",
        ],
      },
      value: {
        title: "Moins de joueurs perdus. Un devoir de protection démontrable.",
        body: "Les interventions psychologiques améliorent la performance sportive [4]. Repérer tôt la charge mentale protège l'investissement fait sur chaque joueur [2].",
        points: [
          "Détection plus précoce de l'épuisement et des suites de blessure",
          "Une protection visible pour les familles, les sponsors et les fédérations",
          "Des données lisibles par votre staff performance",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label:
            "effet moyen des interventions psychologiques sur la performance [4]",
        },
      },
      cta: {
        title: "Regardons ensemble la disponibilité mentale de votre effectif.",
        body: "Un court appel avec notre équipe : votre contexte, une proposition de pilote, un prix.",
        primary: { label: "Réserver un appel", to: "/book-a-call" },
        secondary: {
          label: "Voir l'offre organisations",
          to: "/for-organizations",
        },
        reassurance:
          "On commence par une équipe. On étend seulement si ça marche.",
      },
    },
    psychologist: {
      label: "Psychologue",
      hero: {
        title: "La demande est là.",
        accent: "L'infrastructure manquait.",
        sub: "40,1 % des Marocains vivent avec un trouble mental actuel [5]. U.Psy donne aux psychologues le profil, les réservations et les outils pour les atteindre.",
      },
      problem: {
        title: "Votre temps part dans l'administratif, pas chez vos patients.",
        body: "Trouver un psychologue, réserver, payer, assurer le suivi : tout passe encore par le téléphone et le bouche-à-oreille. Les patients abandonnent avant la première séance, et vos soirées partent dans les plannings.",
        points: [
          "40,1 % des Marocains ont un trouble mental actuel [5]",
          "La stigmatisation et l'accès sont les premiers freins aux soins [3]",
          "Les sportifs ont besoin de psychologues qui comprennent le sport [2]",
        ],
        stat: {
          value: 40.1,
          decimals: 1,
          suffix: " %",
          label: "des Marocains vivent avec un trouble mental actuel [5]",
        },
      },
      solution: {
        title: "Votre cabinet, en ligne et accrédité.",
        body: "Un profil vérifié auquel les patients font confiance, et tout ce qui entoure la séance géré pour vous.",
        points: [
          "Profil vérifié, visible par les patients et les sportifs dans tout le Maroc",
          "Réservations, visio, rappels et paiements gérés",
          "Outils cliniques : évaluations, notes de séance, synthèses",
          "Orientations de clubs et de sportifs en psychologie du sport",
        ],
      },
      value: {
        title: "Plus de patients, moins d'administratif, un standard reconnu.",
        body: "Vous gardez votre cabinet et vos méthodes. U.Psy apporte la visibilité et prend la logistique.",
        points: [
          "0 % de commission plateforme pendant vos trois premiers mois",
          "Travaillez dans votre langue, au cabinet ou en ligne",
          "Partez quand vous voulez",
        ],
        stat: {
          value: 0,
          suffix: " %",
          label: "de commission plateforme pendant vos trois premiers mois",
        },
      },
      cta: {
        title: "Ouvrez votre profil accrédité.",
        body: "Candidatez en quelques minutes. Notre équipe vérifie votre dossier et met votre profil en ligne.",
        primary: {
          label: "Candidater comme psychologue",
          to: "/campaigns/join-specialist",
        },
        secondary: {
          label: "Voir les tarifs spécialistes",
          to: "/pricing-specialists",
        },
        reassurance: "Aucune commission pendant trois mois. Sans engagement.",
      },
    },
    partner: {
      label: "Partenaire, investisseur ou média",
      hero: {
        title: "Un besoin immense,",
        accent: "presque aucune infrastructure.",
        sub: "40,1 % des Marocains ont un trouble mental actuel [5]. Un sportif de haut niveau sur trois présente des symptômes d'anxiété ou de dépression [1]. U.Psy construit la plateforme qui manque à la région.",
      },
      problem: {
        title:
          "La santé mentale est un enjeu de performance et de santé publique.",
        body: "Le CIO affirme que la santé mentale ne peut être séparée de la santé physique [2]. Pourtant, les soins restent fragmentés, hors ligne et difficiles d'accès, et la stigmatisation éloigne les gens [3].",
        points: [
          "40,1 % des Marocains ont un trouble mental actuel [5]",
          "34 % des sportifs de haut niveau en activité rapportent des symptômes d'anxiété ou de dépression [1]",
          "La condition physique ne protège pas les sportifs [6]",
        ],
        stat: {
          value: 40.1,
          decimals: 1,
          suffix: " %",
          label: "des Marocains vivent avec un trouble mental actuel [5]",
        },
      },
      solution: {
        title:
          "U.Psy : la plateforme de la performance mentale au Maroc et en Afrique.",
        body: "Une place de marché de psychologues vérifiés, des programmes pour les organisations et des outils qui maintiennent l'engagement entre les séances.",
        points: [
          "Psychologues vérifiés en quatre langues, en visio ou au cabinet",
          "Programmes pour clubs, fédérations et entreprises",
          "L'Athlete Hub et une étude longitudinale sur le bien-être des sportifs",
          "Un observatoire ouvert des données de santé mentale",
        ],
      },
      value: {
        title: "Un impact qui se cumule.",
        body: "Chaque partenariat finance l'accès : séances, dépistage et recherche. Les preuves montrent que ça marche [4] ; U.Psy le fait arriver jusqu'aux gens.",
        points: [
          "De la visibilité sur une cause qui compte pour les sportifs et les familles",
          "Des données de niveau recherche, recueillies avec consentement, sous la loi 09-08",
          "Une équipe dirigée par un psychologue clinicien du sport",
        ],
        stat: { value: 4, label: "langues : darija, arabe, français, anglais" },
      },
      cta: {
        title: "Construisons-le ensemble.",
        body: "Investisseurs, sponsors, institutions et médias : une conversation suffit pour voir si ça colle.",
        primary: { label: "Réserver un appel partenaire", to: "/book-a-call" },
        secondary: { label: "Ouvrir le kit presse", to: "/press" },
        reassurance:
          "Dites-nous qui vous êtes : le fondateur vous répond personnellement.",
      },
    },
  },
};

const ar: Copy = {
  ui: {
    eyebrow: "U.Psy · العرض في أربعة فصول",
    preparedFor: "أُعدّ خصيصًا لـ",
    audienceLabel: "اقرأ بصفتك",
    acts: ["المشكلة", "الحل", "القيمة المضافة", "دورك الآن"],
    scroll: "أربعة فصول، ثلاث دقائق",
    doorsTitle: "أيّ باب يناسبك؟",
    references: "المراجع",
    referencesNote:
      "كل رقم في هذه الصفحة مأخوذ من مصدر علمي محكّم. انقر لقراءة الدراسة.",
    resources: "الإعلام والموارد",
    resourcesSub: "كل ما تحتاجه للتحقق من U.Psy أو مشاركتها أو الكتابة عنها.",
    resourceItems: [
      {
        to: "/observatoire",
        title: "المرصد",
        body: "بيانات عامة عن الصحة النفسية في المغرب.",
      },
      {
        to: "/press",
        title: "الملف الصحفي",
        body: "نبذة، سيرة المؤسس، الشعارات، جهة الاتصال الصحفي.",
      },
      {
        to: "/blog",
        title: "مقالات",
        body: "يكتبها أخصائيون نفسيون بالفرنسية والإنجليزية.",
      },
      {
        to: "/academy",
        title: "الأكاديمية",
        body: "تكوينات في علم النفس الرياضي وعلم نفس الأداء.",
      },
      {
        to: "/founder",
        title: "المؤسس",
        body: "مهدي فلجي، أخصائي نفسي إكلينيكي رياضي.",
      },
      {
        to: "/brand",
        title: "الهوية البصرية",
        body: "الألوان والخطوط وقواعد الاستعمال.",
      },
    ],
    share: {
      title: "أرسل هذا العرض",
      sub: "اختر لمن هو موجّه: تُعاد كتابة الصفحة له ويظهر اسمه في أعلاها.",
      for: "إلى",
      name: "اسمه (اختياري)",
      namePlaceholder: "مثال: المدرب أمين",
      copy: "نسخ الرابط",
      copied: "تم نسخ الرابط",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      linkedin: "لينكدإن",
      print: "حفظ بصيغة PDF",
      message: "ثلاث دقائق تغيّر نظرتك إلى الجانب الذهني في الرياضة:",
      subject: "U.Psy في أربعة فصول",
    },
    readTime: "قراءة في 3 دقائق",
    deck: {
      start: "ابدأ العرض",
      prev: "السابق",
      next: "التالي",
      intro: "مقدمة",
      send: "الإرسال والموارد",
      hint: "استعمل الأسهم أو لوحة المفاتيح أو اسحب بإصبعك",
    },
  },
  audiences: {
    all: {
      label: "الجميع",
      hero: {
        title: "درّبت الرياضة الجسد.",
        accent: "والآن جاء دور الذهن.",
        sub: "رياضي واحد من كل ثلاثة رياضيين من النخبة يعاني أعراض القلق أو الاكتئاب [1]، وأغلبهم لا يطلبون المساعدة أبدًا [3]. تجعل U.Psy الأداء الذهني قابلًا للقياس، متاحًا وسريًا، بأربع لغات، من المغرب إلى القارة.",
      },
      problem: {
        title: "العامل الحاسم هو الأقل تحضيرًا.",
        body: "الضغط، النوم، الإصابة، الاختيار: ما يحسم الثواني الأخيرة ذهني. وهو أيضًا الجزء الوحيد من التحضير الذي ما زال متروكًا للصدفة، وطلب المساعدة ما زال يُعدّ ضعفًا.",
        points: [
          "34٪ من رياضيي النخبة الممارسين يبلّغون عن أعراض القلق أو الاكتئاب [1]",
          "40.1٪ من المغاربة يعانون حاليًا من اضطراب نفسي [5]",
          "الوصم هو العائق الأول أمام طلب المساعدة [3]",
        ],
        stat: {
          value: 34,
          suffix: "٪",
          label: "من رياضيي النخبة يبلّغون عن أعراض القلق أو الاكتئاب [1]",
        },
      },
      solution: {
        title: "منصة واحدة للذهن، مصمّمة كقسم للأداء.",
        body: "تربط U.Psy الرياضيين والأندية والأفراد بأخصائيين نفسيين موثوقين، وتمنحهم أدوات لقياس الذهن وتدريبه ومتابعته بين الحصص.",
        points: [
          "مؤشر مجاني للأداء الذهني: 12 سؤالًا، دقيقتان",
          "أخصائيون موثوقون عن بعد أو في العيادة، بالدارجة والعربية والفرنسية والإنجليزية",
          "Athlete Hub: الجاهزية اليومية، اليوميات والبروتوكولات بين الحصص",
          "برامج للأندية والجامعات الرياضية والشركات",
        ],
      },
      value: {
        title: "تقدّم مقيس، لا خطابات تحفيزية.",
        body: "تحسّن التدخلات النفسية الأداء الرياضي بأثر متوسط يبقى قائمًا بعد شهر [4]. تحوّل U.Psy هذه الأدلة إلى روتين يمكن متابعته.",
        points: [
          "مؤشر، ثم منحنى على امتداد الموسم",
          "رصد العبء الذهني قبل أن يكلّف إصابة أو مسيرة [2]",
          "سري افتراضيًا: لا شيء يُشارَك دون موافقة",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label: "متوسط أثر التدخلات النفسية على الأداء الرياضي [4]",
        },
      },
      cta: {
        title: "دورك الآن.",
        body: "اختر الباب الذي يناسبك. كل باب يُفتح في أقل من دقيقتين.",
        primary: { label: "اجتز المؤشر المجاني", to: "/free-score" },
        secondary: { label: "احجز مكالمة", to: "/book-a-call" },
        reassurance: "البداية مجانية. دون أي التزام.",
      },
    },
    athlete: {
      label: "رياضي",
      hero: {
        title: "تدرّب جسدك كل يوم.",
        accent: "وذهنك، يوم المباراة فقط؟",
        sub: "رياضي واحد من كل ثلاثة من النخبة يعاني أعراض القلق أو الاكتئاب [1]. الأفضل يحضّرون الذهن كما يحضّرون الباقي: بمنهج وقياس ومختص.",
      },
      problem: {
        title: "ما يحسم الثواني الأخيرة هو الشيء الوحيد الذي لا تدرّبه.",
        body: "الضغط، النوم، الإصابة، الاختيار، سلسلة نتائج سيئة. كل شيء آخر محضّر بدقة. أما الذهن فمتروك للصدفة، والحديث عنه ما زال يُعدّ ضعفًا.",
        points: [
          "34٪ من رياضيي النخبة الممارسين يبلّغون عن أعراض القلق أو الاكتئاب [1]",
          "العبء الذهني يرفع خطر الإصابة ويبطئ التعافي [2]",
          "الوصم هو السبب الأول لعدم طلب الرياضيين للمساعدة [3]",
        ],
        stat: {
          value: 34,
          suffix: "٪",
          label: "من رياضيي النخبة يبلّغون عن أعراض القلق أو الاكتئاب [1]",
        },
      },
      solution: {
        title: "أخصائي يفهم الرياضة ويتكلم لغتك.",
        body: "ابدأ بمؤشر في دقيقتين. ثم اعمل مع أخصائي موثوق عن بعد أو في العيادة، وواصل تدريب ذهنك يوميًا في Athlete Hub.",
        points: [
          "مؤشر مجاني للأداء الذهني: 12 سؤالًا، دقيقتان",
          "أخصائيون موثوقون بالدارجة والعربية والفرنسية والإنجليزية",
          "Athlete Hub: الجاهزية اليومية، اليوميات، بروتوكولات ما قبل المنافسة",
          "سري: ناديك لا يرى شيئًا دون موافقتك",
        ],
      },
      value: {
        title: "درّب الضغط كما تدرّب كرة ثابتة.",
        body: "في التجارب المضبوطة، تحسّن التدخلات النفسية الأداء الرياضي بأثر متوسط يبقى ظاهرًا بعد شهر [4].",
        points: [
          "تعرف أين أنت: مؤشر، ثم منحنى على امتداد الموسم",
          "تصل إلى اليوم الكبير بروتين، لا بالأمل",
          "تحمي مسيرتك: رصد مبكر لاضطرابات النوم والإنهاك وتبعات الإصابة [2]",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label: "متوسط الأثر على الأداء الرياضي عبر 35 تجربة مضبوطة [4]",
        },
      },
      cta: {
        title: "اعرف مؤشرك الذهني في دقيقتين.",
        body: "مجاني وخاص. تظهر نتيجتك فورًا مع أول ما يجب العمل عليه.",
        primary: { label: "اجتز مؤشري المجاني", to: "/free-score" },
        secondary: { label: "اعثر على أخصائيي", to: "/psychologists" },
        reassurance: "ثم خصم 20٪ على حصتك الأولى بالرمز WELCOME20.",
      },
    },
    club: {
      label: "نادٍ أو جامعة رياضية",
      hero: {
        title: "ذهن لاعبيك هو",
        accent: "الأصل الأقل إدارة لديك.",
        sub: "تقيس الأندية كل انطلاقة وكل غرام. أما الجاهزية الذهنية، التي تحوّل الموهبة إلى نتائج تحت الضغط، فما زالت تُدار بعد الأزمة.",
      },
      problem: {
        title: "تكتشف الأمر حين يصبح أزمة.",
        body: "GPS، التغذية، الترويض الطبي: كل شيء يُقاس يوميًا. أما العبء الذهني فيظهر متأخرًا: موسم ضائع، إصابة متكررة أو موهبة تعتزل. ونادرًا ما يتحدث اللاعبون عنه للطاقم من تلقاء أنفسهم.",
        points: [
          "رياضي واحد من كل ثلاثة من النخبة يبلّغ عن أعراض القلق أو الاكتئاب [1]",
          "تربط اللجنة الأولمبية الدولية أعراض الصحة النفسية بمزيد من الإصابات وتعافٍ أبطأ [2]",
          "الوصم يمنع اللاعبين من طلب المساعدة [3]",
        ],
        stat: {
          value: 1,
          suffix: " من 3",
          label: "رياضيي النخبة يبلّغ عن أعراض القلق أو الاكتئاب [1]",
        },
      },
      solution: {
        title: "قسم للأداء الذهني، دون الحاجة إلى بنائه.",
        body: "تجلب U.Psy المنهج والأخصائيين والأدوات. تحتفظ أنت بالتحكم في البرنامج، ويحتفظ لاعبوك بالتحكم في بياناتهم.",
        points: [
          "فحص الفريق باستبيانات مُحكّمة",
          "أخصائيون معتمدون في عين المكان أو عن بعد، بلغات لاعبيك",
          "لوحة قيادة للطاقم مع حماية الإجابات الفردية",
          "ورشات للمدربين: الرصد، فتح الحوار، التوجيه",
        ],
      },
      value: {
        title: "لاعبون أقل ضياعًا. واجب حماية يمكن إثباته.",
        body: "تحسّن التدخلات النفسية الأداء الرياضي [4]. والرصد المبكر للعبء الذهني يحمي الاستثمار في كل لاعب [2].",
        points: [
          "رصد أبكر للإنهاك وتبعات الإصابة",
          "حماية ظاهرة للعائلات والرعاة والجامعات",
          "بيانات يقرؤها طاقم الأداء",
        ],
        stat: {
          value: 0.57,
          decimals: 2,
          prefix: "g = ",
          label: "متوسط أثر التدخلات النفسية على الأداء [4]",
        },
      },
      cta: {
        title: "لننظر معًا في الجاهزية الذهنية لفريقك.",
        body: "مكالمة قصيرة مع فريقنا: سياقك، مقترح تجربة أولى، وثمن.",
        primary: { label: "احجز مكالمة", to: "/book-a-call" },
        secondary: {
          label: "اطّلع على عرض المؤسسات",
          to: "/for-organizations",
        },
        reassurance: "نبدأ بفريق واحد، ولا نتوسع إلا إذا نجحت التجربة.",
      },
    },
    psychologist: {
      label: "أخصائي نفسي",
      hero: {
        title: "الطلب موجود.",
        accent: "البنية التحتية هي التي كانت غائبة.",
        sub: "40.1٪ من المغاربة يعانون حاليًا من اضطراب نفسي [5]. تمنح U.Psy الأخصائيين الملف والحجوزات والأدوات للوصول إليهم.",
      },
      problem: {
        title: "وقتك يذهب في الإدارة، لا في المرضى.",
        body: "إيجاد أخصائي، الحجز، الدفع، المتابعة: كل ذلك ما زال يمر عبر الهاتف والتوصيات الشفهية. يتراجع المرضى قبل الحصة الأولى، وتضيع أمسياتك في الجداول.",
        points: [
          "40.1٪ من المغاربة يعانون حاليًا من اضطراب نفسي [5]",
          "الوصم وصعوبة الوصول أول عوائق العلاج [3]",
          "يحتاج الرياضيون إلى أخصائيين يفهمون الرياضة [2]",
        ],
        stat: {
          value: 40.1,
          decimals: 1,
          suffix: "٪",
          label: "من المغاربة يعانون حاليًا من اضطراب نفسي [5]",
        },
      },
      solution: {
        title: "عيادتك، على الإنترنت ومعتمدة.",
        body: "ملف موثّق يثق به المرضى، وكل ما يحيط بالحصة نتكفل به عنك.",
        points: [
          "ملف موثّق يراه المرضى والرياضيون في كل المغرب",
          "الحجوزات، الحصص المرئية، التذكيرات والمدفوعات",
          "أدوات إكلينيكية: تقييمات، ملاحظات الحصص، ملخصات",
          "إحالات من الأندية والرياضيين في علم النفس الرياضي",
        ],
      },
      value: {
        title: "مرضى أكثر، إدارة أقل، معيار معترف به.",
        body: "تحتفظ بعيادتك وبمنهجك. تجلب U.Psy الظهور وتتكفل باللوجستيك.",
        points: [
          "0٪ عمولة على المنصة خلال الأشهر الثلاثة الأولى",
          "اعمل بلغتك، في عيادتك أو عن بعد",
          "تغادر متى شئت",
        ],
        stat: {
          value: 0,
          suffix: "٪",
          label: "عمولة على المنصة خلال الأشهر الثلاثة الأولى",
        },
      },
      cta: {
        title: "افتح ملفك المعتمد.",
        body: "قدّم طلبك في دقائق. يتحقق فريقنا من ملفك وينشره.",
        primary: {
          label: "قدّم طلبك كأخصائي",
          to: "/campaigns/join-specialist",
        },
        secondary: {
          label: "اطّلع على أسعار المختصين",
          to: "/pricing-specialists",
        },
        reassurance: "دون عمولة لثلاثة أشهر. دون التزام.",
      },
    },
    partner: {
      label: "شريك أو مستثمر أو إعلام",
      hero: {
        title: "حاجة هائلة،",
        accent: "وبنية تحتية شبه منعدمة.",
        sub: "40.1٪ من المغاربة يعانون حاليًا من اضطراب نفسي [5]. رياضي واحد من كل ثلاثة من النخبة تظهر عليه أعراض القلق أو الاكتئاب [1]. تبني U.Psy المنصة التي تفتقدها المنطقة.",
      },
      problem: {
        title: "الصحة النفسية قضية أداء وقضية صحة عامة.",
        body: "تؤكد اللجنة الأولمبية الدولية أن الصحة النفسية لا تنفصل عن الصحة البدنية [2]. ومع ذلك تبقى الرعاية مجزأة وغير رقمية وصعبة الوصول، والوصم يُبعد الناس [3].",
        points: [
          "40.1٪ من المغاربة يعانون حاليًا من اضطراب نفسي [5]",
          "34٪ من رياضيي النخبة الممارسين يبلّغون عن أعراض القلق أو الاكتئاب [1]",
          "اللياقة البدنية لا تحمي الرياضيين [6]",
        ],
        stat: {
          value: 40.1,
          decimals: 1,
          suffix: "٪",
          label: "من المغاربة يعانون حاليًا من اضطراب نفسي [5]",
        },
      },
      solution: {
        title: "U.Psy: منصة الأداء الذهني في المغرب وإفريقيا.",
        body: "سوق لأخصائيين نفسيين موثوقين، برامج للمؤسسات، وأدوات تحافظ على الالتزام بين الحصص.",
        points: [
          "أخصائيون موثوقون بأربع لغات، عن بعد أو في العيادة",
          "برامج للأندية والجامعات الرياضية والشركات",
          "Athlete Hub ودراسة طولية حول رفاه الرياضيين",
          "مرصد مفتوح لبيانات الصحة النفسية",
        ],
      },
      value: {
        title: "أثر يتراكم.",
        body: "كل شراكة تموّل الوصول: حصص، فحص وبحث. الأدلة تقول إن ذلك ينجح [4]، وU.Psy توصله إلى الناس.",
        points: [
          "ظهور في قضية تهم الرياضيين والعائلات",
          "بيانات بمستوى البحث العلمي، تُجمع بموافقة وفق القانون 09-08",
          "فريق يقوده أخصائي نفسي إكلينيكي رياضي",
        ],
        stat: {
          value: 4,
          label: "لغات: الدارجة، العربية، الفرنسية، الإنجليزية",
        },
      },
      cta: {
        title: "لنبنِه معًا.",
        body: "مستثمرون، رعاة، مؤسسات وإعلام: محادثة واحدة تكفي لمعرفة إن كان الأمر مناسبًا.",
        primary: { label: "احجز مكالمة شراكة", to: "/book-a-call" },
        secondary: { label: "افتح الملف الصحفي", to: "/press" },
        reassurance: "عرّفنا بنفسك: سيردّ عليك المؤسس شخصيًا.",
      },
    },
  },
};

const registry: Record<PitchLang, Copy> = { en, fr, ar };

export function pitchCopy(lang: PitchLang): Copy {
  return registry[lang];
}

/** Splits "text [1] more [2,4]" into text and citation parts. */
export function splitCitations(s: Cited): Array<string | number[]> {
  const out: Array<string | number[]> = [];
  let last = 0;
  for (const m of s.matchAll(/\s?\[(\d+(?:,\s?\d+)*)\]/g)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    out.push(m[1].split(",").map((n) => Number(n.trim())));
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
