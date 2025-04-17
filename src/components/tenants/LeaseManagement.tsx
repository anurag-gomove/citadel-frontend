
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tenant, LeaseStatus } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ClipboardList, FileText, History, Calendar, Check, X, Plus, FileEdit, Clock, AlertCircle, CheckCircle, File, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface LeaseManagementProps {
  tenant: Tenant;
  property: any | null;
}

// Define a type for the database lease format
interface DatabaseLease {
  id: string;
  tenant_id: string;
  property_id: string | null;
  unit_number: string | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  base_rent: number | null;
  start_date: string | null;
  end_date: string | null;
  monthly_rent?: number | null;
  security_deposit: number | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export function LeaseManagement({ tenant, property }: LeaseManagementProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreatingLease, setIsCreatingLease] = useState(false);
  const [leaseDate, setLeaseDate] = useState<DateRange | undefined>();
  const [newLeaseForm, setNewLeaseForm] = useState({
    monthly_rent: '',
    security_deposit: '',
    unit_number: tenant.unit_number || '',
    notes: ''
  });
  const [leaseToDelete, setLeaseToDelete] = useState<DatabaseLease | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch lease data from the leases table
  const { data: leaseHistory = [], isLoading: isLoadingLeases } = useQuery({
    queryKey: ["tenant-leases", tenant.id],
    queryFn: async () => {
      // Fetch all leases for this tenant
      const { data, error } = await supabase
        .from("leases")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("updated_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching leases:", error);
        throw error;
      }
      
      // Mark the current active lease
      const leases = data.map((lease: any) => ({
        ...lease,
        is_current: lease.status === 'active' && 
                    tenant.lease_status === 'active' && 
                    tenant.lease_start_date === lease.start_date
      }));
      
      return leases as DatabaseLease[];
    }
  });

  const handleLeaseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLeaseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateLease = async () => {
    // Navigate to the new lease creation page
    navigate(`/tenants/${tenant.id}/lease`);
  };
  
  const handleReplaceLease = async () => {
    // Replace current lease (mark old one as terminated and create new)
    try {
      // First terminate the current lease
      await handleTerminateLease(false); // Don't show toast for this intermediate step
      
      // Then navigate to create a new lease
      navigate(`/tenants/${tenant.id}/lease`);
    } catch (error) {
      console.error("Error replacing lease:", error);
      toast({
        title: "Error",
        description: "Failed to initiate lease replacement. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinueEditing = (leaseId: string) => {
    navigate(`/tenants/${tenant.id}/lease?id=${leaseId}`);
  };

  const handleTerminateLease = async (showToast = true) => {
    try {
      // Update tenant to mark lease as inactive
      const { error } = await supabase
        .from('tenants')
        .update({
          lease_status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id);

      if (error) throw error;

      // In a real implementation, you would also update the record in a leases table

      if (showToast) {
        toast({
          title: "Lease Terminated",
          description: "The lease has been successfully terminated."
        });
      }

      queryClient.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-leases", tenant.id] });
      
    } catch (error) {
      console.error("Error terminating lease:", error);
      toast({
        title: "Error",
        description: "Failed to terminate lease. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLease = async () => {
    if (!leaseToDelete) return;

    try {
      const { error } = await supabase
        .from('leases')
        .delete()
        .eq('id', leaseToDelete.id);

      if (error) throw error;

      toast({
        title: "Draft Deleted",
        description: "The lease draft has been successfully deleted."
      });

      queryClient.invalidateQueries({ queryKey: ["tenant-leases", tenant.id] });
      setIsDeleteDialogOpen(false);
      setLeaseToDelete(null);
    } catch (error) {
      console.error("Error deleting lease draft:", error);
      toast({
        title: "Error",
        description: "Failed to delete lease draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (lease: DatabaseLease) => {
    setLeaseToDelete(lease);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMMM d, yyyy");
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return "Not available";
    return format(new Date(dateTime), "MMM d, yyyy 'at' h:mm a");
  };

  const getLeaseStatusBadge = (status: LeaseStatus | string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "inactive":
      case "terminated":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <X className="h-3 w-3 mr-1" /> Inactive
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <FileEdit className="h-3 w-3 mr-1" /> Incomplete
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" /> Pending
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

  const getCurrentLease = () => {
    return leaseHistory.find(lease => lease.is_current);
  };

  const getPreviousLeases = () => {
    return leaseHistory.filter(lease => !lease.is_current);
  };

  const hasActiveLease = tenant.lease_status === 'active' && tenant.lease_start_date && tenant.lease_end_date;
  const currentLease = getCurrentLease();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
              Lease Management
            </CardTitle>
            <CardDescription>
              Manage current and previous leases for this tenant
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Create Lease
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateLease}>
                New Lease
              </DropdownMenuItem>
              {hasActiveLease && (
                <DropdownMenuItem onClick={handleReplaceLease}>
                  Replace Current Lease
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current" className="flex items-center">
              <ClipboardList className="mr-1 h-4 w-4" />
              Current Lease
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="mr-1 h-4 w-4" />
              Lease History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {isLoadingLeases ? (
              <div className="p-4 text-center text-muted-foreground">Loading lease information...</div>
            ) : hasActiveLease ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Lease Status</h3>
                    <div className="flex items-center">
                      {getLeaseStatusBadge(tenant.lease_status)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Property</h3>
                    <p className="text-base">{property?.name || "Not assigned"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Unit</h3>
                    <p className="text-base">{tenant.unit_number || "Not assigned"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Monthly Rent</h3>
                    <p className="text-base">${currentLease?.base_rent || leaseHistory[0]?.monthly_rent || "Not set"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Start Date</h3>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p className="text-base">{formatDate(tenant.lease_start_date)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">End Date</h3>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p className="text-base">{formatDate(tenant.lease_end_date)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <Button variant="destructive" onClick={() => handleTerminateLease(true)}>
                    <X className="mr-1 h-4 w-4" /> Terminate Lease
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No Active Lease</h3>
                <p className="text-muted-foreground mb-4">This tenant doesn't have an active lease yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {isLoadingLeases ? (
              <div className="p-4 text-center text-muted-foreground">Loading lease history...</div>
            ) : leaseHistory.length > 0 ? (
              <div className="space-y-4">
                {getPreviousLeases().map((lease, index) => (
                  <div key={lease.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium flex items-center">
                        <File className="mr-2 h-4 w-4 text-muted-foreground" />
                        {lease.status === 'draft' ? 'Draft Lease' : `Previous Lease #${index + 1}`}
                      </h3>
                      {getLeaseStatusBadge(lease.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {lease.status !== 'draft' && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Start Date:</p>
                            <p>{formatDate(lease.start_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date:</p>
                            <p>{formatDate(lease.end_date)}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-muted-foreground">Unit:</p>
                        <p>{lease.unit_number || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {lease.status === 'draft' ? 'Last Edited:' : 'Created:'}
                        </p>
                        <p>{formatDateTime(lease.status === 'draft' ? lease.updated_at : lease.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex space-x-2">
                      {lease.status === 'draft' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleContinueEditing(lease.id)}
                          >
                            <FileEdit className="mr-1 h-4 w-4" /> Continue Editing
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(lease)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete Draft
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {getPreviousLeases().length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No previous lease history found.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No lease history available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Draft Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lease Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this draft lease? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLease}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
