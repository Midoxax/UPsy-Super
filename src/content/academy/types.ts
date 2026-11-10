/**
 * Academy course content, written for U.Psy in French and English (Arabic
 * readers get the French text until a translation is added; titles are
 * translated). Generated into `courses` / `course_modules` by a migration so
 * module ids, and therefore learners' progress, stay stable.
 */
export type Tri = { en: string; fr: string; ar: string };
export type Bi = { en: string; fr: string };

export interface AcademyModule {
  /** Matches course_modules.order_index. */
  order: number;
  minutes: number;
  title: Tri;
  /** Markdown. Links to /resources/<slug> stay inside the site. */
  content: Bi;
}

export interface AcademyCourse {
  /** Existing courses keep their slug; new ones get a readable one. */
  slug: string;
  /** Only for courses created by the migration. */
  isNew?: boolean;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  title: Tri;
  description: Tri;
  modules: AcademyModule[];
}
