/**
 * Platform event catalogue — the integration contract.
 *
 * This file is the vocabulary the whole platform integrates through. Adding an
 * entry here is a product decision, not an implementation detail: once an event
 * is published, external consumers (CRM, warehouse, partner webhooks) depend on
 * its name and shape, and it can no longer be renamed freely.
 *
 * RULES
 *
 * 1. Payloads carry business facts only. Never PHI, never clinical content,
 *    never free-text notes. This data fans out past the clinical boundary to
 *    third-party systems. Reference clinical records by id and let an
 *    authorised consumer fetch them through a governed path.
 *
 * 2. Additive changes keep the version. Adding an optional field is
 *    backwards-compatible. Removing or retyping one is a new version, so
 *    consumers can branch on `event_version` rather than infer from shape.
 *
 * 3. Past tense, always. An event is a record that something happened, not a
 *    request for something to happen. `booking.confirmed`, never
 *    `booking.confirm` — the distinction is what stops the event log becoming a
 *    command queue with extra steps.
 *
 * 4. Domains publish about themselves. Care publishes `session.completed`;
 *    Billing does not publish it on Care's behalf.
 */

/** Domains that own events. Mirrors the capability map in docs/OPERATING_MODEL.md. */
export const EVENT_DOMAINS = [
  "user",
  "match",
  "booking",
  "session",
  "assessment",
  "risk",
  "specialist",
  "organization",
  "lead",
  "opportunity",
  "proposal",
  "contract",
  "program",
  "invoice",
  "payment",
  "course",
  "certificate",
  "ai",
] as const;

export type EventDomain = (typeof EVENT_DOMAINS)[number];

/**
 * Payload shapes, keyed by event name.
 *
 * The subject of each event is carried in the envelope (`subject_type` /
 * `subject_id`), not repeated in the payload — consumers reconstruct an
 * entity's history from the envelope without parsing payloads.
 */
export interface EventPayloads {
  // --- Identity -----------------------------------------------------------
  "user.registered": { role: string; locale: string; referral_source?: string };
  "user.verified": { method: "email" | "phone" };
  "consent.granted": { consent_type: string; version: string };
  "consent.withdrawn": { consent_type: string };

  // --- Matching and care --------------------------------------------------
  "match.requested": { specialty?: string; locale?: string; urgency?: string };
  "match.accepted": { specialist_id: string; match_score?: number };
  "booking.confirmed": {
    specialist_id: string;
    scheduled_for: string;
    modality: "video" | "in_person";
    /** Minor units, to avoid float rounding on money. */
    price_minor?: number;
    currency?: string;
  };
  "booking.cancelled": { cancelled_by: "client" | "specialist" | "system"; reason_code?: string };
  "session.completed": { specialist_id: string; duration_minutes: number };
  "session.no_show": { party: "client" | "specialist" };

  // --- Assessment and safety ----------------------------------------------
  /** Instrument and band only. Never item-level responses or raw scores. */
  "assessment.completed": { instrument: string; band?: string };
  /** Signals that escalation is required. Carries no clinical detail. */
  "risk.flagged": { severity: "low" | "moderate" | "high"; requires_escalation: boolean };
  "risk.escalated": { escalated_to: string };

  // --- Supply -------------------------------------------------------------
  "specialist.applied": { specialties: string[]; country?: string };
  "specialist.approved": { specialties: string[]; approved_by: string };
  "specialist.suspended": { reason_code: string };

  // --- Revenue operations -------------------------------------------------
  // Models the approved pipeline: lead -> opportunity -> organization ->
  // proposal -> contract -> program -> participants -> delivery -> renewal.
  "lead.captured": { source: string; organization_type?: OrganizationType; country?: string };
  "opportunity.created": { estimated_seats?: number; estimated_value_minor?: number; currency?: string };
  "opportunity.stage_changed": { from_stage: string; to_stage: string; pipeline: string };
  "organization.created": { organization_type: OrganizationType; country?: string };
  "proposal.sent": { organization_id: string; seats: number; value_minor: number; currency: string };
  "proposal.accepted": { organization_id: string };
  "contract.signed": {
    organization_id: string;
    seats: number;
    starts_on: string;
    ends_on?: string;
    value_minor: number;
    currency: string;
  };
  "contract.renewed": { organization_id: string; previous_contract_id: string };
  "program.launched": { organization_id: string; contract_id: string; seats: number };
  "program.participant_enrolled": { program_id: string; organization_id: string };

