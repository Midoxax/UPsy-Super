import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const BUCKET = "accreditation-docs";

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export type UploadKind = "doc" | "photo" | "video";

export const useAccreditationUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validate = (file: File, kind: UploadKind) => {
    if (kind === "photo") {
      if (!PHOTO_TYPES.includes(file.type)) throw new Error("Photo: JPG/PNG/WebP uniquement");
      if (file.size > MAX_PHOTO_SIZE) throw new Error("Photo: max 5 MB");
    } else if (kind === "video") {
      if (!VIDEO_TYPES.includes(file.type)) throw new Error("Vidéo: MP4/WebM uniquement");
      if (file.size > MAX_VIDEO_SIZE) throw new Error("Vidéo: max 50 MB");
    } else {
      if (!DOC_TYPES.includes(file.type)) throw new Error("Document: PDF/JPG/PNG uniquement");
      if (file.size > MAX_DOC_SIZE) throw new Error("Document: max 10 MB");
    }
  };

  const uploadFile = async (file: File, slot: string, kind: UploadKind): Promise<string> => {
    if (!user) throw new Error("Non authentifié");
    validate(file, kind);
    setUploading(true);
    setProgress(10);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${slot}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      setProgress(100);
      return path;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const getSignedUrl = async (path: string, expiresIn = 600) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  };

  const removeFile = async (path: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  };

  return { uploadFile, getSignedUrl, removeFile, uploading, progress };
};