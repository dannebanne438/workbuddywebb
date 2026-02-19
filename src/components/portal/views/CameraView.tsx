import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Camera,
  ImagePlus,
  Sparkles,
  Loader2,
  Bell,
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

export function CameraView() {
  const { session, user, profile } = useAuth();
  const { activeWorkplace } = useWorkplace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"capture" | "analyzing" | "edit" | "success">("capture");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Editable fields
  const [postType, setPostType] = useState<PostType>("announcement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("safety");

  const handleFileSelect = async (file: File) => {
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    await analyzeImage(file);
    // Also save to photos (Bildbank) privately
    await saveToPhotos(file);
  };

  const saveToPhotos = async (file: File) => {
    if (!activeWorkplace?.id || !user) return;
    try {
      const filePath = `${activeWorkplace.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file);
      if (uploadError) return; // silently fail, main flow continues
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
      await supabase.from("photos").insert({
        workplace_id: activeWorkplace.id,
        title: file.name.replace(/\.[^.]+$/, ""),
        image_url: urlData.publicUrl,
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
      return;
    }

    setStep("analyzing");
    setIsAnalyzing(true);

    try {
      // Upload image to storage first
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("camera-uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("camera-uploads")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Call AI analysis
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "AI-analys misslyckades");
      }

      const data = await response.json();
      const result = data.analysis as AnalysisResult;

      setAnalysis(result);
      setPostType(result.suggested_type);
      setTitle(result.title);
      setDescription(result.description);
      setSeverity(result.severity || "medium");
      setCategory(result.category || "safety");
      setStep("edit");
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
      // Get the stored image URL
      const fileName = imageFile ? `${Date.now()}-${imageFile.name}` : null;
      let imageUrl: string | null = null;

      if (imageFile && fileName) {
        // Check if already uploaded during analysis
        const { data: listData } = await supabase.storage
          .from("camera-uploads")
          .list();

        const existingFile = listData?.find(f => imagePreview?.includes(f.name));
        if (existingFile) {
          const { data: urlData } = supabase.storage
            .from("camera-uploads")
            .getPublicUrl(existingFile.name);
          imageUrl = urlData.publicUrl;
        }
      }

      // Use the preview URL if we can't find the file (it was uploaded during analysis)
      if (!imageUrl && imagePreview) {
        // The image was uploaded during analysis, find it from the storage listing
        const { data: listData } = await supabase.storage.from("camera-uploads").list("", { sortBy: { column: "created_at", order: "desc" }, limit: 1 });
        if (listData?.[0]) {
          const { data: urlData } = supabase.storage.from("camera-uploads").getPublicUrl(listData[0].name);
          imageUrl = urlData.publicUrl;
        }
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
    setAnalysis(null);
    setTitle("");
    setDescription("");
    setSeverity("medium");
    setCategory("safety");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl wb-gradient-accent flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Fotodokumentation</h1>
            <p className="text-sm text-muted-foreground">
              Ta bild → AI analyserar → Publicera nyhet eller avvikelse
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
                Ta en bild eller välj från galleriet. AI:n analyserar och föreslår om det ska bli en nyhet eller avvikelse.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm" data-presentation="camera-buttons">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Ta bild
                </Button>
                <Button
                  variant="hero-outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-5 w-5 mr-2" />
                  Välj bild
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraCapture}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleGallerySelect}
              />
            </div>
          )}

          {/* Step 2: Analyzing */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              {imagePreview && (
                <div className="w-full max-w-sm rounded-xl overflow-hidden mb-6 border border-border">
                  <img src={imagePreview} alt="Uppladdad bild" className="w-full h-auto" />
                </div>
              )}
              <div className="flex items-center gap-3 text-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div>
                  <p className="font-medium">AI analyserar bilden...</p>
                  <p className="text-sm text-muted-foreground">Identifierar innehåll och föreslår åtgärd</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Edit & Publish */}
          {step === "edit" && (
            <div className="space-y-6">
              {/* Image preview */}
              {imagePreview && (
                <div className="w-full rounded-xl overflow-hidden border border-border">
                  <img src={imagePreview} alt="Uppladdad bild" className="w-full h-auto max-h-64 object-cover" />
                </div>
              )}

              {/* AI confidence badge */}
              {analysis && (
                <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-sm text-foreground">
                    AI-förslag: <strong>{analysis.suggested_type === "announcement" ? "Nyhet" : "Avvikelse"}</strong>
                    {" "}({analysis.confidence === "high" ? "hög" : analysis.confidence === "medium" ? "medel" : "låg"} säkerhet)
                  </span>
                </div>
              )}

              {/* Type selector */}
              <div>
                <Label>Typ</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={postType === "announcement" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPostType("announcement")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Nyhet
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "incident" ? "destructive" : "outline"}
                    className="flex-1"
                    onClick={() => setPostType("incident")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Avvikelse
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Rubrik</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Rubrik..."
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskrivning..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Incident-specific fields */}
              {postType === "incident" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Allvarlighetsgrad</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kategori</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Börja om
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handlePublish}
                  disabled={isPublishing || !title.trim()}
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isPublishing ? "Publicerar..." : "Publicera"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
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
