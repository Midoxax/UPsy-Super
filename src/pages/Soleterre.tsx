import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, HeartHandshake, ClipboardList, Users } from "lucide-react";

const stats = [
  { value: "247", label: "Students screened" },
  { value: "2", label: "Partner schools — Kenitra & Qaria" },
  { value: "138", label: "EPOCH assessments" },
  { value: "109", label: "PERMA assessments" },
];

const pillars = [
  {
    icon: ClipboardList,
    title: "PERMA & EPOCH assessments",
    desc: "Validated wellbeing frameworks — Positive emotion, Engagement, Relationships, Meaning, Accomplishment (PERMA) and Engagement, Perseverance, Optimism, Connectedness, Happiness (EPOCH) — used to screen student wellbeing at scale.",
  },
  {
    icon: GraduationCap,
    title: "School-wide screening",
    desc: "Delivered across Kenitra and Qaria schools, giving educators an anonymized, aggregate picture of student wellbeing rather than individual clinical labels.",
  },
  {
    icon: HeartHandshake,
    title: "Clinical follow-through",
    desc: "Findings inform referrals and classroom-level support, connecting schools to U.Psy's network of accredited psychologists when a student needs more than screening.",
  },
  {
    icon: Users,
    title: "Built for educators",
    desc: "Reporting designed for school staff and counselors — clear, actionable, and respectful of student privacy.",
  },
];

export default function Soleterre() {
  return (
    <>
      <SEOHead
        path="/soleterre"
        title="Soleterre — School Wellbeing Partnership | U.Psy"
        description="U.Psy's Soleterre partnership brings PERMA and EPOCH wellbeing assessments to schools in Kenitra and Qaria, screening 247 students to date."
      />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">Soleterre: student wellbeing, measured.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A school wellbeing partnership bringing PERMA and EPOCH assessments to Moroccan classrooms —
            starting with Kenitra and Qaria.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary font-mono tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-6">
          {pillars.map((f, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6 space-y-2">
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
