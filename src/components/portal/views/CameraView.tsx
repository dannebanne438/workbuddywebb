import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Camera,
  ImagePlus,
  Sparkles,
  Loader2,
  AlertTriangle,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

type AnalysisResult = {
  suggested_type: "announcement" | "incident";
  title: string;
  description: string;
  severity?: string;
  category?: string;
  confidence: string;
};

type PostType = "announcement" | "incident";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Låg" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "Hög" },
  { value: "critical", label: "Kritisk" },
];

const CATEGORY_OPTIONS = [
  { value: "safety", label: "Säkerhet" },
  { value: "quality", label: "Kvalitet" },
  { value: "environment", label: "Miljö" },
  { value: "delay", label: "Försening" },
];

interface CameraViewProps {
  defaultType?: "incident" | "announcement";
  onSuccess?: () => void;
}

export function CameraView({ defaultType, onSuccess }: CameraViewProps = {}) {
  const { session, user, profile } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"capture" | "review" | "success">("capture");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Editable fields
  const [postType, setPostType] = useState<PostType>(defaultType || "announcement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("safety");

  const handleFileSelect = async (file: File) => {
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setStep("review");
    setIsAnalyzing(true);
    await saveToPhotos(file);
    await analyzeImage(file);
  };

  const saveToPhotos = async (file: File) => {
    if (!activeWorkplace?.id || !user) return;
    try {
      const filePath = `${activeWorkplace.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file);
      if (uploadError) return;
      // Store the signed URL in the database since bucket is private
      const { data: signedData } = await supabase.storage.from("photos").createSignedUrl(filePath, 365 * 24 * 3600);
      const imageUrl = signedData?.signedUrl || filePath;
      await supabase.from("photos").insert({
        workplace_id: activeWorkplace.id,
        title: file.name.replace(/\.[^.]+$/, ""),
        image_url: imageUrl,
        category: "Fotodokumentation",
        uploaded_by: user.id,
        uploaded_by_name: profile?.full_name || profile?.email || "Användare",
      });
    } catch {
      // Don't block main flow
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const analyzeImage = async (file: File) => {
    if (!session?.access_token) {
      toast.error("Inte inloggad");
      setIsAnalyzing(false);
      return;
    }

    try {
      // Upload to workplace-scoped path for tenant isolation
      const fileName = `${activeWorkplace!.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("camera-uploads")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("camera-uploads")
        .getPublicUrl(fileName);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ imageUrl: urlData.publicUrl }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "AI-analys misslyckades");
      }

      const data = await response.json();
      const result = data.analysis as AnalysisResult;

      setPostType(defaultType || result.suggested_type);
      setTitle(result.title);
      setDescription(result.description);
      setSeverity(result.severity || "medium");
      setCategory(result.category || "safety");
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error(err instanceof Error ? err.message : "Kunde inte analysera bilden");
      setStep("capture");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!activeWorkplace || !user || !title.trim()) return;

    setIsPublishing(true);
    try {
      // Use the image URL from the upload we already did in analyzeImage
      // instead of listing the bucket globally (cross-tenant risk)
      let imageUrl: string | null = null;
      if (imageFile && activeWorkplace?.id) {
        // The image was already uploaded to camera-uploads in analyzeImage
        // Use the same path pattern to construct the URL
        const { data: urlData } = supabase.storage
          .from("camera-uploads")
          .getPublicUrl(`${activeWorkplace.id}/${imageFile.name}`);
        imageUrl = urlData.publicUrl;
      }

      if (postType === "announcement") {
        const { error } = await supabase.from("announcements").insert({
          workplace_id: activeWorkplace.id,
          title,
          content: description,
          created_by: user.id,
          image_url: imageUrl,
        });
        if (error) throw error;
        toast.success("Nyhet publicerad!");
      } else {
        const { error } = await supabase.from("incidents").insert({
          workplace_id: activeWorkplace.id,
          title,
          description,
          severity,
          category,
          reported_by: user.id,
          reported_by_name: profile?.full_name || profile?.email || "Okänd",
          image_url: imageUrl,
        });
        if (error) throw error;
        toast.success("Avvikelse rapporterad!");
      }

      setStep("success");
      onSuccess?.();
    } catch (err) {
      console.error("Publish error:", err);
      toast.error("Kunde inte publicera");
    } finally {
      setIsPublishing(false);
    }
  };

  const reset = () => {
    setStep("capture");
    setImageFile(null);
    setImagePreview(null);
    setTitle("");
    setDescription("");
    setSeverity("medium");
    setCategory("safety");
    setIsAnalyzing(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
            {defaultType === "incident" ? (
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Camera className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="font-semibold text-foreground">
              {defaultType === "incident" ? "Rapportera avvikelse med foto" : "Fotodokumentation"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Ta bild → Granska → Klart
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto">

          {/* Step 1: Capture */}
          {step === "capture" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="h-20 w-20 rounded-2xl wb-gradient-accent flex items-center justify-center mb-6">
                <Camera className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Dokumentera med kameran
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Ta en bild eller välj från galleriet. AI:n analyserar och föreslår rapport automatiskt.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm" data-presentation="camera-buttons">
                <Button variant="hero" size="lg" className="flex-1" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="h-5 w-5 mr-2" />
                  Ta bild
                </Button>
                <Button variant="hero-outline" size="lg" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="h-5 w-5 mr-2" />
                  Välj bild
                </Button>
              </div>

              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGallerySelect} />
            </div>
          )}

          {/* Step 2: Review (analyzing + edit merged) */}
          {step === "review" && (
            <div className="space-y-4">
              {/* Image with analyzing overlay */}
              <div className="relative w-full rounded-xl overflow-hidden border border-border">
                <img src={imagePreview!} alt="Uppladdad bild" className="w-full h-auto max-h-56 object-cover" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">AI analyserar...</p>
                  </div>
                )}
              </div>

              {/* AI-filled fields — inline editable */}
              {!isAnalyzing && (
                <>
                  {/* Title — borderless input */}
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Rubrik..."
                    className="w-full text-lg font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground px-1 py-1"
                  />

                  {/* Description — borderless textarea */}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beskrivning..."
                    rows={2}
                    className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground px-1 py-1"
                  />

                  {/* Type selector — only when no defaultType */}
                  {!defaultType && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPostType("announcement")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          postType === "announcement"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Nyhet
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostType("incident")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          postType === "incident"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Avvikelse
                      </button>
                    </div>
                  )}

                  {/* Severity & Category chips — only for incidents */}
                  {postType === "incident" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Allvarlighetsgrad</p>
                        <div className="flex flex-wrap gap-1.5">
                          {SEVERITY_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => setSeverity(o.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                severity === o.value
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Kategori</p>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => setCategory(o.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                category === o.value
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Om
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={handlePublish}
                  disabled={isPublishing || isAnalyzing || !title.trim()}
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isPublishing ? "Skickar..." : "Rapportera"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {postType === "announcement" ? "Nyhet publicerad!" : "Avvikelse rapporterad!"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {postType === "announcement"
                  ? "Din nyhet är nu synlig för alla på arbetsplatsen."
                  : "Avvikelsen har registrerats och kan följas upp av platschefen."}
              </p>
              <Button variant="hero" size="lg" onClick={reset}>
                <Camera className="h-5 w-5 mr-2" />
                Ta ny bild
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
