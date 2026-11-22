import { it, expect } from "vitest";
import { interviewIcs } from "@/lib/recruitment/ics";

it("builds a valid event with escaped text and UTC times", () => {
  const ics = interviewIcs({
    id: "abc",
    title: "Entretien LSSPM, Casablanca; salle 2",
    start: new Date("2026-12-01T09:00:00Z"),
    minutes: 45,
    location: "Siège, 2e étage",
    url: "https://meet.example/x",
  });
  expect(ics).toContain("DTSTART:20261201T090000Z");
  expect(ics).toContain("DTEND:20261201T094500Z");
  expect(ics).toContain("SUMMARY:Entretien LSSPM\\, Casablanca\\; salle 2");
  expect(ics).toContain("LOCATION:Siège\\, 2e étage");
  expect(ics).toContain("UID:abc@upsy.ma");
  expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
});
