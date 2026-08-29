import { Link } from "@/lib/router-compat";
import { GraduationCap } from "lucide-react";

const BlogAuthor = () => {
  return (
    <aside className="glass-card p-6 md:p-7 flex flex-col sm:flex-row gap-5 items-start">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl font-bold text-primary">MF</span>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
          <h3 className="font-semibold text-foreground">Mehdi Felji</h3>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="w-3.5 h-3.5" /> Founder, U.Psy
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Founder of U.Psy and architect of the Performance Psychology System — a framework that turns
          mental health into a measurable, trainable system for individuals, teams and organizations.
        </p>
        <Link to="/founder" className="text-sm text-primary font-medium hover:underline">
          About the founder →
        </Link>
      </div>
    </aside>
  );
};

export default BlogAuthor;