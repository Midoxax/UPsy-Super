import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/upsy-logo.png.asset.json";

const colors = [
  { name: "Primary Burgundy", var: "--burgundy", hex: "#7A0C20", usage: "Brand identity, headers, accents" },
  { name: "Dark Background", var: "--charcoal", hex: "#1A1A1A", usage: "Page backgrounds, surfaces" },
  { name: "Gold Accent", var: "--gold-accent", hex: "#FFB300", usage: "CTAs, highlights, actions" },
  { name: "Gold Highlight", var: "--gold-highlight", hex: "#F4A300", usage: "Secondary gold, gradients" },
  { name: "Crimson Support", var: "--crimson", hex: "#A3263A", usage: "Supporting accent, alerts" },
  { name: "Clinical Blue", var: "--clinical-blue", hex: "#2E5E99", usage: "SaaS dashboards, data" },
  { name: "Lavender", var: "--lavender", hex: "#A89EC8", usage: "Soft accents, tags" },
  { name: "Turquoise", var: "--turquoise", hex: "#2EB8A8", usage: "Success states, wellness" },
];

const typography = [
  { level: "Display", size: "72px", weight: "600", sample: "U.Psy" },
  { level: "H1", size: "48px", weight: "600", sample: "Your Personal Psychologist" },
  { level: "H2", size: "36px", weight: "600", sample: "The U.Psy Ecosystem" },
  { level: "H3", size: "26px", weight: "500", sample: "Care · Learning · Performance" },
  { level: "Body", size: "18px", weight: "400", sample: "Evidence-based psychology and mental performance coaching for individuals, athletes, and organizations." },
  { level: "Button", size: "16px", weight: "500", sample: "Find a Psychologist" },
];

const motionTypes = [
  { name: "Float", class: "motion-float", desc: "Hero objects, icons — slow vertical drift", duration: "6s" },
  { name: "Pulse", class: "motion-pulse", desc: "Emotional states, AI tools — gentle expand/contract", duration: "3s" },
  { name: "Breathe", class: "motion-breathe", desc: "Loading states — calm inhale/exhale rhythm", duration: "2.4s" },
  { name: "Orbit", class: "motion-orbit", desc: "Cognitive/learning metaphors — continuous rotation", duration: "12s" },
  { name: "Ring Pulse", class: "motion-ring-pulse", desc: "Session reminders, notifications", duration: "2s" },
  { name: "Shimmer", class: "motion-shimmer", desc: "Completion states, achievements", duration: "3s" },
];

