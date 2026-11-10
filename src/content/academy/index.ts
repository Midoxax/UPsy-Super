import { CLINICAL_COURSES } from "./clinical";
import { PERFORMANCE_COURSES } from "./performance";

export type { AcademyCourse, AcademyModule } from "./types";

export const ACADEMY_COURSES = [...CLINICAL_COURSES, ...PERFORMANCE_COURSES];
