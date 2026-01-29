import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Workplace {
  id: string;
  name: string;
  company_name: string;
  industry: string | null;
  workplace_type: string | null;
  workplace_code: string;
  settings: Record<string, unknown> | null;
}

interface WorkplaceContextType {
  /** The active workplace for data fetching - for super admins this may differ from their profile's workplace */
  activeWorkplace: Workplace | null;
  /** All workplaces available (only populated for super admins) */
  allWorkplaces: Workplace[];
  /** Whether workplaces are loading */
  loading: boolean;
  /** Set the active workplace (for super admins) */
  setActiveWorkplaceId: (id: string) => void;
}

const WorkplaceContext = createContext<WorkplaceContextType | undefined>(undefined);

export function WorkplaceProvider({ children }: { children: ReactNode }) {
  const { workplace, isSuperAdmin, user } = useAuth();
  const [allWorkplaces, setAllWorkplaces] = useState<Workplace[]>([]);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // For super admins: fetch all workplaces
  useEffect(() => {
    if (!user) {
      setAllWorkplaces([]);
      setLoading(false);
      return;
    }

    if (isSuperAdmin) {
      const fetchWorkplaces = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("workplaces")
          .select("*")
          .order("name");

        if (data && !error) {
          setAllWorkplaces(data as Workplace[]);
          // Auto-select first workplace if none selected and user has no assigned workplace
          if (!selectedWorkplaceId && !workplace?.id && data.length > 0) {
            setSelectedWorkplaceId(data[0].id);
          }
        }
        setLoading(false);
      };

      fetchWorkplaces();
    } else {
      setAllWorkplaces([]);
      setLoading(false);
    }
  }, [user, isSuperAdmin, workplace?.id]);

  // Determine active workplace
  const activeWorkplace = (() => {
    // For super admins with a selection, use the selected workplace
    if (isSuperAdmin && selectedWorkplaceId) {
      return allWorkplaces.find((w) => w.id === selectedWorkplaceId) || workplace;
    }
    // For super admins without selection, fall back to profile workplace or first available
    if (isSuperAdmin && !selectedWorkplaceId && allWorkplaces.length > 0) {
      return workplace || allWorkplaces[0];
    }
    // For regular users, always use their profile workplace
    return workplace;
  })();

  const setActiveWorkplaceId = (id: string) => {
    setSelectedWorkplaceId(id);
  };

  return (
    <WorkplaceContext.Provider
      value={{
        activeWorkplace,
        allWorkplaces,
        loading,
        setActiveWorkplaceId,
      }}
    >
      {children}
    </WorkplaceContext.Provider>
  );
}

export function useWorkplace() {
  const context = useContext(WorkplaceContext);
  if (context === undefined) {
    throw new Error("useWorkplace must be used within a WorkplaceProvider");
  }
  return context;
}
