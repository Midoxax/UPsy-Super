import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  psychologistId: string;
  psychologistName: string;
  onReviewSubmitted?: () => void;
}

const COPY = {
  en: {
    title: "Rate your session",
    desc: (n: string) =>
      `How was your session with ${n}? Your review is published without your name.`,
    labels: [
      "Select a rating",
      "Poor",
      "Below average",
      "Good",
      "Very good",
      "Excellent",
    ],
    placeholder: "Share your experience (optional)",
    cancel: "Cancel",
    submit: "Publish review",
    submitting: "Publishing…",
    thanks: "Thank you for your review",
    error: "Could not publish the review",
  },
  fr: {
    title: "Évaluez votre séance",
    desc: (n: string) =>
      `Comment s'est passée votre séance avec ${n} ? Votre avis est publié sans votre nom.`,
    labels: [
      "Choisissez une note",
      "Décevante",
      "Moyenne",
      "Bonne",
      "Très bonne",
      "Excellente",
    ],
    placeholder: "Partagez votre expérience (facultatif)",
    cancel: "Annuler",
    submit: "Publier l'avis",
    submitting: "Publication…",
    thanks: "Merci pour votre avis",
    error: "L'avis n'a pas pu être publié",
  },
  ar: {
    title: "قيّم حصتك",
    desc: (n: string) => `كيف كانت حصتك مع ${n}؟ يُنشر تقييمك دون اسمك.`,
    labels: [
      "اختر تقييماً",
      "ضعيفة",
      "دون المتوسط",
      "جيدة",
      "جيدة جداً",
      "ممتازة",
    ],
    placeholder: "شارك تجربتك (اختياري)",
    cancel: "إلغاء",
    submit: "نشر التقييم",
    submitting: "جارٍ النشر…",
    thanks: "شكراً على تقييمك",
    error: "تعذر نشر التقييم",
  },
};

const ReviewFormModal = ({
  open,
  onClose,
  bookingId,
  psychologistId,
  psychologistName,
  onReviewSubmitted,
}: ReviewFormModalProps) => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const c = COPY[locale === "en" || locale === "ar" ? locale : "fr"];
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      psychologist_id: psychologistId,
      client_id: user.id,
      rating,
      comment: comment.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast({
        title: c.error,
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: c.thanks });
    onReviewSubmitted?.();
    onClose();
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.desc(psychologistName)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div
            className="flex justify-center gap-1"
            role="radiogroup"
            aria-label={c.title}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} — ${c.labels[star]}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="h-11 w-11 inline-flex items-center justify-center transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= displayRating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {c.labels[displayRating]}
          </p>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
            rows={4}
            maxLength={1000}
          />

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              {c.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {c.submitting}
                </>
              ) : (
                c.submit
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormModal;
