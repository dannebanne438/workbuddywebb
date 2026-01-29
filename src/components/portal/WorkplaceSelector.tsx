import { useAuth } from "@/contexts/AuthContext";
import { useWorkplace } from "@/contexts/WorkplaceContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface WorkplaceSelectorProps {
  collapsed?: boolean;
}

export function WorkplaceSelector({ collapsed }: WorkplaceSelectorProps) {
  const { isSuperAdmin } = useAuth();
  const { activeWorkplace, allWorkplaces, setActiveWorkplaceId } = useWorkplace();

  if (!isSuperAdmin || allWorkplaces.length === 0) {
    return null;
  }

  if (collapsed) {
    return (
      <div className="p-2">
        <div
          className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto"
          title={activeWorkplace?.name}
        >
          <Building2 className="h-4 w-4 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
        Visa arbetsplats
      </p>
      <Select
        value={activeWorkplace?.id}
        onValueChange={setActiveWorkplaceId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Välj arbetsplats" />
        </SelectTrigger>
        <SelectContent>
          {allWorkplaces.map((wp) => (
            <SelectItem key={wp.id} value={wp.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{wp.name}</span>
                <span className="text-xs text-muted-foreground">{wp.company_name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
