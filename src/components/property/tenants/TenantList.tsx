
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import { Tenant } from "@/types/database";
import { formatLocalDate } from "@/utils/timezone";

interface TenantListProps {
  tenants: Tenant[];
  onRemoveTenant: (tenant: { id: string; name: string }) => void;
}

export const TenantList = ({ tenants, onRemoveTenant }: TenantListProps) => {
  const getApplicationStatusBadge = (status?: string | null) => {
    if (!status || status === 'not_sent') return null;
    
    const badgeClasses = {
      sent: "bg-blue-100 text-blue-800",
      received: "bg-yellow-100 text-yellow-800",
      under_review: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    const statusLabel = {
      sent: "Sent",
      received: "Received",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected"
    };
    
    const classes = badgeClasses[status as keyof typeof badgeClasses] || "bg-gray-100 text-gray-800";
    const label = statusLabel[status as keyof typeof statusLabel] || status;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Unit</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Phone</TableHead>
            <TableHead className="text-left">Lease Start</TableHead>
            <TableHead className="text-left">Lease End</TableHead>
            <TableHead className="text-left">Lease</TableHead>
            <TableHead className="text-left">Application</TableHead>
            <TableHead className="text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants && tenants.length > 0 ? (
            tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="text-left">{`${tenant.first_name} ${tenant.last_name}`}</TableCell>
                <TableCell className="text-left">{tenant.unit_number || "-"}</TableCell>
                <TableCell className="text-left">{tenant.email || "-"}</TableCell>
                <TableCell className="text-left">{tenant.phone || "-"}</TableCell>
                <TableCell className="text-left">{tenant.lease_start_date ? formatLocalDate(tenant.lease_start_date) : "-"}</TableCell>
                <TableCell className="text-left">{tenant.lease_end_date ? formatLocalDate(tenant.lease_end_date) : "-"}</TableCell>
                <TableCell className="text-left">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.lease_status === "active"
                        ? "bg-green-100 text-green-800"
                        : tenant.lease_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tenant.lease_status}
                  </span>
                </TableCell>
                <TableCell className="text-left">
                  {getApplicationStatusBadge(tenant.application_status)}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onRemoveTenant({
                        id: tenant.id,
                        name: `${tenant.first_name} ${tenant.last_name}`
                      });
                    }}
                  >
                    <UserMinus className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-left text-muted-foreground">
                No tenants found for this property
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
