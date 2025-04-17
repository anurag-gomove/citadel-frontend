import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditTenantForm } from "./EditTenantForm";
import { Tenant, ApplicationStatus } from "@/types/database";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TenantListProps {
  tenants: Tenant[];
  onRefresh: () => void;
}

export function TenantList({ tenants, onRefresh }: TenantListProps) {
  const navigate = useNavigate();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getLeaseStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active Lease
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Inactive Lease
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending Lease
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const getApplicationBadge = (status?: ApplicationStatus) => {
    if (!status) return null;
    
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Under Review
          </Badge>
        );
      case "received":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Received
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Sent
          </Badge>
        );
      case "not_sent":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Not Sent
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleEdit = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Lease</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-left py-8 text-muted-foreground">
                No tenants found
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  {tenant.first_name} {tenant.last_name}
                </TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>{tenant.phone || "-"}</TableCell>
                <TableCell>{tenant.property_name || "-"}</TableCell>
                <TableCell>{tenant.unit_number || "-"}</TableCell>
                <TableCell>{getLeaseStatusBadge(tenant.lease_status)}</TableCell>
                <TableCell>{getApplicationBadge(tenant.application_status)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tenant)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogTitle className="sr-only">Edit Tenant</DialogTitle>
          {selectedTenant && (
            <EditTenantForm
              tenant={selectedTenant}
              onClose={() => setIsEditDialogOpen(false)}
              onSuccess={onRefresh}
              isOpen={isEditDialogOpen}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
