import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  Calendar,
  BookOpen,
  Brain,
  ShieldCheck,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { generateCertificatePdf as generatePDF } from "@/lib/certificatePdf";

interface Certificate {
  id: string;
  certificate_type: string;
  title: string;
  description: string | null;
  recipient_name: string;
  certificate_number: string;
  issued_at: string;
  metadata: Record<string, unknown> | null;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof Award; color: string }
> = {
  course_completion: {
    label: "Course",
    icon: BookOpen,
    color: "text-u-turquoise",
  },
  assessment_completion: {
    label: "Assessment",
    icon: Brain,
    color: "text-u-clinical",
  },
  psychologist_accreditation: {
    label: "Accreditation",
    icon: ShieldCheck,
    color: "text-primary",
  },
  mooc_training: {
    label: "MOOC",
    icon: GraduationCap,
    color: "text-u-lavender",
  },
};

const CertificatesTab = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      if (data) setCertificates(data as unknown as Certificate[]);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-h3 mb-2">No Certificates Yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Complete courses, assessments, or training programs to earn your
          certificates. They'll appear here for download.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-h3">My Certificates ({certificates.length})</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates.map((cert) => {
          const config =
            TYPE_CONFIG[cert.certificate_type] || TYPE_CONFIG.course_completion;
          const Icon = config.icon;

          return (
            <div
              key={cert.id}
              className="glass-card p-5 space-y-3 group hover:shadow-glass-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(218,165,32,0.1)",
                      border: "1px solid rgba(218,165,32,0.2)",
                    }}
                  >
                    <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {config.label}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground leading-tight">
                  {cert.title}
                </h4>
                {cert.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {cert.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(cert.issued_at), "MMM d, yyyy")}
                </span>
                <span className="font-mono text-[10px]">
                  {cert.certificate_number}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => void generatePDF(cert)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificatesTab;
