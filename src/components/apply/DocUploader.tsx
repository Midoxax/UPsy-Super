import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, X, FileText, Image as ImageIcon, Video } from "lucide-react";
import { useAccreditationUpload, type UploadKind } from "@/hooks/useAccreditationUpload";
import { useToast } from "@/hooks/use-toast";

interface Props {
  label: string;
  description?: string;
  required?: boolean;
  slot: string;
  kind: UploadKind;
  value?: string | null;
  onChange: (path: string | null) => void;
}

export const DocUploader = ({ label, description, required, slot, kind, value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, getSignedUrl, removeFile, uploading, progress } = useAccreditationUpload();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) { setPreviewUrl(null); return; }
    getSignedUrl(value).then(setPreviewUrl).catch(() => setPreviewUrl(null));
  }, [value]);

  const handleFile = async (file: File) => {
    try {
      const path = await uploadFile(file, slot, kind);
      onChange(path);
      toast({ title: "Téléversé", description: `${label} enregistré` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    try { await removeFile(value); } catch { /* ignore */ }
    onChange(null);
  };

  const Icon = kind === "photo" ? ImageIcon : kind === "video" ? Video : FileText;
  const accept = kind === "photo" ? "image/jpeg,image/png,image/webp"
    : kind === "video" ? "video/mp4,video/webm,video/quicktime"
    : "application/pdf,image/jpeg,image/png,image/webp";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label} {required && <span className="text-destructive">*</span>}
          </p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        {value && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
      </div>

      {progress > 0 && progress < 100 && <Progress value={progress} className="h-1" />}

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
          <a
            href={previewUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline truncate"
          >
            Aperçu du fichier
          </a>
          <Button size="sm" variant="ghost" onClick={handleRemove} disabled={uploading}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-3.5 w-3.5 mr-2" />
            {uploading ? "Téléversement..." : "Choisir un fichier"}
          </Button>
        </>
      )}
    </div>
  );
};