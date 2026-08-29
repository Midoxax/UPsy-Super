import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Upload, Download, Trash2, Loader2, File, FileImage, FileSpreadsheet,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  document_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  invoice: "bg-accent/20 text-accent border-accent/30",
  report: "bg-primary/20 text-primary border-primary/30",
  certificate: "bg-[hsl(var(--u-clinical))]/20 text-[hsl(var(--u-clinical))] border-[hsl(var(--u-clinical))]/30",
  other: "bg-muted text-muted-foreground border-border",
};

const FileIcon = ({ mime }: { mime: string | null }) => {
  if (mime?.startsWith("image/")) return <FileImage className="w-5 h-5 text-primary" />;
  if (mime?.includes("spreadsheet") || mime?.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-accent" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
};

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const DocumentsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setDocuments(data as Document[]);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("user-documents").getPublicUrl(filePath);

    const docType = file.name.toLowerCase().includes("invoice")
      ? "invoice"
      : file.name.toLowerCase().includes("report")
      ? "report"
      : file.name.toLowerCase().includes("certificate")
      ? "certificate"
      : "other";

    await supabase.from("documents").insert({
      user_id: user.id,
      title: file.name.replace(/\.[^.]+$/, ""),
      document_type: docType,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
    });

    toast({ title: "Uploaded", description: `${file.name} uploaded successfully` });
    setUploading(false);
    loadDocuments();
  };

  const deleteDocument = async (doc: Document) => {
    if (doc.file_url && user) {
      const filePath = doc.file_url.split("/user-documents/")[1];
      if (filePath) {
        await supabase.storage.from("user-documents").remove([filePath]);
      }
    }
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast({ title: "Deleted", description: "Document removed" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Documents
          </h2>
          <p className="text-sm text-muted-foreground">Invoices, reports, and certificates in one place.</p>
        </div>
        <div className="relative">
          <Button variant="primary" size="sm" disabled={uploading} onClick={() => document.getElementById("doc-upload")?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload
          </Button>
          <input id="doc-upload" type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No documents yet</p>
          <p className="text-xs text-muted-foreground">Upload invoices, reports, or certificates here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card p-4 flex items-center gap-4">
              <FileIcon mime={doc.mime_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  {doc.file_size_bytes && <span>· {formatBytes(doc.file_size_bytes)}</span>}
                </div>
              </div>
              <Badge className={TYPE_COLORS[doc.document_type] || TYPE_COLORS.other} variant="outline">
                {doc.document_type}
              </Badge>
              <div className="flex gap-1">
                {doc.file_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteDocument(doc)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
