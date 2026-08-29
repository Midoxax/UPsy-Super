import { create } from "zustand";

export interface AssessmentResult {
  type: string; // e.g. "anxiety", "stress", "burnout"
  score: number;
  severity: "minimal" | "mild" | "moderate" | "severe";
  completedAt: string;
  recommendedSpecialties?: string[];
}

interface AssessmentState {
  /** Latest quick-assessment result (from homepage or assessment lab) */
  latestResult: AssessmentResult | null;
  /** Whether the user has completed any assessment this session */
  hasCompletedAssessment: boolean;
  /** Set after a user completes an assessment */
  setResult: (result: AssessmentResult) => void;
  /** Clear assessment state */
  clearResult: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  latestResult: null,
  hasCompletedAssessment: false,
  setResult: (result) =>
    set({ latestResult: result, hasCompletedAssessment: true }),
  clearResult: () =>
    set({ latestResult: null, hasCompletedAssessment: false }),
}));
