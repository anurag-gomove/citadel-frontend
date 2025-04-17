import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, UserRound, FileSpreadsheet, ClipboardList, FileSignature, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Tenant, TenantApplication } from "@/types/database";
import { TenantProfile } from "@/components/tenants/TenantProfile";
import { TenantLease } from "@/components/tenants/TenantLease";
import { ApplicationStatus, ApplicationStatus as ApplicationStatusType } from "@/components/tenants/ApplicationStatus";
import { LeaseManagement } from "@/components/tenants/LeaseManagement";
import { ApplicationHistory } from "@/components/tenants/ApplicationHistory";
import { RentalApplicationManagement } from "@/components/tenants/RentalApplicationManagement";

export default function TenantDetails() {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentApplicationType, setCurrentApplicationType] = useState('Rental Application');

  const handleBackNavigation = () => {
    if (location.pathname.includes('/lease')) {
      navigate(`/tenants/${id}`);
    } else {
      navigate('/tenants');
    }
  };

  const {
    data: tenant,
    isLoading,
    error
  } = useQuery({
    queryKey: ["tenant", id],
    queryFn: async () => {
      if (!id) throw new Error("Tenant ID is required");

      const {
        data,
        error
      } = await supabase.from("tenants").select("*").eq("id", id).single();
      if (error) throw error;
      console.log("Tenant data loaded:", data);
      return data as Tenant;
    },
    enabled: !!id
  });

  const {
    data: property,
    isLoading: isPropertyLoading
  } = useQuery({
    queryKey: ["tenant-property", tenant?.property_id],
    queryFn: async () => {
      if (!tenant?.property_id) {
        if (tenant?.unit_number) {
          console.log("No property_id found, but unit_number exists. Trying to find property by unit:", tenant.unit_number);

          const {
            data: unitData,
            error: unitError
          } = await supabase.from("units").select("property_id").eq("unit_number", tenant.unit_number).maybeSingle();
          if (unitError) {
            console.error("Error finding unit:", unitError);
            return null;
          }
          if (unitData?.property_id) {
            console.log("Found property_id from unit:", unitData.property_id);

            const {
              data: propertyData,
              error: propertyError
            } = await supabase.from("properties").select("*").eq("id", unitData.property_id).single();
            if (propertyError) {
              console.error("Error fetching property by unit's property_id:", propertyError);
              return null;
            }

            if (propertyData && id) {
              console.log("Updating tenant with property_id from unit");
              await supabase.from("tenants").update({
                property_id: unitData.property_id
              }).eq("id", id);

              queryClient.setQueryData(["tenant", id], {
                ...tenant,
                property_id: unitData.property_id
              });
            }
            return propertyData;
          }
        }
        console.log("No property_id found for tenant and couldn't find by unit:", tenant);
        return null;
      }
      console.log("Fetching property with id:", tenant.property_id);
      const {
        data,
        error
      } = await supabase.from("properties").select("*").eq("id", tenant.property_id).single();
      if (error) {
        console.error("Error fetching property:", error);
        throw error;
      }
      console.log("Property data loaded:", data);
      return data;
    },
    enabled: !!tenant
  });

  const {
    data: applications,
    isLoading: isApplicationsLoading
  } = useQuery({
    queryKey: ["tenant-applications", id],
    queryFn: async () => {
      if (!id) throw new Error("Tenant ID is required");

      const { data, error } = await supabase
        .from("tenant_applications")
        .select("*")
        .eq("tenant_id", id)
        .order("sent_date", { ascending: false });
        
      if (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
      console.log("Applications loaded:", data);
      return data as TenantApplication[];
    },
    enabled: !!id
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async (params: {
      status: string;
      dateField?: string;
      applicationId?: string;
      applicationType?: string;
    }) => {
      if (!id) throw new Error("Tenant ID is required");
      
      const { status, dateField, applicationId, applicationType } = params;
      console.log("Updating application status with params:", params);
      
      if (applicationId) {
        console.log("Updating existing application:", applicationId);
        const updates: Record<string, any> = { status };
        
        if (dateField) {
          updates[dateField.replace('application_', '')] = new Date().toISOString();
        }
        
        const { error } = await supabase
          .from("tenant_applications")
          .update(updates)
          .eq("id", applicationId);
          
        if (error) {
          console.error("Error updating application:", error);
          throw error;
        }
      } 
      else if (status === 'sent') {
        console.log("Creating new application for tenant:", id);
        const { data, error } = await supabase
          .from("tenant_applications")
          .insert({
            tenant_id: id,
            application_type: applicationType || 'Rental Application',
            status: 'sent',
            sent_date: new Date().toISOString()
          })
          .select();
          
        if (error) {
          console.error("Error creating application:", error);
          throw error;
        }
        
        console.log("New application created:", data);
      }
      
      const tenantUpdates: Record<string, any> = {
        application_status: status
      };
      
      if (dateField) {
        tenantUpdates[dateField] = new Date().toISOString();
      }
      
      if (status === 'approved' || status === 'rejected') {
        tenantUpdates.can_send_new_application = true;
      }
      
      console.log("Updating tenant with:", tenantUpdates);
      const { error } = await supabase
        .from("tenants")
        .update(tenantUpdates)
        .eq("id", id);
        
      if (error) {
        console.error("Error updating tenant:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-applications", id] });
    }
  });

  const startNewApplicationMutation = useMutation({
    mutationFn: async (applicationType: string) => {
      if (!id) throw new Error("Tenant ID is required");
      
      const { error } = await supabase
        .from("tenants")
        .update({ 
          application_status: 'not_sent',
          application_sent_date: null,
          application_received_date: null,
          application_reviewed_date: null,
          can_send_new_application: false
        })
        .eq("id", id);
        
      if (error) throw error;
      
      setCurrentApplicationType(applicationType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      toast({
        title: "New Application Started",
        description: `Ready to send a new ${currentApplicationType}.`
      });
    }
  });

  const updateApplicationStatus = async (status: string, dateField?: string) => {
    if (!id) return;
    setIsUpdating(true);
    
    try {
      const currentApplication = applications?.find(app => 
        !['approved', 'rejected'].includes(app.status)
      );
      
      console.log("Current active application:", currentApplication);
      
      await updateApplicationStatusMutation.mutateAsync({
        status,
        dateField,
        applicationId: currentApplication?.id,
        applicationType: currentApplicationType
      });
      
      toast({
        title: "Status Updated",
        description: `Application status changed to ${status}.`
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartNewApplication = async (applicationType = 'Rental Application') => {
    try {
      await startNewApplicationMutation.mutateAsync(applicationType);
    } catch (error) {
      console.error("Error starting new application:", error);
      toast({
        title: "Failed to Start New Application",
        description: "There was an error starting a new application. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendApplication = () => {
    updateApplicationStatus("sent", "application_sent_date");
  };

  const handleMarkReceived = () => {
    updateApplicationStatus("received", "application_received_date");
  };

  const handleStartReview = () => {
    updateApplicationStatus("under_review", "application_reviewed_date");
  };

  const handleApproveApplication = () => {
    updateApplicationStatus("approved");
  };

  const handleRejectApplication = () => {
    updateApplicationStatus("rejected");
  };

  const handleSaveChanges = async (updatedTenantData: Partial<Tenant>) => {
    if (!id) return;
    setIsSaving(true);
    try {
      console.log("Saving tenant data:", updatedTenantData);
      
      const { error } = await supabase
        .from('tenants')
        .update({
          ...updatedTenantData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Tenant profile has been successfully updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update tenant profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading tenant information...</div>;
  }

  if (error || !tenant) {
    console.error("Error loading tenant:", error);
    return <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Error Loading Tenant</h1>
        <p className="text-red-500">
          {error ? (error as Error).message : "Tenant not found"}
        </p>
        <Button onClick={handleBackNavigation} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>;
  }

  return <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {tenant.first_name} {tenant.last_name}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => handleSaveChanges(tenant)} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Send Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile" className="flex items-center">
                <UserRound className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="application" className="flex items-center">
                <FileSignature className="mr-2 h-4 w-4" />
                Rental Application
              </TabsTrigger>
              <TabsTrigger value="lease" className="flex items-center">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Lease Management
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12">
                  <TenantProfile tenant={tenant} property={property} isPropertyLoading={isPropertyLoading} alwaysEditable={true} onSave={handleSaveChanges} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="application" className="mt-0">
              <RentalApplicationManagement
                tenant={tenant}
                applications={applications || []}
                isApplicationsLoading={isApplicationsLoading}
                onSendApplication={handleSendApplication}
                onMarkReceived={handleMarkReceived}
                onStartReview={handleStartReview}
                onApprove={handleApproveApplication}
                onReject={handleRejectApplication}
                onStartNewApplication={() => handleStartNewApplication()}
                currentApplicationType={currentApplicationType}
              />
            </TabsContent>
            
            <TabsContent value="lease" className="mt-0">
              <LeaseManagement tenant={tenant} property={property} />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Documents & Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No documents have been uploaded for this tenant yet.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
}
