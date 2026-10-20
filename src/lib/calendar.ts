import { supabase } from "@/integrations/supabase/client";

export interface CalendarSession {
  id: string;
  start: string;
  durationMinutes: number;
  title: string;
  online: boolean;
}

const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

const joinUrl = (id: string) => `${window.location.origin}/session/${id}`;

const span = (s: CalendarSession) => {
  const start = new Date(s.start);
  return [start, new Date(start.getTime() + s.durationMinutes * 60_000)];
};

const details = (s: CalendarSession) =>
  s.online ? `Join: ${joinUrl(s.id)} (opens 10 minutes before)` : "In person";

export const googleCalendarUrl = (s: CalendarSession) => {
  const [a, b] = span(s);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: s.title,
    dates: `${stamp(a)}/${stamp(b)}`,
    details: details(s),
    location: s.online ? joinUrl(s.id) : "",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
};

export const outlookCalendarUrl = (s: CalendarSession) => {
  const [a, b] = span(s);
  const q = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: s.title,
    startdt: a.toISOString(),
    enddt: b.toISOString(),
    body: details(s),
    location: s.online ? joinUrl(s.id) : "",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`;
};

export const downloadIcs = (s: CalendarSession) => {
  const [a, b] = span(s);
  const esc = (v: string) => v.replace(/[\\,;]/g, (c) => `\\${c}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//U.Psy//Session//EN",
    "BEGIN:VEVENT",
    `UID:${s.id}@upsy.ma`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(a)}`,
    `DTEND:${stamp(b)}`,
    `SUMMARY:${esc(s.title)}`,
    `DESCRIPTION:${esc(details(s))}`,
    ...(s.online ? [`URL:${joinUrl(s.id)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: "upsy-session.ics",
  });
  link.click();
  URL.revokeObjectURL(url);
};

/** Tell the other party about a booking change by email. Best effort: the
 *  booking is already saved and the in-app notice already exists. */
export const notifyBookingChange = (bookingId: string) =>
  supabase.functions
    .invoke("booking-email", { body: { booking_id: bookingId } })
    .catch(() => undefined);
