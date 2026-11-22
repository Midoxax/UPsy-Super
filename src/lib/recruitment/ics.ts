/** A calendar file (.ics) for one interview, readable by Google, Apple and Outlook calendars. */
export function interviewIcs(o: {
  id: string;
  title: string;
  start: Date;
  minutes: number;
  location?: string | null;
  url?: string | null;
  description?: string | null;
}): string {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  // RFC 5545: escape backslash, semicolon, comma and newlines in text values.
  const esc = (v: string) =>
    v
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  const end = new Date(o.start.getTime() + o.minutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//U.Psy//Recrutement//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${o.id}@upsy.ma`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(o.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(o.title)}`,
    ...(o.location ? [`LOCATION:${esc(o.location)}`] : []),
    ...(o.url ? [`URL:${o.url}`] : []),
    ...(o.description || o.url
      ? [
          `DESCRIPTION:${esc([o.description, o.url].filter(Boolean).join("\n"))}`,
        ]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** Downloads an .ics file in the browser. */
export function downloadIcs(name: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
