import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ExternalLink, X, Star, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useSetAccreditationLevel, useTogglePsychologistPublish } from "@/hooks/admin/useAdminMutations";

interface Props {
  psychologistId: string | null;
  onClose: () => void;
}

export default function PsychologistEditDrawer({ psychologistId, onClose }: Props) {
  const qc = useQueryClient();
  const open = !!psychologistId;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-psy-detail", psychologistId],
    queryFn: async () => {
      if (!psychologistId) return null;
      const [profile, allSpec, allLang, mySpec, myLang] = await Promise.all([
        supabase.from("psychologist_profiles").select("*").eq("id", psychologistId).maybeSingle(),
        supabase.from("specialties").select("id, name").order("name"),
        supabase.from("languages").select("id, name").order("name"),
        supabase.from("psychologist_specialties").select("specialty_id").eq("psychologist_id", psychologistId),
        supabase.from("psychologist_languages").select("language_id").eq("psychologist_id", psychologistId),
      ]);
      if (profile.error) throw profile.error;
      return {
        profile: profile.data,
        specialties: allSpec.data ?? [],
        languages: allLang.data ?? [],
        mySpecIds: new Set((mySpec.data ?? []).map((r: any) => r.specialty_id)),
        myLangIds: new Set((myLang.data ?? []).map((r: any) => r.language_id)),
      };
    },
    enabled: open,
  });

  const [form, setForm] = useState<any>({});
  const [specSet, setSpecSet] = useState<Set<string>>(new Set());
  const [langSet, setLangSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data?.profile) {
      setForm({
        full_name: data.profile.full_name ?? "",
        bio: data.profile.bio ?? "",
        city: data.profile.city ?? "",
        gender: data.profile.gender ?? "",
        hourly_rate_mad: data.profile.hourly_rate_mad ?? 0,
        offers_online: !!data.profile.offers_online,
        offers_in_person: !!data.profile.offers_in_person,
        is_published: !!data.profile.is_published,
        accreditation_level: (data.profile as any).accreditation_level ?? "basic",
      });
      setSpecSet(new Set(data.mySpecIds));
      setLangSet(new Set(data.myLangIds));
    }
  }, [data?.profile?.id]);

  const togglePub = useTogglePsychologistPublish();
  const setLevel = useSetAccreditationLevel();

  const save = async () => {
    if (!psychologistId) return;
    const { error } = await supabase
      .from("psychologist_profiles")
      .update({
        full_name: form.full_name,
        bio: form.bio,
        city: form.city,
        gender: form.gender || null,
        hourly_rate_mad: Number(form.hourly_rate_mad) || null,
        offers_online: form.offers_online,
        offers_in_person: form.offers_in_person,
      })
      .eq("id", psychologistId);
    if (error) return toast.error(error.message);

    // Sync junction tables
    const origSpec = data?.mySpecIds ?? new Set();
    const origLang = data?.myLangIds ?? new Set();
    const addSpec = [...specSet].filter((id) => !origSpec.has(id));
    const delSpec = [...origSpec].filter((id) => !specSet.has(id));
    const addLang = [...langSet].filter((id) => !origLang.has(id));
    const delLang = [...origLang].filter((id) => !langSet.has(id));

    if (addSpec.length) await supabase.from("psychologist_specialties").insert(addSpec.map((sid) => ({ psychologist_id: psychologistId, specialty_id: sid })));
    if (delSpec.length) await supabase.from("psychologist_specialties").delete().eq("psychologist_id", psychologistId).in("specialty_id", delSpec);
    if (addLang.length) await supabase.from("psychologist_languages").insert(addLang.map((lid) => ({ psychologist_id: psychologistId, language_id: lid })));
    if (delLang.length) await supabase.from("psychologist_languages").delete().eq("psychologist_id", psychologistId).in("language_id", delLang);

    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["admin-psychologists"] });
    qc.invalidateQueries({ queryKey: ["admin-psy-detail", psychologistId] });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit psychologist profile</SheetTitle>
          <SheetDescription>{data?.profile?.full_name}</SheetDescription>
        </SheetHeader>

        {isLoading || !data ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5">
                <Star className="h-3.5 w-3.5" /> Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-5 mt-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => {
                  setForm({ ...form, is_published: v });
                  togglePub.mutate({ id: psychologistId!, published: v });
                }} />
                <span className="text-sm">{form.is_published ? "Published" : "Hidden"}</span>
              </div>
              {data.profile?.slug && (
                <a href={`/psychologists/${data.profile.slug}`} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View public
                </a>
              )}
            </div>

            <div className="space-y-2"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Bio</Label><Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>Hourly rate (MAD)</Label><Input type="number" value={form.hourly_rate_mad} onChange={(e) => setForm({ ...form, hourly_rate_mad: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender || "_none"} onValueChange={(v) => setForm({ ...form, gender: v === "_none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Accreditation</Label>
                <Select
                  value={form.accreditation_level}
                  onValueChange={(v) => {
                    setForm({ ...form, accreditation_level: v });
                    setLevel.mutate({ id: psychologistId!, level: v });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["basic", "provisional", "verified", "accredited", "premium"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.offers_online} onCheckedChange={(v) => setForm({ ...form, offers_online: v })} /> Online</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.offers_in_person} onCheckedChange={(v) => setForm({ ...form, offers_in_person: v })} /> In-person</label>
            </div>

            <div className="space-y-2">
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-1.5">
                {data.specialties.map((s: any) => {
                  const active = specSet.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const next = new Set(specSet);
                        active ? next.delete(s.id) : next.add(s.id);
                        setSpecSet(next);
                      }}
                      className={`text-xs px-2 py-1 rounded-full border ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-1.5">
                {data.languages.map((l: any) => {
                  const active = langSet.has(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        const next = new Set(langSet);
                        active ? next.delete(l.id) : next.add(l.id);
                        setLangSet(next);
                      }}
                      className={`text-xs px-2 py-1 rounded-full border ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={onClose}>Close</Button>
              <Button onClick={save}>Save changes</Button>
            </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <ReviewsPanel psychologistId={psychologistId!} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReviewsPanel({ psychologistId }: { psychologistId: string }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-psy-reviews", psychologistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, client_id, session_id")
        .eq("psychologist_id", psychologistId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This action cannot be undone.")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    qc.invalidateQueries({ queryKey: ["admin-psy-reviews", psychologistId] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm space-y-2">
        <p className="text-destructive font-medium">Couldn't load reviews</p>
        <p className="text-xs text-muted-foreground">{(error as Error)?.message}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const reviews = data ?? [];
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-surface p-3">
        <div className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-medium">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-semibold">{avg}</span>
          <span className="text-muted-foreground text-xs">/ 5</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Star className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < (r.rating ?? 0) ? "fill-primary text-primary" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(r.created_at!).toLocaleDateString()}
                  </span>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(r.id)} title="Delete review">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              {r.comment && <p className="text-sm text-foreground/90 whitespace-pre-wrap">{r.comment}</p>}
              <p className="text-[10px] text-muted-foreground font-mono">Client: {r.client_id?.slice(0, 8)}…</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
