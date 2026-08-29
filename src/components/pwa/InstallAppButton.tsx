import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Share, Plus, Copy, ExternalLink, AlertTriangle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  // iOS Safari
  (navigator as any).standalone === true;

const ua = () => (typeof navigator !== "undefined" ? navigator.userAgent : "");
const isIOS = () => /iphone|ipad|ipod/i.test(ua());
const isAndroid = () => /android/i.test(ua());
const isFirefox = () => /firefox|fxios/i.test(ua());
const isSamsung = () => /samsungbrowser/i.test(ua());
// Detect in-app browsers (Facebook, Instagram, LinkedIn, TikTok, etc.) where install is blocked
const isInAppBrowser = () => {
  const u = ua().toLowerCase();
  return /(fban|fbav|fbios|instagram|line|linkedinapp|micromessenger|tiktok|snapchat|pinterest|wv\)|; wv)/.test(u);
};
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

interface Props {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  "aria-label"?: string;
}

const InstallAppButton = ({
  variant = "default",
  size = "default",
  className,
  label = "Install app",
  "aria-label": ariaLabel,
}: Props) => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  // SSR renders nothing (window checks below are browser-only); reveal after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || installed) return null;
  // Inside Lovable preview iframe, install events are blocked. Hide quietly.
  if (isInIframe()) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    // Fallback: iOS Safari, Firefox, in-app browsers, or any browser without prompt support
    setShowHelp(true);
  };

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://upsy.ma";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = siteUrl;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      document.body.removeChild(ta);
    }
  };

  const openInBrowser = () => {
    // intent:// works on Android to escape some in-app webviews into Chrome
    if (isAndroid()) {
      const host = window.location.host;
      const path = window.location.pathname + window.location.search;
      window.location.href = `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    // iOS / others: just try opening in a new tab
    window.open(siteUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        aria-label={ariaLabel || label || "Install app"}
      >
        <Download className="h-4 w-4" />
        {label && <span className="ml-2">{label}</span>}
      </Button>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Install U.Psy on your device
            </DialogTitle>
            <DialogDescription>
              Add U.Psy to your home screen for a full-app experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            {isInAppBrowser() && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>You're inside an in-app browser</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apps like Facebook, Instagram, LinkedIn or TikTok don't allow installing.
                  Open U.Psy in your real browser (Chrome / Safari) first.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={openInBrowser} className="gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Open in browser
                  </Button>
                  <Button size="sm" variant="ghost" onClick={copyLink} className="gap-1">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                </div>
              </div>
            )}

            {isIOS() ? (
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <span>Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button in Safari's toolbar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <span>Scroll and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>Add to Home Screen</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner.</span>
                </li>
              </ol>
            ) : isFirefox() && isAndroid() ? (
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <span>Tap the <strong>⋮</strong> menu (top right).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <span>Tap <strong>Install</strong> or <strong>Add to Home screen</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <span>Confirm — U.Psy will appear on your home screen.</span>
                </li>
              </ol>
            ) : isSamsung() ? (
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <span>Tap the <strong>menu</strong> (☰ bottom right).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <span>Tap <Plus className="inline h-4 w-4 mx-1" /> <strong>Add page to</strong> → <strong>Home screen</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <span>Confirm to add U.Psy.</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <span>Open the browser menu (<strong>⋮</strong> or <strong>⋯</strong>, usually top-right).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <span>Tap <strong>Install app</strong>, <strong>Add to Home screen</strong> or <strong>Create shortcut</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <span>Confirm to add U.Psy to your device.</span>
                </li>
              </ol>
            )}

            <div className="border-t pt-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                Can't find the install option? Some browsers (older Firefox, in-app browsers) don't support it. Use the shortcut below instead.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={copyLink} className="gap-1">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Link copied" : "Copy link"}
                </Button>
                <Button size="sm" variant="ghost" onClick={openInBrowser} className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Open in another browser
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallAppButton;