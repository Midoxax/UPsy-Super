import { useState } from "react";
import { Smartphone, Apple, Chrome, Copy, Check, ExternalLink, AlertTriangle, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import SEOHead from "@/components/SEOHead";

const ua = () => (typeof navigator !== "undefined" ? navigator.userAgent : "");
const isIOS = () => /iphone|ipad|ipod/i.test(ua());
const isAndroid = () => /android/i.test(ua());
const isInAppBrowser = () => {
  const u = ua().toLowerCase();
  return /(fban|fbav|fbios|instagram|line|linkedinapp|micromessenger|tiktok|snapchat|pinterest|wv\)|; wv)/.test(u);
};

const Install = () => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin : "https://upsy.ma";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      document.body.removeChild(ta);
    }
  };

  const openInBrowser = () => {
    if (isAndroid()) {
      const host = window.location.host;
      window.location.href = `intent://${host}/install#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    window.open(url + "/install", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <SEOHead
        title="Install U.Psy on your phone"
        description="Add U.Psy to your home screen for a full-app experience — works on iPhone, Android, and any modern browser."
        path="/install"
      />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-5">
            <Smartphone className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Install the U.Psy app
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get U.Psy on your home screen — faster loading, full-screen, and instant access to Nour AI, your assessments and your bookings.
          </p>
          <div className="mt-6">
            <InstallAppButton size="lg" label="Install U.Psy now" />
          </div>
        </header>

        {isInAppBrowser() && (
          <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-medium">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <span>You opened this from an in-app browser</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apps like Facebook, Instagram, LinkedIn or TikTok block installation.
                Open this page in your real browser (Chrome, Safari, Samsung Internet) first.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={openInBrowser} variant="default" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Open in my browser
                </Button>
                <Button onClick={copy} variant="outline" size="sm" className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Link copied" : "Copy link"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 font-medium">
                <Apple className="h-5 w-5" />
                iPhone & iPad (Safari)
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <span>Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> icon in Safari.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <span>Scroll down → <Plus className="inline h-4 w-4 mx-1" /> <strong>Add to Home Screen</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <span>Tap <strong>Add</strong> — U.Psy lands on your home screen.</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 font-medium">
                <Chrome className="h-5 w-5" />
                Android (Chrome / Samsung / Firefox)
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <span>Open the menu (<strong>⋮</strong> top-right, or ☰ on Samsung).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <span>Tap <strong>Install app</strong>, <strong>Add to Home screen</strong>, or <strong>Add page to → Home screen</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <span>Confirm to add U.Psy.</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6 space-y-3">
            <h2 className="font-medium">Can't install? Use the shortcut</h2>
            <p className="text-sm text-muted-foreground">
              Some browsers (older Firefox, in-app browsers) don't support installation. You can still keep U.Psy one tap away — just bookmark or copy the link below.
            </p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm font-mono break-all">
              {url}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copy} variant="default" size="sm" className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link copied" : "Copy link"}
              </Button>
              <Button onClick={openInBrowser} variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" /> Open in another browser
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Tip: send this link to yourself by SMS, WhatsApp or email, then open it in Safari (iPhone) or Chrome (Android) and follow the steps above.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Install;