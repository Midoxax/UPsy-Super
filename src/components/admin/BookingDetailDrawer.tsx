import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, X, RefreshCw, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { useCancelBooking, useRefundBooking, useRescheduleBooking } from "@/hooks/admin/useAdminMutations";

interface Props {
  bookingId: string | null;
  onClose: () => void;
}

export default function BookingDetailDrawer({ bookingId, onClose }: Props) {
  const open = !!bookingId;
  const { data: booking, isLoading } = useQuery({
    queryKey: ["admin-booking-detail", bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const { data, error } = await supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const [cancelReason, setCancelReason] = useState("");
  const [newSchedule, setNewSchedule] = useState("");
  const cancel = useCancelBooking();
  const refund = useRefundBooking();
  const reschedule = useRescheduleBooking();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Booking details</SheetTitle>
          <SheetDescription>{bookingId}</SheetDescription>
        </SheetHeader>
        {isLoading || !booking ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-4 mt-6">
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span>{format(new Date(booking.scheduled_at), "PPp")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline">{booking.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><Badge variant="outline">{booking.payment_status ?? "unpaid"}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>{booking.amount_mad ?? 0} MAD</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{booking.session_type}</span></div>
              {booking.patient_notes && <div className="pt-2 border-t"><p className="text-xs text-muted-foreground mb-1">Patient notes</p><p>{booking.patient_notes}</p></div>}
            </div>

            {booking.video_room_id && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/session/${booking.id}`} target="_blank" rel="noreferrer">
                  <Video className="h-4 w-4 mr-1" />
                  {booking.status === "proposed" ? "Open invitation page" : "Open video room"}
                </a>
              </Button>
            )}

            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold">Reschedule</h4>
              <Input type="datetime-local" value={newSchedule} onChange={(e) => setNewSchedule(e.target.value)} />
              <Button
                size="sm"
                disabled={!newSchedule}
                onClick={() => reschedule.mutate({ bookingId: bookingId!, scheduledAt: new Date(newSchedule).toISOString() })}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Reschedule
              </Button>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold">Cancel</h4>
              <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => cancel.mutate({ bookingId: bookingId!, reason: cancelReason || undefined }, { onSuccess: onClose })}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel booking
                </Button>
                {booking.payment_status !== "refunded" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refund.mutate({ bookingId: bookingId!, reason: cancelReason || undefined })}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> Refund
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
