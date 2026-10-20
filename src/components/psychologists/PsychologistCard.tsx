import { PsychologistProfile } from "@/types/psychologist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Globe,
  User,
  Award,
  Star,
  Calendar,
  ShieldCheck,
  Video,
  Users as UsersIcon,
  Clock,
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";

interface PsychologistCardProps {
  psychologist: PsychologistProfile;
}

// "Today", "Tomorrow" or a short weekday + date, from a YYYY-MM-DD day.
const dayLabel = (
  iso: string,
  t: (k: "psychologists.today" | "psychologists.tomorrow") => string,
) => {
  const today = new Date();
  const d = new Date(`${iso}T12:00:00`);
  const diff = Math.round(
    (d.getTime() - new Date(today.toDateString()).getTime()) / 86_400_000,
  );
  if (diff <= 0) return t("psychologists.today");
  if (diff === 1) return t("psychologists.tomorrow");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const PsychologistCard = ({ psychologist }: PsychologistCardProps) => {
  const { t } = useLocale();
  const rating = psychologist.rating_avg ?? null;
  const reviews = psychologist.rating_count ?? 0;
  const next = psychologist.next_available ?? null;

  return (
    <div className="glass-card p-0 h-full flex flex-col group overflow-hidden">
      {/* Photo Header */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: "rgba(255,179,0,0.03)" }}
      >
        {psychologist.photo_url ? (
          <img
            src={psychologist.photo_url}
            alt={psychologist.full_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-u-gold/30" />
          </div>
        )}
        {psychologist.is_accredited && (
          <div className="absolute top-3 right-3 bg-u-burgundy rounded-full px-3 py-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-u-white" />
            <span className="text-xs text-u-white font-medium">
              {t("psychologists.accredited")}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span
            className="text-[10px] text-u-white font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            Online now
          </span>
          {psychologist.offers_online && (
            <span
              className="text-[10px] text-u-white/90 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
          {psychologist.offers_in_person && (
            <span
              className="text-[10px] text-u-white/90 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <UsersIcon className="w-3 h-3" />
              In-person
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-xl font-medium tracking-tight text-u-white leading-tight">
            {psychologist.full_name}
          </h3>
          {rating !== null && reviews > 0 ? (
            <div
              className="flex items-center gap-1 shrink-0 ml-2"
              title={`${rating.toFixed(1)} · ${reviews} ${t("psychologists.reviewsCount")}`}
            >
              <Star className="w-3.5 h-3.5 fill-u-gold text-u-gold" />
              <span className="text-sm font-semibold text-u-gold tabular-nums">
                {rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-u-gray-400 tabular-nums">
                ({reviews})
              </span>
            </div>
          ) : (
            <span className="shrink-0 ml-2 text-[11px] text-u-gray-300">
              {t("psychologists.noReviewsYet")}
            </span>
          )}
        </div>

        {psychologist.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {psychologist.specialties.slice(0, 3).map((s) => (
              <Badge
                key={s.id}
                variant="outline"
                className="text-[11px] text-u-gray-300 border-white/10 py-0.5"
              >
                {s.name}
              </Badge>
            ))}
            {psychologist.specialties.length > 3 && (
              <Badge
                variant="outline"
                className="text-[11px] text-u-gray-400 border-white/10 py-0.5"
              >
                +{psychologist.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}

        {psychologist.languages.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-u-gray-300 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-u-gold/50" />
            <span className="text-xs">
              {psychologist.languages.map((l) => l.name).join(" · ")}
            </span>
          </div>
        )}

        {psychologist.city && (
          <div className="flex items-center gap-2 text-sm text-u-gray-300 mb-2">
            <MapPin className="w-3.5 h-3.5 text-u-gold/50" />
            <span className="text-xs">{psychologist.city}</span>
          </div>
        )}

        {/* Next day with an open slot, from the specialist's real hours */}
        {next && (
          <div
            className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-md"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-200/90 font-medium">
              {t("psychologists.nextAvailable")}
            </span>
            <span className="text-xs text-u-white font-semibold ml-auto tabular-nums">
              {dayLabel(next, t)}
            </span>
          </div>
        )}

        {psychologist.hourly_rate_mad && (
          <p className="font-mono font-bold text-lg mb-2 tabular-nums">
            <span className="text-u-gold">
              MAD {psychologist.hourly_rate_mad}
            </span>
            <span className="text-xs font-normal text-u-gray-400 ml-1">
              {" "}
              / 50-min session
            </span>
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-u-gray-400 mb-4">
          <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
          <span>Free rebook if not the right fit</span>
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link to={`/psychologists/${psychologist.slug}`}>
              {t("psychologists.viewProfile")}
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="flex-1">
            <Link to={`/psychologists/${psychologist.slug}?book=1`}>
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Book a slot
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
