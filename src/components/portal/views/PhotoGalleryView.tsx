import { useState, useEffect, useRef } from "react";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Image, Upload, Download, Trash2, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

const CATEGORIES = ["Alla", "Pedagogisk dokumentation", "Aktiviteter", "Projekt", "Miljö", "Övrigt"];

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

export function PhotoGalleryView() {
  const { activeWorkplace } = useWorkplace();
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Alla");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeWorkplace?.id) fetchPhotos();
  }, [activeWorkplace?.id]);

  const fetchPhotos = async () => {
    if (!activeWorkplace?.id) return;
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("workplace_id", activeWorkplace.id)
      .order("created_at", { ascending: false });
    setPhotos((data as Photo[]) || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeWorkplace?.id || !user) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const filePath = `${activeWorkplace.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file);
      if (uploadError) {
        toast.error(`Kunde inte ladda upp ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
      await supabase.from("photos").insert({
        workplace_id: activeWorkplace.id,
        title: file.name.replace(/\.[^.]+$/, ""),
        image_url: urlData.publicUrl,
        category: "Pedagogisk dokumentation",
        uploaded_by: user.id,
        uploaded_by_name: profile?.full_name || profile?.email || "Användare",
      });
    }
    toast.success("Bilder uppladdade!");
    fetchPhotos();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (photo: Photo) => {
    const path = photo.image_url.split("/photos/")[1];
    if (path) await supabase.storage.from("photos").remove([path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    toast.success("Bild borttagen");
    setSelectedPhoto(null);
    fetchPhotos();
  };

  const filtered = filterCategory === "Alla"
    ? photos
    : photos.filter((p) => p.category === filterCategory);

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Image className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Bildbank</h1>
              <p className="text-sm text-muted-foreground">Pedagogisk dokumentation & bilder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept="image/*"
              multiple
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
            <SelectTrigger className="w-64">
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
            <Image className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Inga bilder ännu</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || "Bild"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                  <p className="text-white/70 text-xs">{photo.uploaded_by_name}</p>
                </div>
                <Badge variant="outline" className="absolute top-2 left-2 text-[10px] bg-background/80">
                  {photo.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedPhoto && (
            <div>
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title || "Bild"}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{selectedPhoto.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPhoto.uploaded_by_name} • {new Date(selectedPhoto.created_at).toLocaleDateString("sv-SE")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={selectedPhoto.image_url} target="_blank" rel="noopener noreferrer" download>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" /> Ladda ner
                    </Button>
                  </a>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedPhoto)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Ta bort
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
