import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { Clock, BarChart, ArrowRight, User } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FloatingDecorations from "./FloatingDecorations";

const LearningSection = () => {
  const { t } = useLocale();

  const { data: courses } = useQuery({
    queryKey: ["homepage-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, category, duration_hours, difficulty_level")
        .eq("is_published", true)
        .limit(4);
      return data;
    },
  });

  const displayCourses = courses && courses.length > 0
    ? courses.map((c) => ({
        title: c.title,
        duration: c.duration_hours ? `${c.duration_hours}h` : "Self-paced",
        level: c.difficulty_level || "All Levels",
        category: c.category,
      }))
    : [
        { title: "Understanding Anxiety", duration: "6h", level: "Beginner", category: "clinical" },
        { title: "Stress Management", duration: "4h", level: "All Levels", category: "clinical" },
        { title: "Mental Resilience", duration: "8h", level: "Intermediate", category: "clinical" },
        { title: "Sport Psychology", duration: "10h", level: "Advanced", category: "sport_psychology" },
      ];

  return (
    <section className="section-spacing liquid-bg relative">
      <FloatingDecorations preset="clinical" />
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-h2 mb-4">{t("learning.title") || "Learn Mental Health Skills"}</h2>
            <p className="text-body text-muted-foreground">
              {t("learning.subtitle") || "Self-paced courses designed by licensed psychologists."}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1}>
          {/* Horizontally scrollable on mobile, so it needs to be reachable and
              scrollable by keyboard; without tabIndex a keyboard-only user
              cannot reach the cards that overflow the viewport. */}
          <div
            tabIndex={0}
            role="group"
            aria-label={t("learning.title") || "Learn Mental Health Skills"}
            className="scroll-carousel md:!grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
            {displayCourses.map((course) => (
              <StaggerItem key={course.title}>
                <div className="card-tilt">
                <div className="glass-card p-6 h-full flex flex-col min-w-0">
                  <div className="w-full h-32 rounded-xl mb-4 flex items-center justify-center bg-primary/5 border border-primary/10">
                    <span className="text-primary/30 text-4xl font-bold">{course.title.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><BarChart className="w-3 h-3" />{course.level}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-auto w-full" asChild>
                    <Link to="/resources">{t("learning.startCourse") || "Start Course"}</Link>
                  </Button>
                </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <div className="text-center mt-10">
          <Button variant="primary" size="lg" asChild>
            <Link to="/resources" className="inline-flex items-center gap-2">
              {t("learning.browseAll") || "Browse All Courses"} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LearningSection;
