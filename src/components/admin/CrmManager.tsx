// Internal CRM console — the working surface for every acquisition funnel.
//
// ANONYMITY WALL: this component never reads `survey_responses`. Observatoire
// figures here count OPT-INS (people who chose to give an email on a separate
// screen), never survey answers. Research aggregates live in ObservatoireManager.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  Check,
  Download,
  FlaskConical,
  Loader2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/admin/csv";
import {
  useCrmContact,
  useCrmContacts,
  useCrmDeals,
  useCrmMutations,
  useCrmOverview,
  useCrmStages,
  type ContactFilters,
} from "@/hooks/admin/useCrm";
import { crmAtLeast, useCrmRole } from "@/hooks/admin/useCrmOps";
import CrmForecastPanel from "@/components/admin/CrmForecastPanel";
import CrmAutomationsPanel from "@/components/admin/CrmAutomationsPanel";
import CrmFunnelPanel from "@/components/admin/CrmFunnelPanel";
import ExperimentPanel from "@/components/admin/ExperimentPanel";

const PIPELINES = [
  { key: "b2c_first_session", label: "First session" },
  { key: "b2b_program", label: "B2B program" },
  { key: "specialist_onboarding", label: "Specialist onboarding" },
  { key: "training_enrolment", label: "Training" },
];

const LIFECYCLES = ["lead", "qualified", "active", "churned"];
const TYPES = ["client", "specialist", "org_contact", "press"];

