import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "@/lib/router-compat";
import { useOpsWorkspaces } from "../hooks/useOps";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, Activity, ShieldAlert, Calendar, ListChecks,
  Brain, Trash2, Cpu, Radio, Zap, ArrowUp,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

const CAPABILITIES = [
  { icon: Activity, label: "ANALYZE OPS", prompt: "Summarize all active operations and flag risks." },
  { icon: ShieldAlert, label: "FLAG RISKS", prompt: "Which tasks are overdue or critical right now?" },
  { icon: Calendar, label: "PLAN EVENT", prompt: "Draft a tighter timeline for our next event." },
  { icon: ListChecks, label: "TRIAGE", prompt: "Triage open tasks by impact and urgency." },
  { icon: Brain, label: "BRIEF TEAM", prompt: "Draft a psychological safety briefing for the team." },
];

const Waveform = ({ active }: { active: boolean }) => (
  <div className="flex items-end gap-[3px] h-4">
    {[0, 1, 2, 3, 4].map(i => (
      <span
        key={i}
        className={active ? "ops-wave-bar" : ""}
        style={{
          height: "100%",
          background: active
            ? undefined
            : "hsl(var(--ops-accent) / 0.25)",
          width: 3,
          borderRadius: 2,
          animationDelay: `${i * 0.12}s`,
        }}
      />
    ))}
  </div>
);

