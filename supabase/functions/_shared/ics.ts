// iCalendar (RFC 5545) builders for session invites and the calendar feed.

export interface IcsEvent {
  uid: string;
  start: Date;
  durationMin: number;
  summary: string;
  description: string;
  url?: string;
  location?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
}

const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

const text = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

export function icsEvent(e: IcsEvent): string[] {
  const end = new Date(e.start.getTime() + e.durationMin * 60 * 1000);
  return [
    "BEGIN:VEVENT",
    `UID:${e.uid}@upsy.ma`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${text(e.summary)}`,
    `DESCRIPTION:${text(e.description)}`,
    ...(e.url ? [`URL:${e.url}`] : []),
    ...((e.location ?? e.url)
      ? [`LOCATION:${text(e.location ?? e.url!)}`]
      : []),
    `STATUS:${e.status ?? "CONFIRMED"}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
  ];
}

export function icsCalendar(
  events: IcsEvent[],
  method: "REQUEST" | "PUBLISH" = "REQUEST",
  name?: string,
): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//U.Psy//Session//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    ...(name ? [`X-WR-CALNAME:${text(name)}`] : []),
    ...events.flatMap(icsEvent),
    "END:VCALENDAR",
  ].join("\r\n");
}
