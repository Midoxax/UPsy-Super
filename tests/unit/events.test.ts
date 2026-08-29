/**
 * Event catalogue invariants.
 *
 * The catalogue is an integration contract: once published, external consumers
 * depend on these names and routes. These tests hold the properties that are
 * expensive to discover in production — a clinical event routed to a sales
 * tool, or an event name that the database CHECK constraint will reject at 3am.
 */
import { describe, it, expect } from "vitest";
import {
  DEFAULT_ROUTING,
  SUBJECT_TYPES,
  EVENT_NAME_PATTERN,
  EVENT_CONSUMERS,
  EVENT_DOMAINS,
  isKnownEvent,
  domainOf,
  type EventName,
} from "@/lib/events/catalogue";

const allEvents = Object.keys(SUBJECT_TYPES) as EventName[];

describe("event naming", () => {
  it("has events registered", () => {
    expect(allEvents.length).toBeGreaterThan(20);
  });

  it("every event matches the database CHECK constraint", () => {
    // platform_events enforces this pattern in Postgres. A name that passes
    // review but fails the constraint is an outage at publish time, not a
    // compile error, so it is asserted here.
    for (const name of allEvents) {
      expect(EVENT_NAME_PATTERN.test(name), `"${name}" is not domain.action`).toBe(true);
    }
  });

  it("every event is past tense, not an instruction", () => {
    // An event records that something happened. Imperative names turn the
    // outbox into a command queue, which is a different system with different
    // delivery guarantees.
    const imperative = /\.(create|update|delete|send|confirm|cancel|issue|pay|approve)$/;
    for (const name of allEvents) {
      expect(imperative.test(name), `"${name}" reads as a command`).toBe(false);
    }
  });

  it("every event belongs to a declared domain", () => {
    for (const name of allEvents) {
      const domain = domainOf(name);
      const known = (EVENT_DOMAINS as readonly string[]).includes(domain) || domain === "consent";
      expect(known, `"${name}" uses undeclared domain "${domain}"`).toBe(true);
    }
  });

  it("recognises known and unknown names", () => {
    expect(isKnownEvent("booking.confirmed")).toBe(true);
    expect(isKnownEvent("booking.invented")).toBe(false);
  });
});

describe("routing", () => {
  it("routes only to declared consumers", () => {
    for (const [name, consumers] of Object.entries(DEFAULT_ROUTING)) {
      for (const c of consumers ?? []) {
        expect(EVENT_CONSUMERS as readonly string[]).toContain(c);
      }
    }
  });

  it("never routes clinical or care events to the CRM", () => {
    // The invariant that matters most in this file. A sales tool has no
    // business receiving that a therapy session completed or that a risk flag
    // was raised — that is a privacy incident, not a feature, and it is the
    // kind of mistake that is added casually during a growth push.
    const clinical: EventName[] = [
      "session.completed",
      "session.no_show",
      "assessment.completed",
      "risk.flagged",
      "risk.escalated",
      "booking.confirmed",
      "booking.cancelled",
      "ai.recommendation_generated",
    ];
    for (const name of clinical) {
      expect(DEFAULT_ROUTING[name] ?? [], `${name} must not reach the CRM`).not.toContain("crm");
    }
  });

  it("routes commercial events to the CRM", () => {
    const commercial: EventName[] = [
      "lead.captured",
      "opportunity.created",
      "contract.signed",
      "invoice.paid",
    ];
    for (const name of commercial) {
      expect(DEFAULT_ROUTING[name] ?? [], `${name} should reach the CRM`).toContain("crm");
    }
  });

  it("gives every routed event a subject type", () => {
    for (const name of Object.keys(DEFAULT_ROUTING)) {
      expect(SUBJECT_TYPES[name as EventName], `${name} has no subject type`).toBeTruthy();
    }
  });
});

describe("revenue operations pipeline", () => {
  it("covers the full lead-to-renewal chain", () => {
    // The approved model: lead -> opportunity -> organization -> proposal ->
    // contract -> program -> participants -> invoice -> renewal. A gap here
    // means a stage the business runs on that no system can observe.
    const chain: EventName[] = [
      "lead.captured",
      "opportunity.created",
      "organization.created",
      "proposal.sent",
      "proposal.accepted",
      "contract.signed",
      "program.launched",
      "program.participant_enrolled",
      "invoice.issued",
      "invoice.paid",
      "contract.renewed",
    ];
    for (const stage of chain) {
      expect(isKnownEvent(stage), `pipeline stage "${stage}" is missing`).toBe(true);
    }
  });

  it("models pipeline stage changes generically rather than hardcoding stages", () => {
    // Pipelines must be configurable. A fixed set of stage-specific events
    // would bake today's sales process into the integration contract.
    expect(isKnownEvent("opportunity.stage_changed")).toBe(true);
  });
});
