import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Reply = { q: string; a: string };

/** Pinned Director console — collapsed FAB, expands to a one-shot prompt panel. */
export const QuickPrompt = ({ workspaceId, workspaceSlug }: { workspaceId?: string; workspaceSlug?: string }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<Reply | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || !workspaceId || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ops-director", {
        body: { workspace_id: workspaceId, messages: [{ role: "user", content: text }] },
      });
      if (error) throw error;
      const payload = data as any;
      setLast({ q: text, a: payload?.message ?? payload?.reply ?? "(no reply)" });
      setInput("");
    } catch (e) {
      setLast({ q: text, a: `[CHANNEL ERROR] ${e instanceof Error ? e.message : "uplink failed"}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="ops-glass ops-bracket mb-3 w-[380px] max-w-[calc(100vw-3rem)] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="ops-mono text-[10px] tracking-[0.25em] text-white/50 flex items-center gap-2">
                <Sparkles className="h-3 w-3 ops-accent" /> DIRECTOR · QUICK PROMPT
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80 transition" aria-label="Close">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {last && (
              <div className="mb-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                <div className="ops-mono text-[10px] text-white/40">YOU</div>
                <div className="text-xs text-white/75">{last.q}</div>
                <div className="ops-mono text-[10px] ops-accent mt-2">DIRECTOR</div>
                <div className="text-xs text-white/85 whitespace-pre-wrap leading-relaxed">{last.a}</div>
              </div>
            )}

            <div className="ops-director-input">
              <div className="inner">
                <Sparkles className="h-4 w-4 ops-accent shrink-0" />
                <textarea
                  rows={1}
                  className="flex-1 bg-transparent outline-hidden resize-none text-sm text-white/90 placeholder:text-white/30 py-2 max-h-32"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder="Ask the Director…"
                  autoFocus
                />
                <button className="ops-btn" onClick={send} disabled={busy || !input.trim()} title="Transmit">
                  <ArrowUp className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
                </button>
              </div>
            </div>

            {workspaceSlug && (
              <Link
                to={`/ops/${workspaceSlug}/director`}
                className="mt-3 inline-flex items-center gap-1.5 ops-mono text-[10px] tracking-[0.2em] text-white/40 hover:ops-accent transition"
              >
                OPEN FULL CHANNEL <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setOpen(o => !o)} className="ops-fab" style={{ position: "static" }}>
        <Sparkles className="h-4 w-4" /> {open ? "Hide Director" : "Ask Director"}
      </button>
    </div>
  );
};

export default QuickPrompt;