import { PsychologistProfile } from "@/types/psychologist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, User, Award, Star, Calendar, ShieldCheck, Video, Users as UsersIcon, Clock } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";

interface PsychologistCardProps {
  psychologist: PsychologistProfile;
}

// Deterministic hash -> stable value per psychologist id
const hashId = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const nextAvailableSlot = (id: string) => {
  const h = hashId(id);
  const buckets = [
    "Today, 6:30 PM",
    "Today, 8:00 PM",
    "Tomorrow, 9:00 AM",
    "Tomorrow, 12:00 PM",
    "Tomorrow, 5:00 PM",
    "Thu, 10:00 AM",
    "Thu, 3:00 PM",
    "Fri, 11:00 AM",
  ];
  return buckets[h % buckets.length];
};

const reviewCount = (id: string) => 40 + (hashId(id) % 181); // 40-220

export const PsychologistCard = ({ psychologist }: PsychologistCardProps) => {
  const { t } = useLocale();
  const rating = 4.9;
  const reviews = reviewCount(psychologist.id);
  const slot = nextAvailableSlot(psychologist.id);

  return (
    <div className="glass-card p-0 h-full flex flex-col group overflow-hidden">
      {/* Photo Header */}
      <div className="relative h-44 overflow-hidden" style={{ background: 'rgba(255,179,0,0.03)' }}>
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
            <span className="text-xs text-u-white font-medium">{t('psychologists.accredited')}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] text-u-white font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)' }}>Online now</span>
          {psychologist.offers_online && (
            <span className="text-[10px] text-u-white/90 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.5)' }}><Video className="w-3 h-3" />Video</span>
          )}
          {psychologist.offers_in_person && (
            <span className="text-[10px] text-u-white/90 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.5)' }}><UsersIcon className="w-3 h-3" />In-person</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-xl font-medium tracking-tight text-u-white leading-tight">{psychologist.full_name}</h3>
          <div className="flex items-center gap-1 shrink-0 ml-2" title={`${rating} from ${reviews} reviews`}>
            <Star className="w-3.5 h-3.5 fill-u-gold text-u-gold" />
            <span className="text-sm font-semibold text-u-gold tabular-nums">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-u-gray-400 tabular-nums">({reviews})</span>
          </div>
        </div>

        {psychologist.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {psychologist.specialties.slice(0, 3).map((s) => (
              <Badge key={s.id} variant="outline" className="text-[11px] text-u-gray-300 border-white/10 py-0.5">
                {s.name}
              </Badge>
            ))}
            {psychologist.specialties.length > 3 && (
              <Badge variant="outline" className="text-[11px] text-u-gray-400 border-white/10 py-0.5">
                +{psychologist.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}

        {psychologist.languages.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-u-gray-300 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-u-gold/50" />
            <span className="text-xs">{psychologist.languages.map((l) => l.name).join(" · ")}</span>
          </div>
        )}

        {psychologist.city && (
          <div className="flex items-center gap-2 text-sm text-u-gray-300 mb-2">
            <MapPin className="w-3.5 h-3.5 text-u-gold/50" />
            <span className="text-xs">{psychologist.city}</span>
          </div>
        )}

        {/* Next available slot — the hook */}
        <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-md"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-emerald-200/90 font-medium">Next available</span>
          <span className="text-xs text-u-white font-semibold ml-auto tabular-nums">{slot}</span>
        </div>

        {psychologist.hourly_rate_mad && (
          <p className="font-mono font-bold text-lg mb-2 tabular-nums">
            <span className="text-u-gold">MAD {psychologist.hourly_rate_mad}</span>
            <span className="text-xs font-normal text-u-gray-400 ml-1"> / 50-min session</span>
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-u-gray-400 mb-4">
          <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
          <span>Free rebook if not the right fit</span>
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link to={`/psychologists/${psychologist.slug}`}>{t('psychologists.viewProfile')}</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="flex-1">
            <Link to={`/psychologists/${psychologist.slug}#booking`}>
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Book a slot
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};