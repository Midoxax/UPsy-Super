import { format } from "date-fns";

/** The fields a certificate PDF prints. */
export interface CertificateForPdf {
  certificate_type: string;
  title: string;
  description: string | null;
  recipient_name: string;
  certificate_number: string;
  issued_at: string;
  metadata: Record<string, unknown> | null;
}

const TYPE_LABELS: Record<string, string> = {
  course_completion: "Course",
  assessment_completion: "Assessment",
  psychologist_accreditation: "Accreditation",
  mooc_training: "Training",
  webinar_attendance: "Webinar",
};

/** Builds and downloads the certificate as an A4 landscape PDF. */
export async function generateCertificatePdf(cert: CertificateForPdf) {
  // Loaded on click (see AnamnesisDrawer).
  const { default: jsPDF } = await import("jspdf");
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
  const typeLabel = TYPE_LABELS[cert.certificate_type];
  pdf.setFontSize(10);
  pdf.setTextColor(218, 165, 32);
  pdf.setFont("helvetica", "normal");
  pdf.text((typeLabel || "Certificate").toUpperCase(), w / 2, 43, {
    align: "center",
  });

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

  // Continuing-education hours (trainings)
  const hours = Number(cert.metadata?.cpd_hours);
  if (hours > 0) {
    pdf.setFontSize(10);
    pdf.setTextColor(139, 26, 26);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${hours} h CPD / formation continue`, w / 2, 132, {
      align: "center",
    });
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
