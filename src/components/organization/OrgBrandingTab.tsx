import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Save } from "lucide-react";

const OrgBrandingTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [color, setColor] = useState("#6B1F2A");
  const [signature, setSignature] = useState("Therapist signature");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("organization_accounts")
        .select("id, pdf_logo_url, pdf_primary_color, pdf_signature_label")
        .eq("owner_id", user.id).maybeSingle();
      if (data) {
        setOrgId(data.id);
        setLogoUrl((data as any).pdf_logo_url || "");
        setColor((data as any).pdf_primary_color || "#6B1F2A");
        setSignature((data as any).pdf_signature_label || "Therapist signature");
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    const { error } = await supabase.from("organization_accounts").update({
      pdf_logo_url: logoUrl || null,
      pdf_primary_color: color || null,
      pdf_signature_label: signature || null,
    } as any).eq("id", orgId);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Branding updated." });
  };

  if (!user) return null;
  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!orgId) return <div className="text-sm text-muted-foreground">No organization linked to this account.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4 text-primary" /> PDF Branding
        </CardTitle>
        <CardDescription>Customize how exported anamnesis & invoice PDFs look for your organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Logo URL</Label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" />
          {logoUrl && <img src={logoUrl} alt="Logo preview" className="mt-2 h-12 object-contain" />}
        </div>
        <div className="space-y-1.5">
          <Label>Primary color</Label>
          <div className="flex gap-2 items-center">
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 p-1" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 font-mono" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Signature label</Label>
          <Input value={signature} onChange={(e) => setSignature(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrgBrandingTab;