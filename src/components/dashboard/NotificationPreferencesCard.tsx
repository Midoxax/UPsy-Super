import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Smartphone, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Prefs = {
  email_bookings: boolean;
  email_reminders: boolean;
  email_payments: boolean;
  email_gamification: boolean;
  inapp_all: boolean;
};

const DEFAULT_PREFS: Prefs = {
  email_bookings: true,
  email_reminders: true,
  email_payments: true,
  email_gamification: false,
  inapp_all: true,
};

const PREF_ROWS: { key: keyof Prefs; label: string; desc: string; icon: typeof Mail }[] = [
  { key: "email_bookings", label: "Booking emails", desc: "Session confirmations, proposals, and declines", icon: Mail },
  { key: "email_reminders", label: "Reminder emails", desc: "Upcoming session reminders", icon: Mail },
  { key: "email_payments", label: "Payment emails", desc: "Receipts and payment confirmations", icon: Mail },
  { key: "email_gamification", label: "Achievement emails", desc: "XP milestones, streaks, and badges", icon: Mail },
  { key: "inapp_all", label: "In-app notifications", desc: "Show notification bell alerts", icon: Bell },
];

export default function NotificationPreferencesCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    setPushSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          email_bookings: data.email_bookings,
          email_reminders: data.email_reminders,
          email_payments: data.email_payments,
          email_gamification: data.email_gamification,
          inapp_all: data.inapp_all,
        });
      }
      // Check push subscription
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setPushEnabled(!!sub);
        }
      }
      setLoading(false);
    };
    void load();
  }, [user]);

  const toggle = async (key: keyof Prefs) => {
    if (!user) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      setPrefs(prefs); // revert
      toast({ title: "Error saving preference", variant: "destructive" });
    }
  };

  const togglePush = async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
        setPushEnabled(false);
        toast({ title: "Push notifications disabled" });
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({ title: "Permission denied", description: "Enable notifications in your browser settings.", variant: "destructive" });
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: undefined, // VAPID key needed for production
        });
        const json = sub.toJSON();
        if (user && json.keys) {
          await supabase.from("push_subscriptions").upsert({
            user_id: user.id,
            endpoint: sub.endpoint,
            p256dh: json.keys.p256dh ?? "",
            auth_key: json.keys.auth ?? "",
          }, { onConflict: "endpoint" });
        }
        setPushEnabled(true);
        toast({ title: "Push notifications enabled" });
      }
    } catch (e) {
      toast({ title: "Push setup failed", description: "Your browser may not support push notifications.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-5">
      <div>
        <h2 className="text-h3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how you want to be notified about activity on your account.
        </p>
      </div>

      <div className="space-y-4">
        {PREF_ROWS.map(({ key, label, desc, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              disabled={saving}
            />
          </div>
        ))}

        {pushSupported && (
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/30">
            <div className="flex items-start gap-3">
              <Smartphone className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium">Push notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive alerts even when the app is closed
                </p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={togglePush}
            />
          </div>
        )}
      </div>

      {saving && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </p>
      )}
    </div>
  );
}