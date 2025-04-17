
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TenantListHeaderProps {
  onAddTenant: () => void;
}

export const TenantListHeader = ({ onAddTenant }: TenantListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Property Tenants</h2>
      <Button onClick={onAddTenant}>
        <Plus className="h-4 w-4 mr-2" />
        Add Tenant
      </Button>
    </div>
  );
};
