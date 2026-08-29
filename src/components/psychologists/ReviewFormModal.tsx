import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  sessionId: string;
  psychologistId: string;
  psychologistName: string;
  onReviewSubmitted?: () => void;
}

const ReviewFormModal = ({
  open,
  onClose,
  sessionId,
  psychologistId,
  psychologistName,
  onReviewSubmitted,
}: ReviewFormModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        session_id: sessionId,
        psychologist_id: psychologistId,
        client_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
      onReviewSubmitted?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not submit review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Session</DialogTitle>
          <DialogDescription>
            How was your session with {psychologistName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
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
            {displayRating === 0 && "Select a rating"}
            {displayRating === 1 && "Poor"}
            {displayRating === 2 && "Below average"}
            {displayRating === 3 && "Good"}
            {displayRating === 4 && "Very good"}
            {displayRating === 5 && "Excellent"}
          </p>

          {/* Comment */}
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={4}
            maxLength={1000}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading || rating === 0}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormModal;
