import { useState, useEffect, useRef } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Upload, Download, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["Alla", "Övrigt", "Policyer", "Rutiner", "Avtal", "Protokoll", "Utbildning"];

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by_name: string | null;
  category: string | null;
  created_at: string;
}

export function DocumentsView() {
  const { activeWorkplace } = useWorkplace();
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Alla");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeWorkplace?.id) fetchDocuments();
  }, [activeWorkplace?.id]);

  const fetchDocuments = async () => {
    if (!activeWorkplace?.id) return;
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("created_at", { ascending: false });
    setDocuments((data as Document[]) || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkplace?.id || !user) return;

    setUploading(true);
    const filePath = `${activeWorkplace.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Kunde inte ladda upp filen");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("documents").insert({
      workplace_id: activeWorkplace.id,
      title: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
      uploaded_by_name: profile?.full_name || profile?.email || "Användare",
      category: "Övrigt",
    });

    if (dbError) {
      toast.error("Kunde inte spara dokumentet");
    } else {
      toast.success("Dokument uppladdat!");
      fetchDocuments();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (doc: Document) => {
    const path = doc.file_url.split("/documents/")[1];
    if (path) await supabase.storage.from("documents").remove([path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    toast.success("Dokument borttaget");
    fetchDocuments();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const filtered = filterCategory === "Alla"
    ? documents
    : documents.filter((d) => d.category === filterCategory);

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Dokument</h1>
              <p className="text-sm text-muted-foreground">Ladda upp och hantera dokument</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
            />
            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-1" />
              {uploading ? "Laddar upp..." : "Ladda upp"}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Inga dokument ännu</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/30 transition-colors">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{doc.uploaded_by_name}</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString("sv-SE")}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{doc.category}</Badge>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(doc)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
