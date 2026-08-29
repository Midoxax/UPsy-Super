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
import jsPDF from "jspdf";

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

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Award; color: string }> = {
  course_completion: { label: "Course", icon: BookOpen, color: "text-u-turquoise" },
  assessment_completion: { label: "Assessment", icon: Brain, color: "text-u-clinical" },
  psychologist_accreditation: { label: "Accreditation", icon: ShieldCheck, color: "text-primary" },
  mooc_training: { label: "MOOC", icon: GraduationCap, color: "text-u-lavender" },
};

function generatePDF(cert: Certificate) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Border
  pdf.setDrawColor(139, 26, 26);
  pdf.setLineWidth(1.5);
  pdf.rect(10, 10, w - 20, h - 20);

  // Inner border
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(0.5);
  pdf.rect(14, 14, w - 28, h - 28);

  // Gold top line
  pdf.setFillColor(218, 165, 32);
  pdf.rect(14, 14, w - 28, 3, "F");

  // Logo
  pdf.setFontSize(28);
  pdf.setTextColor(139, 26, 26);
  pdf.setFont("helvetica", "bold");
  pdf.text("U.Psy", w / 2, 35, { align: "center" });

  // Type label
  const typeConfig = TYPE_CONFIG[cert.certificate_type];
  pdf.setFontSize(10);
  pdf.setTextColor(218, 165, 32);
  pdf.setFont("helvetica", "normal");
  pdf.text((typeConfig?.label || "Certificate").toUpperCase(), w / 2, 43, { align: "center" });

  // Certificate of completion
  pdf.setFontSize(14);
  pdf.setTextColor(100, 100, 100);
  pdf.text("This is to certify that", w / 2, 58, { align: "center" });

  // Recipient name
  pdf.setFontSize(30);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont("times", "italic");
  pdf.text(cert.recipient_name, w / 2, 72, { align: "center" });

  // Decorative line
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 30, 78, w / 2 + 30, 78);

  // "has successfully completed"
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont("helvetica", "normal");
  pdf.text("has successfully completed", w / 2, 88, { align: "center" });

  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(139, 26, 26);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(cert.title, w - 80);
  pdf.text(titleLines, w / 2, 100, { align: "center" });

  // Description
  if (cert.description) {
    pdf.setFontSize(10);
    pdf.setTextColor(136, 136, 136);
    pdf.setFont("helvetica", "normal");
    const descLines = pdf.splitTextToSize(cert.description, w - 100);
    pdf.text(descLines, w / 2, 115, { align: "center" });
  }

  // Footer line
  const footerY = h - 40;
  pdf.setDrawColor(238, 238, 238);
  pdf.setLineWidth(0.3);
  pdf.line(30, footerY, w - 30, footerY);

  // Signed by
  pdf.setFontSize(11);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont("helvetica", "bold");
  pdf.text("Mehdi Felji", 40, footerY + 10);
  pdf.setFontSize(9);
  pdf.setTextColor(136, 136, 136);
  pdf.setFont("helvetica", "normal");
  pdf.text("Founder, U.Psy", 40, footerY + 15);

  // Certificate number
  pdf.setFontSize(9);
  pdf.setTextColor(136, 136, 136);
  pdf.text("Certificate No.", w / 2, footerY + 8, { align: "center" });
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont("helvetica", "bold");
  pdf.text(cert.certificate_number, w / 2, footerY + 14, { align: "center" });

  // Date
  const dateStr = format(new Date(cert.issued_at), "MMMM d, yyyy");
  pdf.setFontSize(9);
  pdf.setTextColor(136, 136, 136);
  pdf.setFont("helvetica", "normal");
  pdf.text("Date of Issue", w - 40, footerY + 8, { align: "center" });
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);
  pdf.setFont("helvetica", "bold");
  pdf.text(dateStr, w - 40, footerY + 14, { align: "center" });

  // Gold bottom line
  pdf.setFillColor(218, 165, 32);
  pdf.rect(14, h - 17, w - 28, 3, "F");

  pdf.save(`UPsy-Certificate-${cert.certificate_number}.pdf`);
}

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
          Complete courses, assessments, or training programs to earn your certificates.
          They'll appear here for download.
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
          const config = TYPE_CONFIG[cert.certificate_type] || TYPE_CONFIG.course_completion;
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
                    style={{ background: "rgba(218,165,32,0.1)", border: "1px solid rgba(218,165,32,0.2)" }}
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
                <span className="font-mono text-[10px]">{cert.certificate_number}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => generatePDF(cert)}
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
