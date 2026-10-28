import { getFirstTouch } from "@/lib/attribution";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setSentryUser } from "@/lib/analytics/sentry";
import { identifyAnonymous } from "@/lib/analytics/posthog";
import { useAdminPreview } from "@/components/admin/AdminPreviewProvider";
import { addLocalePrefix, getLocaleFromPath } from "@/lib/i18n/utils";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    redirectAfter?: string,
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Where the email-confirmation link lands. Shared by sign-up and "resend
 * confirmation" so both links behave the same. With a ?redirect= target we land
 * on /auth so it can finalize and forward the user to the page they originally
 * tried to reach; otherwise straight to My Space — in the visitor's locale, so
 * a French visitor isn't dropped onto the English page after verifying.
 */
export const buildEmailRedirectUrl = (redirectAfter?: string): string => {
  const locale = getLocaleFromPath(window.location.pathname);
  const safe =
    redirectAfter && !redirectAfter.startsWith("/auth") ? redirectAfter : "";
  return safe
    ? `${window.location.origin}${addLocalePrefix("/auth", locale)}?verified=1&redirect=${encodeURIComponent(safe)}`
    : `${window.location.origin}${addLocalePrefix("/my-space", locale)}`;
};

// Idle timeouts: clinical/admin roles auto-logout after 30 min, regular users after 24h.
const PRIVILEGED_IDLE_MS = 30 * 60 * 1000;
const DEFAULT_IDLE_MS = 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const idleTimerRef = useRef<number | null>(null);
  const idleLimitRef = useRef<number>(DEFAULT_IDLE_MS);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      const uid = session?.user?.id ?? null;
      setSentryUser(uid);
      if (uid) identifyAnonymous(uid);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      const uid = session?.user?.id ?? null;
      setSentryUser(uid);
      if (uid) identifyAnonymous(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Returning to the tab (or regaining connectivity) after a long time can leave
  // an expired access token in memory: autoRefreshToken pauses while the tab is
  // hidden. Re-validate on focus so the first action after coming back works.
  useEffect(() => {
    const revalidate = async () => {
      if (document.visibilityState !== "visible") return;
      const { data, error } = await supabase.auth.getSession();
      if (error) return;
      if (data.session) {
        const expiresAt = (data.session.expires_at ?? 0) * 1000;
        if (expiresAt - Date.now() < 60_000) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session) {
            setSession(refreshed.session);
            setUser(refreshed.session.user);
            return;
          }
        }
        setSession(data.session);
        setUser(data.session.user);
      } else {
        setSession(null);
        setUser(null);
      }
    };

    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("online", revalidate);
    return () => {
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("online", revalidate);
    };
  }, []);

  // Idle-timeout watcher. Resets on user activity; signs out after the limit.
  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
      return;
    }

    let cancelled = false;

    const computeLimit = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      const roles = error ? [] : (data ?? []).map((r) => r.role as string);
      const privileged =
        roles.includes("admin") || roles.includes("psychologist");
      idleLimitRef.current = privileged ? PRIVILEGED_IDLE_MS : DEFAULT_IDLE_MS;
      resetTimer();
    };

    const resetTimer = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(async () => {
        await supabase.auth.signOut();
        toast.info("You were signed out due to inactivity.");
      }, idleLimitRef.current);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true }),
    );

    computeLimit();

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    redirectAfter?: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildEmailRedirectUrl(redirectAfter),
        data: {
          full_name: fullName,
          // Copied to the CRM contact by crm_link_profile_to_contact.
          first_touch: getFirstTouch(),
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    try {
      // Global revoke; if the refresh token is already gone the server answers
      // 403 and the SDK leaves the local session behind — hence the fallback.
      const { error } = await supabase.auth.signOut();
      if (error) await supabase.auth.signOut({ scope: "local" });
    } catch {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    }
    setSession(null);
    setUser(null);
    try {
      sessionStorage.removeItem("upsy:post-oauth-redirect");
    } catch {
      /* private mode */
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  const preview = useAdminPreview();
  // Inside the admin "view as" frame, report the viewed user so dashboards
  // load their data. Memoised: components depend on the user object's
  // identity in effect dependencies.
  const realUser = context?.user ?? null;
  const viewedId = preview.isPreview ? preview.previewUserId : null;
  const viewedEmail = preview.previewEmail;
  const user = useMemo(
    () =>
      realUser && viewedId
        ? ({
            ...realUser,
            id: viewedId,
            email: viewedEmail ?? undefined,
          } as User)
        : realUser,
    [realUser, viewedId, viewedEmail],
  );
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  if (user === realUser) return context;
  return { ...context, user };
};