  // --- Billing ------------------------------------------------------------
  "invoice.issued": { organization_id?: string; amount_minor: number; currency: string; due_on: string };
  "invoice.paid": { organization_id?: string; amount_minor: number; currency: string };
  "payment.completed": { amount_minor: number; currency: string; provider: string };
  "payment.failed": { provider: string; failure_code?: string };

  // --- Learning -----------------------------------------------------------
  "course.completed": { course_id: string; score?: number };
  "certificate.issued": { course_id: string; certificate_ref: string };

  // --- AI -----------------------------------------------------------------
  /**
   * Governance record for every inference that influenced a user-visible
   * outcome. Deliberately excludes prompt and completion text: this event
   * leaves the clinical boundary, and the content does not.
   */
  "ai.recommendation_generated": {
    capability: string;
    model: string;
    prompt_version: string;
    /** Whether the subject was clinical, for cost and risk attribution. */
    clinical_context: boolean;
  };
}

export type EventName = keyof EventPayloads;

/** The organisation types the platform sells to. One model, differing terms. */
export type OrganizationType =
  | "company"
  | "university"
  | "school"
  | "ngo"
  | "sports_federation"
  | "government"
  | "clinic";

/**
 * Known consumers. Adding one here and replaying is how a new integration is
 * onboarded — producers never change.
 */
export const EVENT_CONSUMERS = ["crm", "warehouse", "notifications", "partner_webhook"] as const;
export type EventConsumer = (typeof EVENT_CONSUMERS)[number];

/**
 * Which consumers receive which events, by default.
 *
 * CRM receives commercial signal only. It has no business knowing that a
 * clinical session completed or that a risk flag was raised, and routing those
 * to a third-party sales tool would be a privacy incident rather than a
 * feature. Where a consumer is omitted, the event simply is not delivered to it.
 */
export const DEFAULT_ROUTING: Partial<Record<EventName, readonly EventConsumer[]>> = {
  "user.registered": ["crm", "warehouse"],
  "lead.captured": ["crm", "warehouse"],
  "opportunity.created": ["crm", "warehouse"],
  "opportunity.stage_changed": ["crm", "warehouse"],
  "organization.created": ["crm", "warehouse"],
  "proposal.sent": ["crm", "warehouse"],
  "proposal.accepted": ["crm", "warehouse"],
  "contract.signed": ["crm", "warehouse"],
  "contract.renewed": ["crm", "warehouse"],
  "invoice.issued": ["crm", "warehouse"],
  "invoice.paid": ["crm", "warehouse"],
  "specialist.applied": ["crm", "warehouse"],
  "specialist.approved": ["warehouse"],

  // Clinical and care events: warehouse only, never the CRM.
  "booking.confirmed": ["warehouse", "notifications"],
  "booking.cancelled": ["warehouse", "notifications"],
  "session.completed": ["warehouse"],
  "session.no_show": ["warehouse", "notifications"],
  "assessment.completed": ["warehouse"],
  "risk.flagged": ["notifications"],
  "risk.escalated": ["notifications"],
  "course.completed": ["warehouse"],
  "certificate.issued": ["warehouse", "notifications"],
  "ai.recommendation_generated": ["warehouse"],
};

/** The subject an event is about, used for the envelope. */
export const SUBJECT_TYPES: Record<EventName, string> = {
  "user.registered": "user",
  "user.verified": "user",
  "consent.granted": "user",
  "consent.withdrawn": "user",
  "match.requested": "match",
  "match.accepted": "match",
  "booking.confirmed": "booking",
  "booking.cancelled": "booking",
  "session.completed": "session",
  "session.no_show": "session",
  "assessment.completed": "assessment",
  "risk.flagged": "case",
  "risk.escalated": "case",
  "specialist.applied": "specialist",
  "specialist.approved": "specialist",
  "specialist.suspended": "specialist",
  "lead.captured": "lead",
  "opportunity.created": "opportunity",
  "opportunity.stage_changed": "opportunity",
  "organization.created": "organization",
  "proposal.sent": "proposal",
  "proposal.accepted": "proposal",
  "contract.signed": "contract",
  "contract.renewed": "contract",
  "program.launched": "program",
  "program.participant_enrolled": "program",
  "invoice.issued": "invoice",
  "invoice.paid": "invoice",
  "payment.completed": "payment",
  "payment.failed": "payment",
  "course.completed": "course",
  "certificate.issued": "certificate",
  "ai.recommendation_generated": "ai_inference",
};

/** Event names must be `domain.action`, matching the database constraint. */
export const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

export function isKnownEvent(name: string): name is EventName {
  return name in SUBJECT_TYPES;
}

export function domainOf(name: EventName): string {
  return name.split(".")[0];
}
