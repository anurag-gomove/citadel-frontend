import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lease } from "@/types/lease";

export function useLeaseOperations(tenantId: string | undefined, navigateCallback: (path: string) => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveLeaseMutation = useMutation({
    mutationFn: async (data: Partial<Lease>) => {
      const prepareJsonField = (field: any) => {
        return field ? (typeof field === 'string' ? field : JSON.stringify(field)) : null;
      };
      
      if (!data.id) {
        console.log("Creating new lease with data:", data);

        const { data: insertedLease, error } = await supabase
          .from("leases")
          .insert({
            tenant_id: data.tenantId,
            property_id: data.propertyId,
            
            // Landlord information
            landlord_name: data.landlordName,
            landlord_street_number: data.landlordStreetNumber,
            landlord_street_name: data.landlordStreetName,
            landlord_apartment: data.landlordApartment,
            landlord_address: data.landlordAddress, // Keep for backward compatibility
            landlord_municipality: data.landlordMunicipality,
            landlord_postal_code: data.landlordPostalCode,
            landlord_telephone: data.landlordTelephone,
            landlord_cell_phone: data.landlordCellPhone,
            landlord_email: data.landlordEmail,
            landlord_representative: data.landlordRepresentative,
            
            // Second landlord information
            second_landlord_name: data.secondLandlordName,
            second_landlord_street_number: data.secondLandlordStreetNumber,
            second_landlord_street_name: data.secondLandlordStreetName,
            second_landlord_apartment: data.secondLandlordApartment,
            second_landlord_municipality: data.secondLandlordMunicipality,
            second_landlord_postal_code: data.secondLandlordPostalCode,
            second_landlord_telephone: data.secondLandlordTelephone,
            second_landlord_cell_phone: data.secondLandlordCellPhone,
            second_landlord_email: data.secondLandlordEmail,
            
            // Primary tenant information
            tenant_name: data.tenantName,
            tenant_street_number: data.tenantStreetNumber,
            tenant_street_name: data.tenantStreetName,
            tenant_apartment: data.tenantApartment,
            tenant_municipality: data.tenantMunicipality,
            tenant_postal_code: data.tenantPostalCode,
            tenant_telephone: data.tenantTelephone,
            tenant_cell_phone: data.tenantCellPhone,
            tenant_email: data.tenantEmail,
            
            // Second tenant information
            second_tenant_id: data.secondTenantId,
            second_tenant_name: data.secondTenantName,
            second_tenant_street_number: data.secondTenantStreetNumber,
            second_tenant_street_name: data.secondTenantStreetName,
            second_tenant_apartment: data.secondTenantApartment,
            second_tenant_municipality: data.secondTenantMunicipality,
            second_tenant_postal_code: data.secondTenantPostalCode,
            second_tenant_telephone: data.secondTenantTelephone,
            second_tenant_cell_phone: data.secondTenantCellPhone,
            second_tenant_email: data.secondTenantEmail,
            
            // Dwelling information
            dwelling_address: data.dwellingAddress,
            dwelling_street_number: data.dwellingStreetNumber,
            dwelling_street: data.dwellingStreet,
            dwelling_apt: data.dwellingApt,
            dwelling_municipality: data.dwellingMunicipality,
            dwelling_zipcode: data.dwellingZipcode,
            number_of_rooms: data.numberOfRooms,
            purpose: data.purpose,
            mixed_purpose_types: prepareJsonField(data.mixedPurposeTypes),
            is_condominium: data.isCondominium,
            outdoor_parking_spaces: data.outdoorParkingSpaces,
            outdoor_parking_location: data.outdoorParkingLocation,
            indoor_parking_spaces: data.indoorParkingSpaces,
            indoor_parking_location: data.indoorParkingLocation,
            storage_details: data.storageDetails,
            other_accessories: data.otherAccessories,
            furniture_included: data.furnitureIncluded,
            appliances: prepareJsonField(data.appliances),
            furniture: prepareJsonField(data.furniture),
            other_furnishings: data.otherFurnishings,
            smoke_detector_acknowledged: data.smokeDetectorAcknowledged,
            
            // Lease Term
            lease_type: data.leaseType,
            duration_value: data.durationValue,
            duration_unit: data.durationUnit,
            start_date: data.startDate,
            end_date: data.endDate,
            
            // Rent information
            base_rent: data.baseRent,
            services_cost: data.servicesCost,
            total_rent: data.totalRent,
            rent_frequency: data.rentFrequency,
            subsidy_program: data.subsidyProgram,
            subsidy_program_details: data.subsidyProgramDetails,
            first_payment_date: data.firstPaymentDate,
            payment_day: data.paymentDay,
            payment_method: data.paymentMethod,
            postdated_checks: data.postdatedChecks,
            payment_location: data.paymentLocation,
            
            // Services and conditions
            building_regulations_date: data.buildingRegulationsDate,
            building_regulations_acknowledged: data.buildingRegulationsAcknowledged,
            condominium_regulations_provided: data.condominiumRegulationsProvided,
            condominium_regulations_date: data.condominiumRegulationsDate,
            repairs_before_delivery: data.repairsBeforeDelivery,
            repairs_during_lease: data.repairsDuringLease,
            superintendent_name: data.superintendentName,
            superintendent_phone: data.superintendentPhone,
            superintendent_email: data.superintendentEmail,
            superintendent_other_phone: data.superintendentOtherPhone,
            service_responsibilities: prepareJsonField(data.serviceResponsibilities),
            heating_source_type: data.heatingSourceType,
            access_to_land: data.accessToLand,
            animals_allowed: data.animalsAllowed,
            other_conditions: data.otherConditions,
            
            // Rent restrictions
            property_built_last_5_years: data.propertyBuiltLast5Years,
            property_built_date: data.propertyBuiltDate,
            property_converted_last_5_years: data.propertyConvertedLast5Years,
            property_converted_date: data.propertyConvertedDate,
            
            // New tenant notice
            previous_lowest_rent: data.previousLowestRent,
            same_property_services: data.samePropertyServices,
            property_modifications: data.propertyModifications,
            
            // Signatures and declarations
            joint_tenant_liability: data.jointTenantLiability,
            other_signatories: prepareJsonField(data.otherSignatories),
            family_residence_declaration: data.familyResidenceDeclaration,
            spouse_name: data.spouseName,
            family_residence_notes: data.familyResidenceNotes,
            
            status: data.status || "draft"
          })
          .select();
          
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        return insertedLease;
      } else {
        console.log("Updating existing lease with data:", data);
        
        const { data: updatedLease, error } = await supabase
          .from("leases")
          .update({
            // Landlord information
            landlord_name: data.landlordName,
            landlord_street_number: data.landlordStreetNumber,
            landlord_street_name: data.landlordStreetName,
            landlord_apartment: data.landlordApartment,
            landlord_address: data.landlordAddress, // Keep for backward compatibility
            landlord_municipality: data.landlordMunicipality,
            landlord_postal_code: data.landlordPostalCode,
            landlord_telephone: data.landlordTelephone,
            landlord_cell_phone: data.landlordCellPhone,
            landlord_email: data.landlordEmail,
            landlord_representative: data.landlordRepresentative,
            
            // Second landlord information
            second_landlord_name: data.secondLandlordName,
            second_landlord_street_number: data.secondLandlordStreetNumber,
            second_landlord_street_name: data.secondLandlordStreetName,
            second_landlord_apartment: data.secondLandlordApartment,
            second_landlord_municipality: data.secondLandlordMunicipality,
            second_landlord_postal_code: data.secondLandlordPostalCode,
            second_landlord_telephone: data.secondLandlordTelephone,
            second_landlord_cell_phone: data.secondLandlordCellPhone,
            second_landlord_email: data.secondLandlordEmail,
            
            // Primary tenant information
            tenant_name: data.tenantName,
            tenant_street_number: data.tenantStreetNumber,
            tenant_street_name: data.tenantStreetName,
            tenant_apartment: data.tenantApartment,
            tenant_municipality: data.tenantMunicipality,
            tenant_postal_code: data.tenantPostalCode,
            tenant_telephone: data.tenantTelephone,
            tenant_cell_phone: data.tenantCellPhone,
            tenant_email: data.tenantEmail,
            
            // Second tenant information
            second_tenant_id: data.secondTenantId,
            second_tenant_name: data.secondTenantName,
            second_tenant_street_number: data.secondTenantStreetNumber,
            second_tenant_street_name: data.secondTenantStreetName,
            second_tenant_apartment: data.secondTenantApartment,
            second_tenant_municipality: data.secondTenantMunicipality,
            second_tenant_postal_code: data.secondTenantPostalCode,
            second_tenant_telephone: data.secondTenantTelephone,
            second_tenant_cell_phone: data.secondTenantCellPhone,
            second_tenant_email: data.secondTenantEmail,
            
            // Dwelling information
            dwelling_address: data.dwellingAddress,
            dwelling_street_number: data.dwellingStreetNumber,
            dwelling_street: data.dwellingStreet,
            dwelling_apt: data.dwellingApt,
            dwelling_municipality: data.dwellingMunicipality,
            dwelling_zipcode: data.dwellingZipcode,
            number_of_rooms: data.numberOfRooms,
            purpose: data.purpose,
            mixed_purpose_types: prepareJsonField(data.mixedPurposeTypes),
            is_condominium: data.isCondominium,
            outdoor_parking_spaces: data.outdoorParkingSpaces,
            outdoor_parking_location: data.outdoorParkingLocation,
            indoor_parking_spaces: data.indoorParkingSpaces,
            indoor_parking_location: data.indoorParkingLocation,
            storage_details: data.storageDetails,
            other_accessories: data.otherAccessories,
            furniture_included: data.furnitureIncluded,
            appliances: prepareJsonField(data.appliances),
            furniture: prepareJsonField(data.furniture),
            other_furnishings: data.otherFurnishings,
            smoke_detector_acknowledged: data.smokeDetectorAcknowledged,
            
            // Lease Term
            lease_type: data.leaseType,
            duration_value: data.durationValue,
            duration_unit: data.durationUnit,
            start_date: data.startDate,
            end_date: data.endDate,
            
            // Rent information
            base_rent: data.baseRent,
            services_cost: data.servicesCost,
            total_rent: data.totalRent,
            rent_frequency: data.rentFrequency,
            subsidy_program: data.subsidyProgram,
            subsidy_program_details: data.subsidyProgramDetails,
            first_payment_date: data.firstPaymentDate,
            payment_day: data.paymentDay,
            payment_method: data.paymentMethod,
            postdated_checks: data.postdatedChecks,
            payment_location: data.paymentLocation,
            
            // Services and conditions
            building_regulations_date: data.buildingRegulationsDate,
            building_regulations_acknowledged: data.buildingRegulationsAcknowledged,
            condominium_regulations_provided: data.condominiumRegulationsProvided,
            condominium_regulations_date: data.condominiumRegulationsDate,
            repairs_before_delivery: data.repairsBeforeDelivery,
            repairs_during_lease: data.repairsDuringLease,
            superintendent_name: data.superintendentName,
            superintendent_phone: data.superintendentPhone,
            superintendent_email: data.superintendentEmail,
            superintendent_other_phone: data.superintendentOtherPhone,
            service_responsibilities: prepareJsonField(data.serviceResponsibilities),
            heating_source_type: data.heatingSourceType,
            access_to_land: data.accessToLand,
            animals_allowed: data.animalsAllowed,
            other_conditions: data.otherConditions,
            
            // Rent restrictions
            property_built_last_5_years: data.propertyBuiltLast5Years,
            property_built_date: data.propertyBuiltDate,
            property_converted_last_5_years: data.propertyConvertedLast5Years,
            property_converted_date: data.propertyConvertedDate,
            
            // New tenant notice
            previous_lowest_rent: data.previousLowestRent,
            same_property_services: data.samePropertyServices,
            property_modifications: data.propertyModifications,
            
            // Signatures and declarations
            joint_tenant_liability: data.jointTenantLiability,
            other_signatories: prepareJsonField(data.otherSignatories),
            family_residence_declaration: data.familyResidenceDeclaration,
            spouse_name: data.spouseName,
            family_residence_notes: data.familyResidenceNotes,
            
            status: data.status || "draft"
          })
          .eq("id", data.id)
          .select();
          
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        return updatedLease;
      }
    },
    onSuccess: () => {
      toast({
        title: "Lease Saved",
        description: "The lease has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["tenant-leases", tenantId] });
    },
    onError: (error) => {
      console.error("Error saving lease:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the lease. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = async (formData: Partial<Lease>, status: "draft" | "active" = "draft") => {
    setIsSaving(true);
    try {
      await saveLeaseMutation.mutateAsync({
        ...formData,
        status
      });
      
      if (status === "active") {
        await supabase
          .from("tenants")
          .update({
            lease_status: "active",
            lease_start_date: formData.startDate,
            lease_end_date: formData.endDate,
            property_id: formData.propertyId,
            unit_id: formData.unitId,
            unit_number: formData.unitNumber,
            updated_at: new Date().toISOString()
          })
          .eq("id", tenantId);
          
        queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        queryClient.invalidateQueries({ queryKey: ["units"] });
      }
      
      if (status === "active") {
        navigateCallback(`/tenants/${tenantId}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave
  };
}
