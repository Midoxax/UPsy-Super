import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, CheckCircle2, Info, ShieldCheck } from "lucide-react";

const DOC_FIELDS: Array<{ key: string; label: string; required?: boolean }> = [
  { key: "doc_diploma_url", label: "Diplôme", required: true },
  { key: "doc_cin_url", label: "CIN/Passeport", required: true },
  { key: "doc_license_morocco_url", label: "Autorisation Maroc", required: true },
  { key: "doc_order_registration_url", label: "Inscription Ordre" },
  { key: "doc_auto_entrepreneur_url", label: "Auto-entrepreneur" },
  { key: "doc_rib_url", label: "RIB" },
  { key: "doc_insurance_url", label: "Assurance RC pro" },
  { key: "doc_cv_url", label: "CV" },
  { key: "photo_url", label: "Photo pro", required: true },
  { key: "intro_video_url", label: "Vidéo intro" },
];

const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === "block") return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
  if (severity === "warn") return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
  return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
};

export const AccreditationDocsPanel = ({ application }: { application: any }) => {
  const [signed, setSigned] = useState<Record<string, string>>({});

  useEffect(() => {
    const fields = [
      ...DOC_FIELDS.map((f) => f.key),
      ...(application.doc_specialty_certs_urls ?? []).map((_: string, i: number) => `cert_${i}`),
    ];
    const paths: Array<{ key: string; path: string }> = [];
    DOC_FIELDS.forEach((f) => {
      const p = application[f.key];
      if (p) paths.push({ key: f.key, path: p });
    });
    (application.doc_specialty_certs_urls ?? []).forEach((p: string, i: number) => {
      if (p) paths.push({ key: `cert_${i}`, path: p });
    });

    Promise.all(
      paths.map(async ({ key, path }) => {
        const { data } = await supabase.storage.from("accreditation-docs").createSignedUrl(path, 600);
        return { key, url: data?.signedUrl };
      }),
    ).then((arr) => {
      const m: Record<string, string> = {};
      arr.forEach(({ key, url }) => { if (url) m[key] = url; });
      setSigned(m);
    });
  }, [application.id]);

  const flags = (application.auto_check_flags ?? []) as Array<{ code: string; severity: string; message: string }>;
  const autoStatus = application.auto_check_status ?? "not_run";
  const suggestedLevel = application.suggested_level;

  return (
    <div className="space-y-4">
      {/* Auto-check banner */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">Pré-vérification auto</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={autoStatus === "passed" ? "default" : autoStatus === "failed" ? "destructive" : "outline"}>
              {autoStatus}
            </Badge>
            {suggestedLevel && <Badge variant="secondary">Suggéré : {suggestedLevel}</Badge>}
          </div>
        </div>
        {flags.length > 0 ? (
          <ul className="space-y-1 mt-2">
            {flags.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <SeverityIcon severity={f.severity} />
                <span className="text-foreground">{f.message}</span>
              </li>
            ))}
          </ul>
        ) : autoStatus === "passed" ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Aucun blocage détecté.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Pas encore exécutée — sera lancée à la soumission du dossier.</p>
        )}
      </div>

      {/* Documents grid */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Documents fournis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DOC_FIELDS.map((f) => {
            const path = application[f.key];
            const url = signed[f.key];
            return (
              <div key={f.key} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm">
                <span className="text-muted-foreground truncate">
                  {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
                </span>
                {path ? (
                  url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                      <ExternalLink className="h-3 w-3" /> Ouvrir
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">…</span>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            );
          })}
          {(application.doc_specialty_certs_urls ?? []).map((_p: string, i: number) => {
            const url = signed[`cert_${i}`];
            return (
              <div key={`cert_${i}`} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm">
                <span className="text-muted-foreground truncate">Cert. spécialité {i + 1}</span>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" /> Ouvrir
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">…</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legacy document_urls fallback */}
      {((application.document_urls ?? []).length > 0) && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Anciens documents (legacy)</p>
          <div className="space-y-1">
            {(application.document_urls as string[]).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> Document {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};