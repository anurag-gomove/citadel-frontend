import { Tenant } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

export interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}

export function TenantCard({ tenant, onEdit, onDelete }: TenantCardProps) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle>{`${tenant.first_name} ${tenant.last_name}`}</CardTitle>
        <CardDescription>{tenant.email}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Remove any is_favorite related UI elements */}
        <div className="space-y-2">
          <p>Phone: {tenant.phone || 'N/A'}</p>
          <p>Status: {tenant.status}</p>
          <p>Lease Status: {tenant.lease_status}</p>
          <p>Unit: {tenant.unit_number || 'Not assigned'}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(tenant)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(tenant.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
