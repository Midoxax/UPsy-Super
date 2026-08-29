import { supabase } from "@/integrations/supabase/client";

type CertificateType = "course_completion" | "assessment_completion" | "psychologist_accreditation" | "mooc_training";

interface IssueCertificateParams {
  certificate_type: CertificateType;
  title: string;
  description?: string;
  reference_id?: string;
}

export async function issueCertificate(params: IssueCertificateParams) {
  const { data, error } = await supabase.functions.invoke("generate-certificate", {
    body: params,
  });

  if (error) {
    console.error("Certificate generation failed:", error);
    throw error;
  }

  return data;
}

export async function checkAndIssueCourseCompletionCert(
  courseId: string,
  courseTitle: string,
  progressPercent: number
) {
  if (progressPercent < 100) return null;

  try {
    return await issueCertificate({
      certificate_type: "course_completion",
      title: courseTitle,
      description: `Successfully completed the course "${courseTitle}" on the U.Psy learning platform.`,
      reference_id: courseId,
    });
  } catch (err) {
    console.error("Auto-certificate for course failed:", err);
    return null;
  }
}

export async function checkAndIssueAssessmentCert(
  assessmentId: string,
  assessmentTitle: string,
  totalScore: number | null
) {
  try {
    return await issueCertificate({
      certificate_type: "assessment_completion",
      title: assessmentTitle,
      description: `Completed the "${assessmentTitle}" assessment${totalScore !== null ? ` with a score of ${totalScore}` : ""}.`,
      reference_id: assessmentId,
    });
  } catch (err) {
    console.error("Auto-certificate for assessment failed:", err);
    return null;
  }
}

export async function issuePsychologistAccreditationCert(
  psychologistName: string,
  profileId: string
) {
  try {
    return await issueCertificate({
      certificate_type: "psychologist_accreditation",
      title: "U.Psy Professional Accreditation",
      description: `${psychologistName} is officially accredited as a licensed psychologist on the U.Psy platform.`,
      reference_id: profileId,
    });
  } catch (err) {
    console.error("Accreditation certificate failed:", err);
    return null;
  }
}
