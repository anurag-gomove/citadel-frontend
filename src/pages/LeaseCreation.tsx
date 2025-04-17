
import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLeaseForm } from "@/hooks/useLeaseForm";
import { useLeaseOperations } from "@/hooks/useLeaseOperations";
import { LeaseHeader } from "@/components/lease/LeaseHeader";
import { LeasePropertySelection } from "@/components/lease/LeasePropertySelection";
import { LeaseTabsNavigation } from "@/components/lease/LeaseTabsNavigation";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lease, ServiceResponsibilities, Appliance, Furniture, LeaseType, DurationUnit, RentFrequency, OtherSignatory, MixedPurposeType, HeatingSourceType } from "@/types/lease";
import { Tenant } from "@/types/database";

export default function LeaseCreation() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leaseId = searchParams.get('id');
  const { toast } = useToast();
  
  const { data: existingLease, isLoading: isLoadingLease } = useQuery({
    queryKey: ["lease", leaseId],
    queryFn: async () => {
      if (!leaseId) return null;
      
      const { data, error } = await supabase
        .from("leases")
        .select("*")
        .eq("id", leaseId)
        .single();
        
      if (error) {
        console.error("Error fetching lease:", error);
        toast({
          title: "Error",
          description: "Failed to load lease data. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      return data;
    },
    enabled: !!leaseId
  });
  
  const leaseForm = useLeaseForm(tenantId || "");
  
  const {
    formData,
    tenant,
    properties,
    units,
    activeTab,
    selectedPropertyId,
    isTenantLoading,
    isPropertiesLoading,
    isUnitsLoading,
    tenantError,
    handlePropertyChange,
    handleUnitChange,
    handleFormChange,
    handleTabChange,
    setFormData
  } = leaseForm;
  
  const { isSaving, handleSave } = useLeaseOperations(tenantId || "", navigate);

  const parseJsonField = <T,>(field: any, defaultValue: T): T => {
    if (!field) return defaultValue;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field) as T;
      } catch (e) {
        console.error("Error parsing JSON field:", e);
        return defaultValue;
      }
    }
    return field as T;
  };

  useEffect(() => {
    if (existingLease && !isLoadingLease) {
      const parsedAppliances = parseJsonField<Appliance>(existingLease.appliances, formData.appliances || {
        stove: false,
        microwave: false,
        dishwasher: false,
        refrigerator: false,
        washer: false,
        dryer: false
      });
      
      const parsedFurniture = parseJsonField<Furniture>(existingLease.furniture, formData.furniture || {
        tables: false,
        chairs: false,
        dresser: false,
        sofa: false,
        armchair: false,
        bed: false,
        bedCount: 0,
        bedWithSize: "",
        other: ""
      });
      
      const parsedServiceResponsibilities = parseJsonField<ServiceResponsibilities>(
        existingLease.service_responsibilities, 
        formData.serviceResponsibilities || {
          heating: "landlord",
          gas: "landlord",
          electricity: "landlord",
          waterHeaterRental: "landlord",
          hotWater: "landlord",
          waterTax: "landlord",
          snowRemovalParking: "landlord",
          snowRemovalBalcony: "tenant",
          snowRemovalEntrance: "landlord",
          snowRemovalWalkway: "landlord",
          snowRemovalStairs: "landlord"
        }
      );
      
      const parsedOtherSignatories = parseJsonField<OtherSignatory[]>(
        existingLease.other_signatories, 
        formData.otherSignatories || []
      );

      const parsedMixedPurposeTypes = parseJsonField<MixedPurposeType[]>(
        existingLease.mixed_purpose_types,
        formData.mixedPurposeTypes || []
      );

      const leaseType = (existingLease.lease_type as LeaseType) || 'fixed';
      const durationUnit = (existingLease.duration_unit as DurationUnit) || 'months';
      const rentFrequency = (existingLease.rent_frequency as RentFrequency) || 'monthly';
      
      let familyResidenceNotes = "";
      if (existingLease.hasOwnProperty('family_residence_notes')) {
        familyResidenceNotes = existingLease.family_residence_notes?.toString() || "";
      }
      
      // Handle subsidy program details with proper type assertion
      let subsidyProgramDetails = "";
      
      // Use type assertion to tell TypeScript this property might exist
      const leaseWithDetails = existingLease as any;
      if (leaseWithDetails.subsidy_program_details !== undefined) {
        subsidyProgramDetails = leaseWithDetails.subsidy_program_details || "";
      }
      
      let heatingSourceType: HeatingSourceType | undefined = undefined;
      
      if (leaseWithDetails.heating_source_type) {
        heatingSourceType = leaseWithDetails.heating_source_type as HeatingSourceType;
      }
      
      setFormData({
        ...formData,
        id: existingLease.id,
        tenantId: existingLease.tenant_id,
        property_id: existingLease.property_id,
        
        landlordName: existingLease.landlord_name,
        landlordStreetNumber: existingLease.landlord_street_number || "",
        landlordStreetName: existingLease.landlord_street_name || "",
        landlordApartment: existingLease.landlord_apartment || "",
        landlordAddress: existingLease.landlord_address,
        landlordMunicipality: existingLease.landlord_municipality,
        landlordPostalCode: existingLease.landlord_postal_code,
        landlordTelephone: existingLease.landlord_telephone,
        landlordCellPhone: existingLease.landlord_cell_phone,
        landlordEmail: existingLease.landlord_email,
        landlordRepresentative: existingLease.landlord_representative,
        
        secondLandlordName: existingLease.second_landlord_name || "",
        secondLandlordStreetNumber: existingLease.second_landlord_street_number || "",
        secondLandlordStreetName: existingLease.second_landlord_street_name || "",
        secondLandlordApartment: existingLease.second_landlord_apartment || "",
        secondLandlordMunicipality: existingLease.second_landlord_municipality || "",
        secondLandlordPostalCode: existingLease.second_landlord_postal_code || "",
        secondLandlordTelephone: existingLease.second_landlord_telephone || "",
        secondLandlordCellPhone: existingLease.second_landlord_cell_phone || "",
        secondLandlordEmail: existingLease.second_landlord_email || "",
        
        tenantName: existingLease.tenant_name || "",
        tenantStreetNumber: existingLease.tenant_street_number || "",
        tenantStreetName: existingLease.tenant_street_name || "",
        tenantApartment: existingLease.tenant_apartment || "",
        tenantMunicipality: existingLease.tenant_municipality || "",
        tenantPostalCode: existingLease.tenant_postal_code || "",
        tenantTelephone: existingLease.tenant_telephone || "",
        tenantCellPhone: existingLease.tenant_cell_phone || "",
        tenantEmail: existingLease.tenant_email || "",
        
        secondTenantId: existingLease.second_tenant_id || "",
        secondTenantName: existingLease.second_tenant_name || "",
        secondTenantStreetNumber: existingLease.second_tenant_street_number || "",
        secondTenantStreetName: existingLease.second_tenant_street_name || "",
        secondTenantApartment: existingLease.second_tenant_apartment || "",
        secondTenantMunicipality: existingLease.second_tenant_municipality || "",
        secondTenantPostalCode: existingLease.second_tenant_postal_code || "",
        secondTenantTelephone: existingLease.second_tenant_telephone || "",
        secondTenantCellPhone: existingLease.second_tenant_cell_phone || "",
        secondTenantEmail: existingLease.second_tenant_email || "",
        
        dwellingAddress: existingLease.dwelling_address,
        dwellingStreetNumber: existingLease.dwelling_street_number || "",
        dwellingStreet: existingLease.dwelling_street || "",
        dwellingApt: existingLease.dwelling_apt || "",
        dwellingMunicipality: existingLease.dwelling_municipality || "",
        dwellingZipcode: existingLease.dwelling_zipcode || "",
        numberOfRooms: existingLease.number_of_rooms,
        purpose: existingLease.purpose,
        residentialPurposeOnly: existingLease.purpose === "residential",
        mixedPurposeTypes: parsedMixedPurposeTypes,
        isCondominium: existingLease.is_condominium,
        
        hasOutdoorParking: existingLease.outdoor_parking_spaces > 0, 
        outdoorParkingSpaces: existingLease.outdoor_parking_spaces,
        outdoorParkingLocation: existingLease.outdoor_parking_location,
        
        hasIndoorParking: existingLease.indoor_parking_spaces > 0,
        indoorParkingSpaces: existingLease.indoor_parking_spaces,
        indoorParkingLocation: existingLease.indoor_parking_location,
        
        storageDetails: existingLease.storage_details,
        otherAccessories: existingLease.other_accessories,
        furnitureIncluded: existingLease.furniture_included,
        appliances: parsedAppliances,
        furniture: parsedFurniture,
        otherFurnishings: existingLease.other_furnishings,
        smokeDetectorAcknowledged: existingLease.smoke_detector_acknowledged,
        
        leaseType: leaseType,
        durationValue: existingLease.duration_value,
        durationUnit: durationUnit,
        startDate: existingLease.start_date,
        endDate: existingLease.end_date,
        
        baseRent: existingLease.base_rent,
        servicesCost: existingLease.services_cost,
        totalRent: existingLease.total_rent,
        rentFrequency: rentFrequency,
        subsidyProgram: existingLease.subsidy_program,
        subsidyProgramDetails: subsidyProgramDetails,
        firstPaymentDate: existingLease.first_payment_date,
        paymentDay: existingLease.payment_day,
        paymentMethod: existingLease.payment_method,
        postdatedChecks: existingLease.postdated_checks,
        paymentLocation: existingLease.payment_location,
        
        buildingRegulationsDate: existingLease.building_regulations_date,
        buildingRegulationsAcknowledged: existingLease.building_regulations_acknowledged,
        condominiumRegulationsProvided: existingLease.condominium_regulations_provided,
        condominiumRegulationsDate: existingLease.condominium_regulations_date || "",
        repairsBeforeDelivery: existingLease.repairs_before_delivery,
        repairsDuringLease: existingLease.repairs_during_lease,
        superintendentName: existingLease.superintendent_name || "",
        superintendentPhone: existingLease.superintendent_phone || "",
        superintendentEmail: existingLease.superintendent_email || "",
        superintendentOtherPhone: existingLease.superintendent_other_phone || "",
        serviceResponsibilities: parsedServiceResponsibilities,
        accessToLand: existingLease.access_to_land,
        animalsAllowed: existingLease.animals_allowed,
        otherConditions: existingLease.other_conditions,
        
        propertyBuiltLast5Years: existingLease.property_built_last_5_years,
        propertyBuiltDate: existingLease.property_built_date,
        propertyConvertedLast5Years: existingLease.property_converted_last_5_years,
        propertyConvertedDate: existingLease.property_converted_date,
        
        previousLowestRent: existingLease.previous_lowest_rent,
        samePropertyServices: existingLease.same_property_services,
        propertyModifications: existingLease.property_modifications,
        
        jointTenantLiability: existingLease.joint_tenant_liability,
        otherSignatories: parsedOtherSignatories,
        familyResidenceDeclaration: existingLease.family_residence_declaration,
        spouseName: existingLease.spouse_name,
        familyResidenceNotes: familyResidenceNotes,
        heatingSourceType: heatingSourceType,
      });
      
      if (existingLease.property_id) {
        handlePropertyChange(existingLease.property_id);
      }
    }
  }, [existingLease, isLoadingLease]);

  const handleBack = () => {
    navigate(`/tenants/${tenantId}`);
  };

  const handleSaveDraft = () => {
    handleSave(formData, "draft");
  };

  const handleFinalize = () => {
    handleSave(formData, "active");
  };

  if (isTenantLoading || (leaseId && isLoadingLease)) {
    return <div className="p-8 text-center">Loading information...</div>;
  }

  if (tenantError || !tenant) {
    return (
      <div className="p-8">
        <div className="text-center text-red-500 mb-4">
          Error loading tenant information. Please try again.
        </div>
        <div className="text-center">
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <LeaseHeader 
        tenant={tenant as Tenant}
        isSaving={isSaving}
        onBack={handleBack}
        onSave={handleSaveDraft}
        onFinalize={handleFinalize}
        isEditingExisting={!!leaseId}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center">
              Lease Agreement 
            </CardTitle>
            
            <LeasePropertySelection
              properties={properties}
              units={units}
              selectedPropertyId={selectedPropertyId}
              isPropertiesLoading={isPropertiesLoading}
              isUnitsLoading={isUnitsLoading}
              onPropertyChange={handlePropertyChange}
              onUnitChange={handleUnitChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <LeaseTabsNavigation
            activeTab={activeTab}
            formData={formData}
            tenant={tenant as Tenant}
            selectedPropertyId={selectedPropertyId}
            onTabChange={handleTabChange}
            onFormChange={handleFormChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
