import { Link } from "@/lib/router-compat";
import { ArrowRight, Clock } from "lucide-react";

type Related = { slug: string; title: string; desc: string; readTime: string; category: string };

const ALL: Record<string, Related> = {
  "find-right-psychologist": { slug: "find-right-psychologist", title: "How to Find the Right Psychologist", desc: "A practical guide to choosing the right clinician for your needs.", readTime: "5 min", category: "Guide" },
  "do-i-need-therapy": { slug: "do-i-need-therapy", title: "Do I Need Therapy?", desc: "Recognise when professional support is the right next step.", readTime: "6 min", category: "Mental Health" },
  "understanding-anxiety": { slug: "understanding-anxiety", title: "Understanding Anxiety", desc: "What anxiety really is — and what helps you manage it.", readTime: "5 min", category: "Mental Health" },
  "benefits-online-therapy": { slug: "benefits-online-therapy", title: "Benefits of Online Therapy", desc: "Why secure video sessions can be as effective as in-person care.", readTime: "4 min", category: "Guide" },
  "mental-health-at-work": { slug: "mental-health-at-work", title: "Mental Health at Work", desc: "Spot burnout early and build healthier professional boundaries.", readTime: "6 min", category: "Workplace" },
  "understanding-depression": { slug: "understanding-depression", title: "Understanding Depression", desc: "More than sadness — what depression is and how recovery works.", readTime: "5 min", category: "Mental Health" },
  "how-to-support-a-loved-one": { slug: "how-to-support-a-loved-one", title: "How to Support a Loved One", desc: "What to say, what to avoid, and how to stay present.", readTime: "5 min", category: "Guide" },
  "mindfulness-for-beginners": { slug: "mindfulness-for-beginners", title: "Mindfulness for Beginners", desc: "Practical, evidence-based attention exercises for daily life.", readTime: "6 min", category: "Wellness" },
};

const RelatedArticles = ({ currentSlug }: { currentSlug: string }) => {
  const related = Object.values(ALL).filter((a) => a.slug !== currentSlug).slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-h2">Continue reading</h2>
        <Link to="/blog" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
          All articles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {related.map((a) => (
          <Link key={a.slug} to={`/blog/${a.slug}`} className="glass-card p-5 group transition-all hover:border-primary/30 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-primary">{a.category}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
                <Clock className="w-3 h-3" /> {a.readTime}
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
              {a.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{a.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;