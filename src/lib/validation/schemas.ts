/**
 * Zod validation schemas for all user-facing forms.
 * Use these on submit BEFORE any Supabase write to reject malicious input.
 */
import { z } from "zod";

// Reject obvious script injection attempts
const noScriptRegex = /<\s*script|<\s*\/\s*script|javascript:/i;
const safeText = (max: number, min = 0) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !noScriptRegex.test(v), {
      message: "Invalid characters detected",
    });

export const emailSchema = z.string().trim().toLowerCase().email().max(255);
export const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d\s().-]*$/, "Invalid phone format")
  .optional()
  .or(z.literal(""));

export const contactFormSchema = z.object({
  name: safeText(100, 1),
  email: emailSchema,
  phone: phoneSchema,
  message: safeText(2000, 10),
});

export const authSignUpSchema = z.object({
  fullName: safeText(100, 2),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Min 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Needs uppercase")
    .regex(/[a-z]/, "Needs lowercase")
    .regex(/\d/, "Needs digit"),
});

export const authSignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const moodEntrySchema = z.object({
  mood_score: z.number().int().min(1).max(5),
  energy_level: z.number().int().min(1).max(5).optional(),
  stress_level: z.number().int().min(1).max(5).optional(),
  notes: safeText(1000).optional(),
  tags: z.array(safeText(50)).max(10).optional(),
});

export const matchingRequestSchema = z.object({
  name: safeText(100, 2),
  email: emailSchema,
  phone: phoneSchema,
  specialty_needed: z.string().uuid(),
  languages_preferred: z.array(z.string().uuid()).max(10),
  prefers_online: z.boolean().optional(),
  budget_max: z.number().nonnegative().max(100000).optional(),
  location_city: safeText(100).optional(),
  notes: safeText(2000).optional(),
});

export const psychologistApplicationSchema = z.object({
  full_name: safeText(100, 2),
  email: emailSchema,
  phone: phoneSchema,
  qualifications: safeText(3000).optional(),
  accreditation_number: safeText(50).optional(),
  accreditation_level: z.enum([
    "basic",
    "provisional",
    "verified",
    "premium",
    "expert",
  ]),
});

export type ContactForm = z.infer<typeof contactFormSchema>;
export type MoodEntry = z.infer<typeof moodEntrySchema>;
