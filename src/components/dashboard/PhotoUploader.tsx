import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BUCKET = "psychologist-photos";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export const PhotoUploader = ({ value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const extractOldPath = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const marker = `/${BUCKET}/`;
    const i = url.indexOf(marker);
    return i >= 0 ? url.slice(i + marker.length) : null;
  };

  const handleFile = async (file: File) => {
    if (!user) {
      toast({ title: "Not signed in", variant: "destructive" });
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      toast({ title: "Invalid format", description: "JPG, PNG, or WebP only", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "Too large", description: "Max 5 MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(20);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/profile-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      setProgress(80);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Best-effort cleanup of previous photo in this bucket
      const oldPath = extractOldPath(value);
      if (oldPath && oldPath !== path) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }

      onChange(publicUrl);
      setProgress(100);
      toast({ title: "Photo updated", description: "Don't forget to save your profile." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const handleRemove = async () => {
    const oldPath = extractOldPath(value);
    if (oldPath) {
      await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
    }
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
          {value ? (
            <img src={value} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-3.5 w-3.5 mr-2" />
            {uploading ? "Uploading..." : value ? "Change photo" : "Upload photo"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={uploading}>
              <X className="h-3.5 w-3.5 mr-2" />
              Remove
            </Button>
          )}
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · max 5 MB</p>
        </div>
      </div>
      {progress > 0 && progress < 100 && <Progress value={progress} className="h-1" />}
    </div>
  );
};
