import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Compass,
  Crown,
  Gauge,
  GraduationCap,
  Heart,
  HeartPulse,
  Landmark,
  LineChart,
  MapPin,
  Megaphone,
  MessageCircle,
  Presentation,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trophy,
  Umbrella,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

/**
 * Site navigation, one source for the desktop dropdowns and the mobile menu.
 *
 * Organised by who is reading (someone seeking care, an athlete, an
 * organisation, a psychologist, a learner), then "about". Every href is a
 * real public route; locale prefixes are added by the caller.
 *
 * Only structure lives here. The words are in the locale dictionaries under
 * `siteNav.*`, so French and Arabic load with their lazy dictionary instead
 * of all three languages sitting on the critical path.
 */

export type NavItem = {
  label: string;
  desc?: string;
  href: string;
  icon?: LucideIcon;
};

export type NavSection = {
  id: string;
  label: string;
  /** One line under the section title in the mobile menu. */
  intro: string;
  href: string;
  icon: LucideIcon;
  items: NavItem[];
};

export type NavCopy = {
  sections: NavSection[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  quickLinks: NavItem[];
  settings: string;
  account: string;
  menuTitle: string;
};

type ItemDef = { href: string; icon: LucideIcon; desc: boolean };

const QUICK: { href: string; icon: LucideIcon }[] = [
  { href: "/blog", icon: BookOpen },
  { href: "/pitch", icon: Presentation },
  { href: "/contact", icon: MessageCircle },
];

const SECTIONS: {
  id: string;
  href: string;
  icon: LucideIcon;
  items: ItemDef[];
}[] = [
  {
    id: "care",
    href: "/psychologists",
    icon: HeartPulse,
    items: [
      { href: "/psychologists", icon: Stethoscope, desc: true },
      { href: "/get-matched", icon: Compass, desc: true },
      { href: "/free-score", icon: Gauge, desc: true },
      { href: "/assessment-lab", icon: ClipboardCheck, desc: true },
      { href: "/psychologue-en-ligne", icon: Video, desc: true },
      { href: "/psychologue", icon: MapPin, desc: true },
      { href: "/services", icon: BookOpen, desc: true },
    ],
  },
  {
    id: "athletes",
    href: "/for-athletes",
    icon: Trophy,
    items: [
      { href: "/for-athletes", icon: Trophy, desc: true },
      { href: "/athlete-hub", icon: Activity, desc: true },
      { href: "/mental-toughness-athletes", icon: Brain, desc: true },
      { href: "/ai-assistant", icon: Sparkles, desc: true },
      { href: "/observatoire", icon: LineChart, desc: true },
    ],
  },
  {
    id: "organizations",
    href: "/for-organizations",
    icon: Building2,
    items: [
      { href: "/for-organizations", icon: Users, desc: true },
      {
        href: "/services/consulting-for-organizations",
        icon: Building2,
        desc: true,
      },
      { href: "/book-a-call", icon: CalendarCheck, desc: true },
      { href: "/pitch?for=company", icon: Presentation, desc: true },
      { href: "/talent-innovation-hub", icon: Sparkles, desc: true },
      { href: "/apply/organization", icon: Landmark, desc: true },
    ],
  },
  {
    id: "psychologists",
    href: "/campaigns/join-specialist",
    icon: ShieldCheck,
    items: [
      { href: "/campaigns/join-specialist", icon: UserPlus, desc: true },
      { href: "/apply", icon: ClipboardCheck, desc: true },
      { href: "/pricing-specialists", icon: Crown, desc: true },
      { href: "/campaigns/lsspm", icon: Award, desc: true },
      { href: "/academy", icon: GraduationCap, desc: true },
    ],
  },
  {
    id: "training",
    href: "/center",
    icon: GraduationCap,
    items: [
      { href: "/center", icon: Users, desc: true },
      { href: "/center/schools", icon: Landmark, desc: true },
      { href: "/learn", icon: BookOpen, desc: true },
      { href: "/learn?tab=certifications", icon: Award, desc: true },
      { href: "/skool", icon: MessageCircle, desc: true },
    ],
  },
  {
    id: "about",
    href: "/about",
    icon: Heart,
    items: [
      { href: "/about", icon: Heart, desc: false },
      { href: "/founder", icon: Award, desc: false },
      { href: "/why-us", icon: ShieldCheck, desc: false },
      { href: "/pitch", icon: Presentation, desc: false },
      { href: "/membership", icon: Crown, desc: false },
      { href: "/moroccan-umbrella", icon: Umbrella, desc: false },
      { href: "/psf", icon: Heart, desc: false },
      { href: "/press", icon: Megaphone, desc: false },
      { href: "/contact", icon: MessageCircle, desc: false },
    ],
  },
];

export function buildNav(t: (key: string) => string): NavCopy {
  const k = (path: string) => t(`siteNav.${path}`);
  return {
    menuTitle: k("menuTitle"),
    settings: k("settings"),
    account: k("account"),
    primaryCta: { label: k("primaryCta"), href: "/psychologists" },
    secondaryCta: { label: k("secondaryCta"), href: "/free-score" },
    quickLinks: QUICK.map((q, i) => ({ ...q, label: k(`quick.q${i}`) })),
    sections: SECTIONS.map((s) => ({
      id: s.id,
      href: s.href,
      icon: s.icon,
      label: k(`${s.id}.label`),
      intro: k(`${s.id}.intro`),
      items: s.items.map((it, i) => ({
        href: it.href,
        icon: it.icon,
        label: k(`${s.id}.i${i}`),
        ...(it.desc ? { desc: k(`${s.id}.i${i}Desc`) } : {}),
      })),
    })),
  };
}
