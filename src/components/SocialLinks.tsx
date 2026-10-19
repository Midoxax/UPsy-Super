import { Instagram, Linkedin, Youtube } from "lucide-react";
import { SOCIAL_LINKS } from "@/content/legal/company";

const TikTok = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const LINKS = [
  { href: SOCIAL_LINKS.linkedin, label: "U.Psy on LinkedIn", Icon: Linkedin },
  {
    href: SOCIAL_LINKS.instagram,
    label: "U.Psy on Instagram",
    Icon: Instagram,
  },
  { href: SOCIAL_LINKS.tiktok, label: "U.Psy on TikTok", Icon: TikTok },
  { href: SOCIAL_LINKS.youtube, label: "U.Psy on YouTube", Icon: Youtube },
];

/** The official accounts, as a row of icon links (footer, contact page). */
export default function SocialLinks({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {LINKS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label={label}
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}
