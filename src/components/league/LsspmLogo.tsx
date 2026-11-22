import logo from "@/assets/lsspm-logo.webp";
import { LEAGUE_NAME } from "@/lib/league/membershipCopy";

/** The League's round emblem. */
export default function LsspmLogo({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <img
      src={logo}
      alt={LEAGUE_NAME}
      className={className}
      width={256}
      height={256}
      loading="lazy"
    />
  );
}
