import { template as quizResultsTemplate } from "./quiz-results.ts";

export interface TemplateEntry {
  /** Builds the subject, HTML and plain text from the template data. */
  render: (data: any) => { subject: string; html: string; text: string };
  displayName?: string;
  previewData?: Record<string, any>;
  to?: string;
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  "quiz-results": quizResultsTemplate,
};
