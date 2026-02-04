import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Building2, Users, Mail, Phone, Linkedin, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Contact {
  name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
}

interface Prospect {
  company_name: string;
  industry: string | null;
  address: string | null;
  city: string | null;
  estimated_employees: number | null;
  contacts: Contact[];
  relevance_notes: string;
  lead_score: number;
}

const INDUSTRIES = [
  { id: "security", label: "Säkerhet", value: "Säkerhet" },
  { id: "event", label: "Event", value: "Event" },
  { id: "staffing", label: "Bemanning", value: "Bemanning" },
  { id: "hospitality", label: "Hotell/Restaurang", value: "Hotell/Restaurang" },
  { id: "gym", label: "Gym/Fitness", value: "Gym/Fitness" },
];

// Component to handle map center updates
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapLeadFinder() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 59.3293, lng: 18.0686 }); // Stockholm default
  const [radiusKm, setRadiusKm] = useState(3);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["Säkerhet", "Event", "Bemanning"]);
  const [cityName, setCityName] = useState("Stockholm");
  
  // Results state
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedProspects, setSavedProspects] = useState<Set<string>>(new Set());

  // Geocode search query using Nominatim
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=se`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setCityName(display_name.split(",")[0]);
        toast({ title: "Plats hittad", description: display_name.split(",")[0] });
      } else {
        toast({ title: "Ingen plats hittad", description: "Försök med en annan sökning", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Sökfel", description: "Kunde inte söka efter platsen", variant: "destructive" });
    }
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    
    // Reverse geocode to get city name
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data.address) {
        const name = data.address.city || data.address.town || data.address.municipality || data.address.village || "Okänd plats";
        setCityName(name);
      }
    } catch {
      setCityName("Vald plats");
    }
  };

  // Toggle industry filter
  const toggleIndustry = (value: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Search for prospects
  const handleSearch = async () => {
    if (selectedIndustries.length === 0) {
      toast({ title: "Välj branscher", description: "Du måste välja minst en bransch", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    setProspects([]);

    try {
      const response = await supabase.functions.invoke("prospect-search", {
        body: {
          city: cityName,
          coordinates,
          radiusKm,
          industries: selectedIndustries,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (data.error) {
        throw new Error(data.error);
      }

      setProspects(data.prospects || []);
      
      if (data.prospects?.length === 0) {
        toast({ title: "Inga resultat", description: "AI hittade inga företag i området. Testa en större radie eller annan plats." });
      } else {
        toast({ title: "Sökning klar", description: `Hittade ${data.prospects.length} potentiella leads` });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Sökfel",
        description: error instanceof Error ? error.message : "Kunde inte söka efter företag",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Save prospect to database
  const handleSaveProspect = async (prospect: Prospect) => {
    if (!user) return;

    const key = prospect.company_name;
    setSavingId(key);

    try {
      // Cast to any to handle the type mismatch with the generated types
      const insertData = {
        created_by: user.id,
        company_name: prospect.company_name,
        industry: prospect.industry,
        address: prospect.address,
        city: prospect.city || cityName,
        estimated_employees: prospect.estimated_employees,
        contacts: prospect.contacts as any,
        relevance_notes: prospect.relevance_notes,
        lead_score: prospect.lead_score,
        search_area: cityName,
        search_coordinates: coordinates as any,
        search_radius_km: radiusKm,
        status: "new",
      };

      const { error } = await supabase.from("prospect_leads").insert(insertData as any);

      if (error) throw error;

      setSavedProspects((prev) => new Set(prev).add(key));
      toast({ title: "Lead sparad", description: `${prospect.company_name} har lagts till i din lead-lista` });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Kunde inte spara",
        description: error instanceof Error ? error.message : "Ett fel uppstod",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
      {/* Left panel: Map and controls */}
      <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
        {/* Search bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Sök stad eller område..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
            className="flex-1"
          />
          <Button onClick={handleLocationSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-border min-h-[300px]">
          <MapContainer
            center={[coordinates.lat, coordinates.lng]}
            zoom={12}
            className="h-full w-full"
            style={{ minHeight: "300px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterUpdater center={[coordinates.lat, coordinates.lng]} />
            <MapClickHandler onMapClick={handleMapClick} />
            <Marker position={[coordinates.lat, coordinates.lng]} />
            <Circle
              center={[coordinates.lat, coordinates.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "hsl(var(--primary))", fillColor: "hsl(var(--primary))", fillOpacity: 0.1 }}
            />
          </MapContainer>
        </div>

        {/* Controls */}
        <div className="space-y-4 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{cityName}</span>
            <span className="text-xs">({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</span>
          </div>

          {/* Radius slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Radie</span>
              <span className="font-medium">{radiusKm} km</span>
            </div>
            <Slider
              value={[radiusKm]}
              onValueChange={([val]) => setRadiusKm(val)}
              min={1}
              max={15}
              step={0.5}
            />
          </div>

          {/* Industry filters */}
          <div className="space-y-2">
            <span className="text-sm">Branscher</span>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => (
                <label
                  key={industry.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedIndustries.includes(industry.value)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-secondary border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedIndustries.includes(industry.value)}
                    onCheckedChange={() => toggleIndustry(industry.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{industry.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search button */}
          <Button
            onClick={handleSearch}
            disabled={isSearching || selectedIndustries.length === 0}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Söker med AI...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Sök Företag i Området
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right panel: Results */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Resultat</h3>
          {prospects.length > 0 && (
            <span className="text-sm text-muted-foreground">{prospects.length} leads hittade</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {prospects.length === 0 && !isSearching && (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Välj ett område på kartan och klicka "Sök Företag" för att hitta potentiella kunder.</p>
              </div>
            </div>
          )}

          {isSearching && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">AI analyserar området...</p>
              </div>
            </div>
          )}

          {prospects.map((prospect, index) => {
            const isSaved = savedProspects.has(prospect.company_name);
            const isSaving = savingId === prospect.company_name;

            return (
              <div
                key={`${prospect.company_name}-${index}`}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-foreground">{prospect.company_name}</h4>
                    {prospect.industry && (
                      <span className="text-xs text-muted-foreground">{prospect.industry}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        prospect.lead_score >= 80
                          ? "bg-accent text-accent-foreground"
                          : prospect.lead_score >= 60
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {prospect.lead_score}/100
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="text-sm text-muted-foreground space-y-1">
                  {prospect.address && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {prospect.address}
                      {prospect.city && `, ${prospect.city}`}
                    </p>
                  )}
                  {prospect.estimated_employees && (
                    <p className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      ~{prospect.estimated_employees} anställda
                    </p>
                  )}
                </div>

                {/* Contacts */}
                {prospect.contacts && prospect.contacts.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <span className="text-xs text-muted-foreground font-medium">Kontakter</span>
                    {prospect.contacts.map((contact, i) => (
                      <div key={i} className="text-sm bg-secondary/50 rounded-lg p-2">
                        <p className="font-medium text-foreground">
                          {contact.name || "Okänt namn"}
                          {contact.role && <span className="font-normal text-muted-foreground"> - {contact.role}</span>}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </a>
                          )}
                          {contact.linkedin && (
                            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                              <Linkedin className="h-3 w-3" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Relevance notes */}
                <p className="text-sm text-muted-foreground italic">"{prospect.relevance_notes}"</p>

                {/* Save button */}
                <Button
                  size="sm"
                  variant={isSaved ? "outline" : "default"}
                  disabled={isSaved || isSaving}
                  onClick={() => handleSaveProspect(prospect)}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaved ? "Sparad" : "Spara som Lead"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
