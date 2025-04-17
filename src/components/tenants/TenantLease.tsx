
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tenant, LeaseStatus } from "@/types/database";
import { format } from "date-fns";
import { Calendar, DollarSign, CreditCard } from "lucide-react";

interface TenantLeaseProps {
  tenant: Tenant;
}

export const TenantLease: React.FC<TenantLeaseProps> = ({ tenant }) => {
  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMMM d, yyyy");
  };

  const getLeaseStatusBadge = (status: LeaseStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Lease Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="mt-1">{getLeaseStatusBadge(tenant.lease_status)}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Credit Score</h3>
            <p className="text-base flex items-center mt-1">
              <CreditCard className="mr-1 h-4 w-4 text-muted-foreground" />
              {tenant.credit_score || "Not available"}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
            <p className="text-base flex items-center mt-1">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              {formatDate(tenant.lease_start_date)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
            <p className="text-base flex items-center mt-1">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              {formatDate(tenant.lease_end_date)}
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Previous Address</h3>
          <p className="text-base mt-1">{tenant.previous_address || "Not provided"}</p>
        </div>
      </CardContent>
    </Card>
  );
};
