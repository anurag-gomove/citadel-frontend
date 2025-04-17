
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Copy, Trash2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { UnitTemplatesDialog } from "./UnitTemplatesDialog";
import { BulkUnitCreation } from "./BulkUnitCreation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface PropertyUnitsProps {
  propertyId: string;
}

export function PropertyUnits({ propertyId }: PropertyUnitsProps) {
  const navigate = useNavigate();
  const [unitToDelete, setUnitToDelete] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch property information to check primary classification
  const { data: property } = useQuery({
    queryKey: ["property-details", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, primary_classification")
        .eq("id", propertyId)
        .single();

      if (error) {
        console.error("Error fetching property details:", error);
        throw error;
      }
      return data;
    },
  });

  const isSingleUnitProperty = property?.primary_classification === "Single Unit property";

  const { data: units, refetch } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select(`
        *,
        tenants:tenant_id(
          id,
          first_name,
          last_name,
          lease_start_date
        )
      `)
        .eq("property_id", propertyId)
        .order("unit_number");

      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      console.log("Fetched units:", data);
      return data || [];
    },
  });

  const handleEditClick = (unit: any) => {
    console.log(`Navigating to edit unit: ${propertyId}/units/${unit.id}/edit`);
    navigate(`/properties/${propertyId}/units/${unit.id}/edit`);
  };

  const handleAddClick = () => {
    // Check if this is a single unit property and already has a unit
    if (isSingleUnitProperty && units && units.length > 0) {
      toast.error("This property can only have one unit. Please edit the existing unit.");
      return;
    }
    navigate(`/properties/${propertyId}/units/new`);
  };

  const handleDuplicateClick = async (unit: any) => {
    // Prevent duplication for single unit properties
    if (isSingleUnitProperty) {
      toast.error("You cannot duplicate units for single unit properties.");
      return;
    }

    try {
      console.log("Original unit to duplicate:", unit);
      
      // Extract only the fields we want to copy
      const { 
        id, 
        created_at, 
        updated_at, 
        tenants, 
        tenant_id,
        status,
        ...unitToDuplicate 
      } = unit;
      
      // Create a new unit object
      const newUnit = {
        ...unitToDuplicate,
        unit_number: "", // Empty unit number for manual entry
        tenant_id: null, // No tenant assigned
        status: "vacant", // Mark as vacant since no tenant is assigned
      };
      
      console.log("Attempting to create new unit:", newUnit);
      
      // Insert the new unit
      const { data, error } = await supabase
        .from("units")
        .insert([newUnit])
        .select();
      
      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      
      console.log("Duplicate unit created:", data);
      toast.success("Unit duplicated successfully");
      refetch(); // Refresh the units list
      
      // Navigate to edit the new unit
      if (data && data.length > 0) {
        navigate(`/properties/${propertyId}/units/${data[0].id}/edit`);
      }
    } catch (error) {
      console.error("Error duplicating unit:", error);
      toast.error("Failed to duplicate unit");
    }
  };

  const handleDeleteClick = (unit: any) => {
    setUnitToDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      const { error } = await supabase
        .from("units")
        .delete()
        .eq("id", unitToDelete.id);

      if (error) {
        throw error;
      }

      toast.success("Unit deleted successfully");
      refetch(); // Refresh the units list
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit");
    } finally {
      setIsDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Units</h2>
        <div className="flex space-x-2">
          {!isSingleUnitProperty && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        disabled 
                        className="opacity-70 cursor-not-allowed"
                      >
                        Manage Templates
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-xs" variant="outline">
                          Soon
                        </Badge>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is coming soon!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        disabled 
                        className="opacity-70 cursor-not-allowed"
                      >
                        Bulk Create Units
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-xs" variant="outline">
                          Soon
                        </Badge>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is coming soon!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          <Button 
            onClick={handleAddClick}
            disabled={isSingleUnitProperty && units && units.length > 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>
      </div>

      {isSingleUnitProperty && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            This is a <span className="font-semibold">Single Unit property</span>. Only one unit can be created for this property.
            {units && units.length > 0 && " You already have a unit created."}
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Number</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Rent Due Date</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Move In</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Square Feet</TableHead>
              <TableHead>Bedrooms</TableHead>
              <TableHead>Bathrooms</TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units && units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.unit_number}</TableCell>
                  <TableCell>
                    {unit.monthly_rent
                      ? `$${unit.monthly_rent.toLocaleString()}`
                      : "-"}
                  </TableCell>
                  <TableCell>{unit.rent_due_date ? `${unit.rent_due_date} of each month` : "-"}</TableCell>
                  <TableCell>
                    {unit.tenants 
                      ? `${unit.tenants.first_name} ${unit.tenants.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {unit.tenants?.lease_start_date
                      ? format(new Date(unit.tenants.lease_start_date), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        unit.status === "vacant"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {unit.status}
                    </span>
                  </TableCell>
                  <TableCell>{unit.square_feet || "-"}</TableCell>
                  <TableCell>{unit.bedrooms || "-"}</TableCell>
                  <TableCell>{unit.bathrooms || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(unit)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit unit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {!isSingleUnitProperty && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDuplicateClick(unit)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duplicate unit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(unit)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete unit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No units found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this unit?</AlertDialogTitle>
            <AlertDialogDescription>
              {unitToDelete?.tenants ? (
                <span className="text-red-600">
                  Warning: This unit is currently occupied by {unitToDelete.tenants.first_name} {unitToDelete.tenants.last_name}.
                </span>
              ) : (
                "This unit is currently vacant."
              )}
              <p className="mt-2">This action cannot be undone. The unit will be permanently deleted from the system.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
