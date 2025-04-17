
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TenantApplication } from "@/types/database";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationHistoryProps {
  applications: TenantApplication[];
  isLoading: boolean;
  onStartNewApplication: () => void;
  canSendNewApplication?: boolean;
}

export const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({
  applications,
  isLoading,
  onStartNewApplication,
  canSendNewApplication = true
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'received':
        return <Badge className="bg-yellow-100 text-yellow-800">Received</Badge>;
      case 'under_review':
        return <Badge className="bg-purple-100 text-purple-800">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not available";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Application History</CardTitle>
        {canSendNewApplication && (
          <Button 
            onClick={onStartNewApplication} 
            size="sm" 
            className="flex items-center"
          >
            <Plus className="mr-1 h-4 w-4" /> New Application
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : applications.length === 0 ? (
          <p className="text-muted-foreground">No application history available.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.application_type}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{formatDate(app.sent_date)}</TableCell>
                    <TableCell>{app.received_date ? formatDate(app.received_date) : "Not received"}</TableCell>
                    <TableCell>{app.reviewed_date ? formatDate(app.reviewed_date) : "Not reviewed"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
