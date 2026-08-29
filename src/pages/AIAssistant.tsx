import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import CrisisModal from "@/components/dashboard/CrisisModal";
import {
  Send, Loader2, Plus, Wind, BookOpen, Heart, Brain,
  Sparkles, Moon, Target, Lock, Heart as HeartIcon, Activity, GraduationCap, Notebook,
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useSearchParams } from "@/lib/router-compat";
import { cn } from "@/lib/utils";
import { NourEmergence, Pulse } from "@/lib/motion";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

type Msg = { role: "user" | "assistant"; content: string; id: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const DISTRESS_PATTERNS = /\b(suicid|kill\s*my\s*self|end\s*(my|it\s*all)|don'?t\s*want\s*to\s*live|self[- ]?harm|hurt\s*myself|no\s*reason\s*to\s*live|hopeless|overdose)\b/i;

type Locale = "en" | "fr" | "ar";

type Personality = "companion" | "coach" | "tutor" | "reflective";

const PERSONALITY_META: Record<
  Personality,
  { icon: typeof HeartIcon; label: Record<Locale, string>; subtitle: Record<Locale, string> }
> = {
  companion: {
    icon: HeartIcon,
    label: { en: "Companion", fr: "Compagnon", ar: "رفيق" },
    subtitle: {
      en: "AI wellness companion",
      fr: "Compagnon de bien-être",
      ar: "رفيق العافية",
    },
  },
  coach: {
    icon: Activity,
    label: { en: "Coach", fr: "Coach", ar: "مدرّب" },
    subtitle: {
      en: "Performance coach",
      fr: "Coach de performance",
      ar: "مدرّب الأداء",
    },
  },
  tutor: {
    icon: GraduationCap,
    label: { en: "Tutor", fr: "Tuteur", ar: "مرشد" },
    subtitle: {
      en: "Socratic lesson tutor",
      fr: "Tuteur de leçon socratique",
      ar: "مرشد الدروس",
    },
  },
  reflective: {
    icon: Notebook,
    label: { en: "Reflective", fr: "Réflexif", ar: "تأمّلي" },
    subtitle: {
      en: "Journal reflection",
      fr: "Réflexion de journal",
      ar: "تأمّل اليوميات",
    },
  },
};

const QUICK_PROMPTS: Record<Locale, { icon: typeof Wind; label: string; msg: string }[]> = {
  en: [
    { icon: Wind,     label: "Breathing",   msg: "Guide me through a calming breathing exercise right now." },
    { icon: BookOpen, label: "Journal",     msg: "Give me a meaningful journaling prompt for today." },
    { icon: Heart,    label: "Anxious",     msg: "I'm feeling anxious. Can you help me ground myself?" },
    { icon: Brain,    label: "Burnout",     msg: "I think I might be burning out. What can I do?" },
    { icon: Moon,     label: "Can't sleep", msg: "I can't sleep. Help me wind down." },
    { icon: Target,   label: "Focus",       msg: "I can't focus today. Help me reset." },
  ],
  fr: [
    { icon: Wind,     label: "Respiration", msg: "Guide-moi dans un exercice de respiration apaisante." },
    { icon: BookOpen, label: "Journal",     msg: "Donne-moi une question de journal pour aujourd'hui." },
    { icon: Heart,    label: "Anxieux",     msg: "Je me sens anxieux. Peux-tu m'aider à m'ancrer ?" },
    { icon: Brain,    label: "Burnout",     msg: "Je crois que je suis en burnout. Que puis-je faire ?" },
    { icon: Moon,     label: "Sommeil",     msg: "Je n'arrive pas à dormir. Aide-moi à me détendre." },
    { icon: Target,   label: "Focus",       msg: "Je n'arrive pas à me concentrer. Aide-moi à recadrer." },
  ],
  ar: [
    { icon: Wind,     label: "تنفّس",       msg: "ساعدني في تمرين تنفس مهدئ الآن." },
    { icon: BookOpen, label: "تدوين",       msg: "اقترح عليّ سؤال تدوين عميق لهذا اليوم." },
    { icon: Heart,    label: "قلق",         msg: "أشعر بالقلق. ساعدني في تمرين تأريض." },
    { icon: Brain,    label: "إرهاق",       msg: "أعتقد أنني أعاني من الإرهاق. ماذا أفعل؟" },
    { icon: Moon,     label: "نوم",         msg: "لا أستطيع النوم. ساعدني على الاسترخاء." },
    { icon: Target,   label: "تركيز",       msg: "لا أستطيع التركيز اليوم. ساعدني على إعادة الضبط." },
  ],
};

const greetingFor = (locale: string, name?: string) => {
  const hour = new Date().getHours();
  const l: Locale = locale === "fr" ? "fr" : locale === "ar" ? "ar" : "en";
  const part =
    l === "fr"
      ? hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"
      : l === "ar"
        ? hour < 12 ? "صباح الخير" : hour < 18 ? "مساء النور" : "مساء الخير"
        : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  if (name) return `${part}, ${name} 👋`;
  return l === "fr" ? `${part}, je suis Nour` : l === "ar" ? `${part}، أنا نور` : `${part}, I'm Nour`;
};

const SUBTITLE: Record<Locale, string> = {
  en: "Your safe space to talk, reflect, and find calm. I'm here whenever you need me.",
  fr: "Un espace sûr pour parler, réfléchir et retrouver le calme. Je suis là quand tu as besoin.",
  ar: "مساحة آمنة للحديث والتأمل واستعادة الهدوء. أنا هنا عندما تحتاجني.",
};

const DISCLAIMER: Record<Locale, { lead: string; link: string; crisis: string }> = {
  en: { lead: "Nour is not a therapist. For serious concerns,", link: "speak with a professional", crisis: "In crisis? Call SOS Amitié Maroc 0801 00 0180 (24/7)." },
  fr: { lead: "Nour n'est pas un thérapeute. Pour des préoccupations sérieuses,", link: "parlez à un professionnel", crisis: "En crise ? Appelez SOS Amitié Maroc 0801 00 0180 (24h/24)." },
  ar: { lead: "نور ليس معالجاً نفسياً. للحالات الجدية،", link: "تحدث مع مختص", crisis: "في حالة أزمة؟ اتصل بـ SOS Amitié Maroc 0801 00 0180 (24/7)." },
};

const MsgBubble = ({ msg }: { msg: Msg }) => {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5",
        isUser
          ? "bg-primary/15 text-primary"
          : "bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-600"
      )}>
        {isUser ? "You" : "N"}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-surface border border-border rounded-tl-sm"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-headings:my-2">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-teal-600 flex-shrink-0">
      N
    </div>
    <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
      <span className="text-xs text-muted-foreground italic">Nour is thinking</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-teal-500/60"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const AIAssistant = () => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const { toast } = useToast();
  const l: Locale = locale === "fr" ? "fr" : locale === "ar" ? "ar" : "en";
  const isRtl = l === "ar";

  const [searchParams, setSearchParams] = useSearchParams();
  const initialPersonality = ((): Personality => {
    const p = searchParams.get("mode");
    return p === "coach" || p === "tutor" || p === "reflective" ? p : "companion";
  })();
  const [personality, setPersonality] = useState<Personality>(initialPersonality);

  const changePersonality = (p: Personality) => {
    setPersonality(p);
    const next = new URLSearchParams(searchParams);
    if (p === "companion") next.delete("mode"); else next.set("mode", p);
    setSearchParams(next, { replace: true });
  };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string } | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setUserProfile({ name: data.full_name.split(" ")[0] });
      });
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim(), id: uuidv4() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const payload = {
      messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      context: {
        firstName: userProfile?.name ?? null,
        locale: l,
        personality,
      },
    };

    // Check user message for distress keywords
    if (DISTRESS_PATTERNS.test(text)) {
      setCrisisOpen(true);
    }

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (resp.status === 429) {
        toast({ title: "Too many messages", description: "Please wait a moment.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: "Service unavailable", description: "Please try again later.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const assistantId = uuidv4();
      let fullText = "";

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).replace(/\r$/, "");
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.choices?.[0]?.delta?.content ?? "";
            if (chunk) {
              fullText += chunk;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m);
                }
                return [...prev, { role: "assistant", content: fullText, id: assistantId }];
              });
            }
          } catch (_) { /* skip partial */ }
        }
      }
    } catch (e) {
      toast({
        title: "Connection issue",
        description: "Couldn't reach Nour. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [messages, isLoading, toast, l, personality, userProfile?.name]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setInput("");
  };

  const isFirstMessage = messages.length === 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-16 z-30">
        <div className="container-custom h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Nour</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                {PERSONALITY_META[personality].subtitle[l]}
              </p>
            </div>
            <Pulse size={8} colorClass="bg-green-500" className="ml-1" />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-1 rounded-full border border-border bg-surface p-0.5"
              role="tablist"
              aria-label="Nour personality"
            >
              {(Object.keys(PERSONALITY_META) as Personality[]).map((p) => {
                const Icon = PERSONALITY_META[p].icon;
                const active = personality === p;
                return (
                  <button
                    key={p}
                    role="tab"
                    aria-selected={active}
                    onClick={() => changePersonality(p)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title={PERSONALITY_META[p].subtitle[l]}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{PERSONALITY_META[p].label[l]}</span>
                  </button>
                );
              })}
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={resetConversation} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                New chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container-custom max-w-2xl py-6 space-y-4">
          {isFirstMessage && (
            <div className="text-center py-8 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
              <div className="mx-auto">
                <NourEmergence size={160} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {greetingFor(l, userProfile?.name)}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  {SUBTITLE[l]}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto pt-2">
                {QUICK_PROMPTS[l].map(({ icon: Icon, label, msg }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(msg)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 text-sm text-left transition-all group"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    <span className="text-muted-foreground group-hover:text-foreground">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70 pt-2">
                <Lock className="h-3 w-3" />
                <span>
                  {l === "fr" ? "Tes échanges restent privés." : l === "ar" ? "محادثاتك تبقى خاصة." : "Your conversations stay private."}
                </span>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MsgBubble key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingDots />}
          <div ref={endRef} />
        </div>
      </div>

      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} riskLevel="high" />

      {/* Input area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-xl sticky bottom-0">
        <div className="container-custom max-w-2xl py-4">
          {!user && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 mb-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs">
              <p className="text-amber-600">Sign in to save your conversations and unlock memory.</p>
              <div className="w-40"><SocialAuthButtons /></div>
              <Button variant="outline" size="sm" asChild className="text-xs h-7">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={
                  locale === "fr" ? "Écrivez quelque chose…"
                    : locale === "ar" ? "اكتب شيئاً…"
                    : "Write something…"
                }
                rows={1}
                className={cn("resize-none bg-surface min-h-[44px] max-h-[160px] pr-4 scrollbar-thin")}
                style={{ height: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                }}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground/60 text-center mt-2 space-y-1" dir={isRtl ? "rtl" : "ltr"}>
            <p>
              {DISCLAIMER[l].lead}{" "}
              <Link to="/psychologists" className="underline hover:text-muted-foreground">
                {DISCLAIMER[l].link}
              </Link>.
            </p>
            <p className="text-amber-700/70 dark:text-amber-400/60">{DISCLAIMER[l].crisis}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