export const Director = () => {
  const { workspace: slug } = useParams<{ workspace: string }>();
  const { current } = useOpsWorkspaces(slug);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || !current || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text, ts: Date.now() }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ops-director", {
        body: { workspace_id: current.id, messages: next.map(({ role, content }) => ({ role, content })) },
      });
      if (error) throw error;
      const payload = data as any;
      const reply = payload?.message ?? payload?.reply ?? "(no reply)";
      setMessages(m => [...m, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch (e) {
      setMessages(m => [...m, {
        role: "assistant",
        content: `[CHANNEL ERROR] ${e instanceof Error ? e.message : "uplink failed"}`,
        ts: Date.now(),
      }]);
    } finally { setBusy(false); }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const tokenCount = useMemo(
    () => messages.reduce((n, m) => n + Math.ceil(m.content.length / 4), 0),
    [messages],
  );

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] max-w-6xl mx-auto px-6 py-6 ops-scanline">
      {/* HEADER BAR */}
      <div className="flex items-end justify-between mb-6 gap-6">
        <div>
          <div className="ops-mono text-[10px] tracking-[0.35em] text-white/40 flex items-center gap-2">
            <Radio className="h-3 w-3 ops-accent" /> / DIRECTOR · COGNITIVE UPLINK
          </div>
          <h1 className="ops-display text-4xl mt-2 flex items-center gap-3">
            <span className="relative">
              <Sparkles className="h-7 w-7 ops-accent" />
              <span className="absolute -inset-2 rounded-full ops-pulse" />
            </span>
            Director
          </h1>
          <div className="ops-mono text-[11px] text-white/40 mt-1">
            WORKSPACE: <span className="ops-accent">{current?.name ?? "—"}</span>
          </div>
        </div>

        {/* Telemetry strip */}
        <div className="hidden md:flex items-center gap-3">
          <div className="ops-glass px-4 py-2 flex items-center gap-3 ops-bracket">
            <Cpu className="h-4 w-4 ops-accent" />
            <div>
              <div className="ops-mono text-[9px] tracking-[0.2em] text-white/40">MODEL</div>
              <div className="ops-mono text-xs text-white/80">gpt-5 · OPS</div>
            </div>
          </div>
          <div className="ops-glass px-4 py-2 flex items-center gap-3 ops-bracket">
            <Zap className="h-4 w-4 ops-accent" />
            <div>
              <div className="ops-mono text-[9px] tracking-[0.2em] text-white/40">TOKENS</div>
              <div className="ops-mono text-xs text-white/80">{tokenCount.toLocaleString()}</div>
            </div>
          </div>
          <div className="ops-glass px-4 py-2 flex items-center gap-3 ops-bracket">
            <Waveform active={busy} />
            <div>
              <div className="ops-mono text-[9px] tracking-[0.2em] text-white/40">LINK</div>
              <div className="ops-mono text-xs ops-accent">{busy ? "STREAMING" : "READY"}</div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="ops-btn-ghost ops-btn"
              title="Clear channel"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MESSAGE STREAM */}
      <div
        ref={scrollRef}
        className="ops-glass flex-1 p-6 overflow-y-auto space-y-5 relative ops-bracket"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={p => send(p)} />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} timeFmt={formatTime} />
            ))}
          </AnimatePresence>
        )}

        {busy && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 ops-mono text-[11px] text-white/50"
          >
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--ops-accent))] ops-pulse" />
            DIRECTOR PROCESSING
            <span><span className="ops-dot" /><span className="ops-dot" /><span className="ops-dot" /></span>
          </motion.div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="mt-4 space-y-3">
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {CAPABILITIES.slice(0, 4).map(c => (
              <button
                key={c.label}
                onClick={() => send(c.prompt)}
                className="ops-cap-chip"
                disabled={busy}
              >
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="ops-director-input">
          <div className="inner">
            <Sparkles className="h-4 w-4 ops-accent shrink-0" />
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 bg-transparent outline-hidden resize-none text-sm text-white/90 placeholder:text-white/30 py-3 max-h-40"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Issue a directive… (Enter to transmit, Shift+Enter for new line)"
            />
            <button
              className="ops-btn"
              onClick={() => send()}
              disabled={busy || !input.trim()}
              title="Transmit"
            >
              {busy ? <Send className="h-4 w-4 animate-pulse" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between ops-mono text-[10px] tracking-[0.2em] text-white/30">
          <span>SECURE CHANNEL · END-TO-END · WORKSPACE-SCOPED</span>
          <span>{messages.length} EXCHANGES</span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onPick }: { onPick: (p: string) => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-full flex flex-col items-center justify-center text-center py-12"
  >
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
      className="relative mb-6"
    >
      <div className="absolute inset-0 rounded-full bg-[hsl(var(--ops-accent)/0.15)] blur-2xl" />
      <div className="relative h-20 w-20 rounded-full border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.08)] flex items-center justify-center">
        <Sparkles className="h-9 w-9 ops-accent" />
      </div>
    </motion.div>
    <h2 className="ops-display text-2xl mb-2">Cognitive uplink ready.</h2>
    <p className="text-white/50 text-sm max-w-md mb-8">
      The Director observes your workspace in realtime. Issue a directive or select a capability to begin.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
      {CAPABILITIES.map((c, i) => (
        <motion.button
          key={c.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onPick(c.prompt)}
          className="ops-glass ops-glass-hover p-4 text-left group ops-bracket"
        >
          <div className="flex items-center gap-2 mb-2">
            <c.icon className="h-4 w-4 ops-accent" />
            <span className="ops-mono text-[10px] tracking-[0.2em] text-white/60 group-hover:text-white">
              {c.label}
            </span>
          </div>
          <p className="text-xs text-white/50 group-hover:text-white/80 transition">
            {c.prompt}
          </p>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

const MessageBubble = ({ msg, timeFmt }: { msg: Msg; timeFmt: (n: number) => string }) => {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[82%] ops-holo ${isUser ? "ops-holo-user" : ""} p-4`}>
        <div className="flex items-center justify-between mb-2 gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${isUser ? "bg-[hsl(var(--ops-accent))]" : "bg-white/40"}`} />
            <span className="ops-mono text-[10px] tracking-[0.25em] text-white/50">
              {isUser ? "OPERATOR" : "DIRECTOR.AI"}
            </span>
          </div>
          <span className="ops-mono text-[9px] text-white/30">{timeFmt(msg.ts)}</span>
        </div>
        <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed relative z-10">
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
};

export default Director;