const ColorSwatch = ({ color }: { color: typeof colors[0] }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card !p-0 overflow-hidden group cursor-pointer" onClick={copy}>
      <div className="h-24" style={{ background: color.hex }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-foreground">{color.name}</h4>
          {copied ? <Check className="w-3.5 h-3.5 text-u-gold" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        <code className="text-xs text-u-gold">{color.hex}</code>
        <p className="text-xs text-muted-foreground mt-1">{color.usage}</p>
      </div>
    </div>
  );
};

const BrandGuidelines = () => {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="hero-neural-bg min-h-[50vh] flex items-center">
        <div className="container-custom relative z-10 py-20">
          <ScrollReveal>
            <div className="max-w-3xl">
              <p className="text-u-gold text-sm font-medium tracking-widest uppercase mb-4">Visual Identity</p>
              <h1 className="text-display mb-6">U.Psy Brand Guidelines</h1>
              <p className="text-body text-u-gray-200 max-w-xl">
                A comprehensive design system ensuring consistency across website, social media, documents, and all brand touchpoints.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Logo */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 mb-4">Logo System</h2>
            <p className="text-body text-u-gray-300 mb-10 max-w-2xl">
              Three logo variants for different contexts — from full lockup to compact icon mark.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Primary Lockup", desc: "Website header, presentations, documents", content: (
                <img src={logoAsset.url} alt="U.Psy logo" className="h-12 w-auto object-contain" />
              )},
              { label: "Compact Logo", desc: "Mobile nav, social banners", content: (
                <img src={logoAsset.url} alt="U.Psy logo" className="h-9 w-auto object-contain" />
              )},
              { label: "Icon Mark", desc: "Favicon, app icon, avatars", content: (
                <img src={logoAsset.url} alt="U.Psy logo" className="h-16 w-auto object-contain" />
              )},
            ].map((item) => (
              <div key={item.label} className="glass-card flex flex-col items-center text-center">
                <div className="h-24 flex items-center justify-center mb-4">{item.content}</div>
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 mb-4">Color Palette</h2>
            <p className="text-body text-u-gray-300 mb-10 max-w-2xl">
              Burgundy for identity, gold for actions, charcoal for surfaces. Click any swatch to copy the hex value.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((c) => <ColorSwatch key={c.hex} color={c} />)}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 mb-4">Typography</h2>
            <p className="text-body text-u-gray-300 mb-10 max-w-2xl">
              Outfit as the primary typeface — clean, modern, and highly legible across all sizes.
            </p>
          </ScrollReveal>
          <div className="space-y-6">
            {typography.map((t) => (
              <div key={t.level} className="glass-card !p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="md:w-32 shrink-0">
                  <span className="text-xs text-u-gold font-medium uppercase tracking-wider">{t.level}</span>
                  <p className="text-xs text-muted-foreground">{t.size} / {t.weight}</p>
                </div>
                <p style={{ fontSize: Math.min(parseInt(t.size), 48), fontWeight: parseInt(t.weight), lineHeight: 1.3 }} className="text-foreground">
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glass UI */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 mb-4">Glass UI Components</h2>
            <p className="text-body text-u-gray-300 mb-10 max-w-2xl">
              Semi-transparent surfaces with subtle borders, simulating glass depth without performance-heavy blur.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card">
              <h3 className="text-h3 mb-2">Standard Card</h3>
              <p className="text-sm text-muted-foreground">Default glass card with hover lift + scale + gold border glow.</p>
            </div>
            <div className="card-float p-7">
              <h3 className="text-h3 mb-2">Float Card</h3>
              <p className="text-sm text-muted-foreground">Alternative with gold border highlight on hover.</p>
            </div>
            <div className="glass-card motion-shimmer">
              <h3 className="text-h3 mb-2">Shimmer Card</h3>
              <p className="text-sm text-muted-foreground">Achievement or completion state with gold shimmer sweep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Motion */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 mb-4">Motion Language</h2>
            <p className="text-body text-u-gray-300 mb-10 max-w-2xl">
              All animations follow a calm, breathing rhythm — never faster than 200ms, never aggressive.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {motionTypes.map((m) => (
              <div key={m.name} className="glass-card !p-6 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full mb-4 ${m.class}`} style={{ background: "linear-gradient(135deg, #FFB300, #F4A300)" }} />
                <h3 className="text-sm font-semibold text-foreground">{m.name}</h3>
                <code className="text-xs text-u-gold my-1">.{m.class}</code>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
                <span className="text-[10px] text-u-gray-400 mt-1">{m.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice */}
      <section className="section-spacing liquid-bg">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-h2 mb-4">Brand Voice</h2>
            <p className="text-body text-u-gray-300 mb-10 max-w-2xl">
              Clear, supportive, and evidence-based. Never alarmist or prescriptive.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            <div className="glass-card !p-6 border-destructive/20">
              <p className="text-xs text-destructive font-medium uppercase tracking-wider mb-3">Avoid</p>
              <p className="text-sm text-muted-foreground italic">"Fix your anxiety."</p>
              <p className="text-sm text-muted-foreground italic mt-2">"You need therapy now."</p>
            </div>
            <div className="glass-card !p-6" style={{ borderColor: "rgba(255,179,0,0.2)" }}>
              <p className="text-xs text-u-gold font-medium uppercase tracking-wider mb-3">Preferred</p>
              <p className="text-sm text-foreground">"Learn strategies to manage anxiety and improve wellbeing."</p>
              <p className="text-sm text-foreground mt-2">"Explore how professional support can help you thrive."</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BrandGuidelines;