const fmt = (n: number) => new Intl.NumberFormat("fr-MA").format(n);
const ago = (iso: string | null) => {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

/* ─────────────────────────── Overview (the landing) ─────────────────────── */

const Metric = ({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: any;
  accent?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`relative overflow-hidden rounded-u-card border p-5 ${
      accent ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/20"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <p className="mt-2 font-mono tabular-nums text-3xl leading-none">{value}</p>
    {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
  </motion.div>
);

const Bars = ({ data, limit = 8 }: { data: Record<string, number>; limit?: number }) => {
  const entries = Object.entries(data || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  if (!entries.length) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="space-y-2.5">
      {entries.map(([k, n]) => (
        <div key={k} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground truncate pr-2">{k}</span>
            <span className="font-mono tabular-nums">{n}</span>
          </div>
          <Progress value={(n / max) * 100} className="h-1.5" />
        </div>
      ))}
    </div>
  );
};

const OverviewView = ({ onOpenContact }: { onOpenContact: (id: string) => void }) => {
  const { data, isLoading, error } = useCrmOverview();

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (error || !data) return <p className="text-sm text-destructive">Unable to load CRM figures.</p>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-u-card border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Acquisition command
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-heading">
          {fmt(data.newThisWeek)} new contacts this week
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Every funnel — Observatoire opt-ins, the free score quiz, contact forms, B2B proposals,
          specialist applications and registrations — resolves to one contact record here.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total contacts" value={fmt(data.total)} icon={Users} hint={`${fmt(data.newThisMonth)} in 30 days`} />
        <Metric
          label="Observatoire opt-ins"
          value={fmt(data.observatoireTotal)}
          icon={FlaskConical}
          hint={`${fmt(data.observatoireWeek)} this week`}
          accent
        />
        <Metric label="Pipeline value" value={`${fmt(Math.round(data.pipelineValue))} MAD`} icon={TrendingUp} hint={`${data.openDeals} deals`} />
        <Metric label="Consent coverage" value={`${data.consentCoverage}%`} icon={ShieldCheck} hint="contactable for marketing" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Clients" value={fmt(data.clients)} icon={UserRound} />
        <Metric label="Specialists" value={fmt(data.specialists)} icon={Users} />
        <Metric label="Org. contacts" value={fmt(data.orgContacts)} icon={Building2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By source</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars data={data.bySource} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars data={data.byLifecycle} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Live activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[320px] overflow-y-auto">
            {data.stream.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
            {data.stream.map((a) => (
              <button
                key={a.id}
                onClick={() => onOpenContact(a.contact_id)}
                className="w-full text-left rounded-lg border border-border/50 px-3 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">{a.subject || a.kind}</span>
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                    {ago(a.occurred_at)}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.kind}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ───────────────────────────────── Contacts ─────────────────────────────── */

const ContactsView = ({ onOpenContact }: { onOpenContact: (id: string) => void }) => {
  const [filters, setFilters] = useState<ContactFilters>({ consent: "any" });
  const [search, setSearch] = useState("");
  const { data: contacts = [], isLoading } = useCrmContacts({ ...filters, search });

  const sources = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.source).filter(Boolean))) as string[],
    [contacts]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name or phone"
            className="pl-9"
          />
        </div>
        <Select value={filters.contactType ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, contactType: v }))}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.lifecycle ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, lifecycle: v }))}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Lifecycle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {LIFECYCLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.source ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, source: v }))}>
          <SelectTrigger className="w-[190px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.consent ?? "any"} onValueChange={(v) => setFilters((f) => ({ ...f, consent: v as never }))}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Consent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any consent</SelectItem>
            <SelectItem value="granted">Consented</SelectItem>
            <SelectItem value="none">No consent</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            if (!contacts.length) return toast.error("Nothing to export");
            downloadCsv(`crm-contacts-${new Date().toISOString().slice(0, 10)}`, contacts as never[], [
              "email", "full_name", "phone", "contact_type", "lifecycle", "source",
              "locale", "country", "city", "last_activity_at", "created_at",
            ]);
          }}
        >
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No contacts match these filters.</p>
      ) : (
        <div className="rounded-u-card border border-border/60 overflow-hidden">
          <div className="max-h-[620px] overflow-y-auto divide-y divide-border/50">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenContact(c.id)}
                className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.full_name || c.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{c.contact_type}</Badge>
                <Badge variant="secondary" className="text-[10px]">{c.lifecycle}</Badge>
                <span className="text-[10px] text-muted-foreground hidden md:inline w-40 truncate">{c.source}</span>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-20 text-right">
                  {ago(c.last_activity_at ?? c.created_at)}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border/50">
            {fmt(contacts.length)} contacts
          </div>
        </div>
      )}
    </div>
  );
};

/* ───────────────────────────── Contact detail ───────────────────────────── */

const ContactDetail = ({ contactId, onClose }: { contactId: string | null; onClose: () => void }) => {
  const { data, isLoading } = useCrmContact(contactId);
  const { addNote, setLifecycle } = useCrmMutations();
  const [note, setNote] = useState("");

  const c = data?.contact;

  return (
    <Sheet open={!!contactId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{c?.full_name || c?.email || "Contact"}</SheetTitle>
        </SheetHeader>

        {isLoading || !c ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{c.email}</p>
              {c.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{c.phone}</p>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="outline">{c.contact_type}</Badge>
                <Badge variant="secondary">{c.lifecycle}</Badge>
                {c.source && <Badge variant="outline">{c.source}</Badge>}
                {c.locale && <Badge variant="outline">{c.locale}</Badge>}
                {c.user_id && <Badge className="gap-1"><Check className="h-3 w-3" />registered</Badge>}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Lifecycle</p>
              <Select value={c.lifecycle} onValueChange={(v) => setLifecycle.mutate({ contactId: c.id, lifecycle: v })}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LIFECYCLES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Consent</p>
              {data.consents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No consent on record — marketing sends are blocked for this contact.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {data.consents.map((k) => (
                    <div key={k.id} className="flex items-center justify-between text-xs rounded-lg border border-border/50 px-3 py-2">
                      <span>{k.purpose}</span>
                      <Badge variant={k.granted && !k.withdrawn_at ? "default" : "secondary"} className="text-[10px]">
                        {k.granted && !k.withdrawn_at ? "granted" : "withdrawn"} · {k.basis}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {data.deals.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Deals</p>
                <div className="space-y-1.5">
                  {data.deals.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-xs rounded-lg border border-border/50 px-3 py-2">
                      <span className="truncate">{d.title || d.pipeline}</span>
                      <span className="font-mono tabular-nums">{fmt(Number(d.value_mad))} {d.currency} · {d.stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Add a note</p>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What happened?" />
              <Button
                size="sm"
                disabled={!note.trim() || addNote.isPending}
                onClick={() =>
                  addNote.mutate(
                    { contactId: c.id, body: note.trim() },
                    { onSuccess: () => { setNote(""); toast.success("Note added"); } }
                  )
                }
              >
                {addNote.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Save note
              </Button>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Timeline</p>
              <div className="space-y-2 border-l border-border/60 pl-4">
                {data.activities.map((a) => (
                  <div key={a.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary/60" />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm">{a.subject || a.kind}</p>
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                        {new Date(a.occurred_at).toLocaleDateString()}
                      </span>
                    </div>
                    {a.body && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{a.body}</p>}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.kind}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ───────────────────────────────── Pipeline ─────────────────────────────── */

const PipelineView = ({ onOpenContact }: { onOpenContact: (id: string) => void }) => {
  const [pipeline, setPipeline] = useState(PIPELINES[0].key);
  const { data: stages = [] } = useCrmStages();
  const { data: deals = [], isLoading } = useCrmDeals(pipeline);
  const { moveDeal } = useCrmMutations();

  const cols = stages.filter((s) => s.pipeline === pipeline);

  return (
    <div className="space-y-4">
      <Select value={pipeline} onValueChange={setPipeline}>
        <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PIPELINES.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {cols.map((stage) => {
            const items = deals.filter((d) => d.stage === stage.key);
            const value = items.reduce((s, d) => s + Number(d.value_mad ?? 0), 0);
            return (
              <div
                key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("deal");
                  const contactId = e.dataTransfer.getData("contact") || null;
                  if (id) moveDeal.mutate({ dealId: id, stage: stage.key, contactId });
                }}
                className="w-[260px] shrink-0 rounded-u-card border border-border/60 bg-muted/15 p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{stage.label}</p>
                  <span className="text-[10px] font-mono tabular-nums">{items.length}</span>
                </div>
                <p className="text-[10px] font-mono tabular-nums text-muted-foreground mb-2">{fmt(value)} MAD</p>
                <div className="space-y-2 min-h-[80px]">
                  {items.map((d) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("deal", d.id);
                        if (d.contact_id) e.dataTransfer.setData("contact", d.contact_id);
                      }}
                      onClick={() => d.contact_id && onOpenContact(d.contact_id)}
                      className="cursor-grab rounded-lg border border-border/60 bg-background px-3 py-2 hover:border-primary/40 transition-colors"
                    >
                      <p className="text-xs font-medium truncate">
                        {d.title || d.crm_contacts?.full_name || d.crm_contacts?.email || "Deal"}
                      </p>
                      <p className="text-[10px] font-mono tabular-nums text-muted-foreground">
                        {fmt(Number(d.value_mad))} {d.currency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Drag a card between columns to move the deal — every move writes to the contact's timeline.
      </p>
    </div>
  );
};

/* ───────────────────────────────── Shell ────────────────────────────────── */

const CrmManager = () => {
  const [openContact, setOpenContact] = useState<string | null>(null);
  const { data: role, isLoading: roleLoading } = useCrmRole();

  if (roleLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!crmAtLeast(role ?? null, "viewer")) {
    return (
      <div className="rounded-u-card border border-destructive/30 bg-destructive/5 p-6 text-sm">
        <p className="font-medium">CRM access required</p>
        <p className="mt-1 text-muted-foreground">
          Your account is not on the CRM staff list. A workspace admin can grant you viewer, agent
          or manager access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-u-card border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <span>
          Internal only. Research survey answers are never linked to a contact — Observatoire figures
          here count opt-ins, collected on a separate screen with explicit consent. No marketing send
          may go out without a granted consent record. You are signed in as{" "}
          <strong>CRM {role}</strong>.
        </span>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewView onOpenContact={setOpenContact} /></TabsContent>
        <TabsContent value="contacts"><ContactsView onOpenContact={setOpenContact} /></TabsContent>
        <TabsContent value="pipeline"><PipelineView onOpenContact={setOpenContact} /></TabsContent>
        <TabsContent value="forecast"><CrmForecastPanel onOpenContact={setOpenContact} /></TabsContent>
        <TabsContent value="automations"><CrmAutomationsPanel onOpenContact={setOpenContact} /></TabsContent>
        <TabsContent value="funnels"><CrmFunnelPanel /></TabsContent>
        <TabsContent value="experiments"><ExperimentPanel /></TabsContent>
      </Tabs>

      <ContactDetail contactId={openContact} onClose={() => setOpenContact(null)} />
    </div>
  );
};

export default CrmManager;

