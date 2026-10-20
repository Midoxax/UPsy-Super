import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type CalendarSession,
  downloadIcs,
  googleCalendarUrl,
  outlookCalendarUrl,
} from "@/lib/calendar";

export const AddToCalendar = ({ session }: { session: CalendarSession }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <CalendarPlus className="h-3.5 w-3.5 mr-1" /> Add to calendar
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <a
          href={googleCalendarUrl(session)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Calendar
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a
          href={outlookCalendarUrl(session)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Outlook
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => downloadIcs(session)}>
        Apple / other (.ics)
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
