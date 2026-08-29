import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client_id: string;
}

interface ReviewsListProps {
  psychologistId: string;
}

const ReviewsList = ({ psychologistId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, client_id")
        .eq("psychologist_id", psychologistId)
        .order("created_at", { ascending: false })
        .limit(20);
      setReviews((data ?? []) as Review[]);
      setLoading(false);
    };
    fetch();
  }, [psychologistId]);

  if (loading) return null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const getInitials = (id: string) => {
    // Generate consistent 2-letter initials from client_id
    const chars = id.replace(/-/g, "").slice(0, 4).toUpperCase();
    return chars.slice(0, 1) + "." + chars.slice(1, 2) + ".";
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
    if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
  };

  return (
    <ScrollReveal>
      <div className="glass-card p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Client Reviews
          </h2>
          {avgRating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(avgRating))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-foreground">{avgRating}</span>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No reviews yet. Be the first to leave a review after your session.
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className="pb-6"
                style={{
                  borderBottom:
                    i < reviews.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary"
                      style={{
                        background: "rgba(255,179,0,0.1)",
                        border: "1px solid rgba(255,179,0,0.2)",
                      }}
                    >
                      {getInitials(review.client_id)}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`w-3.5 h-3.5 ${
                            j < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(review.created_at)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
};

export default ReviewsList;
