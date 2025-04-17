
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MixedPurposeType } from "@/types/lease";

export interface UseLeaseFormReturn {
  formData: any;
  handleSave: () => void;
  tenant?: any;
  properties?: any[];
  units?: any[];
  activeTab: string;
  selectedPropertyId: string | null;
  selectedUnitId: string | null;
  isTenantLoading?: boolean;
  isPropertiesLoading?: boolean;
  isUnitsLoading?: boolean;
  tenantError?: any;
  handlePropertyChange: (propertyId: string) => void;
  handleUnitChange: (unitId: string) => void;
  handleFormChange: (field: string, value: any) => void;
  handleTabChange: (tab: string) => void;
  setFormData: (updater: any) => void;
}

export function useLeaseForm(tenantId: string): UseLeaseFormReturn {
  const navigate = useNavigate();
  const { leaseId } = useParams<{ leaseId: string }>();
  const isEditMode = !!leaseId && leaseId !== "new";

  const [formData, setFormDataState] = useState<any>({
    tenantId: tenantId,
    leaseType: "fixed",
    durationValue: 12,
    durationUnit: "months",
    serviceResponsibilities: {
      heating: "landlord",
      gas: "tenant",
      electricity: "tenant",
      waterHeaterRental: "landlord",
      hotWater: "landlord",
      waterTax: "landlord",
      snowRemovalParking: "landlord",
      snowRemovalBalcony: "tenant",
      snowRemovalEntrance: "landlord",
      snowRemovalWalkway: "landlord",
      snowRemovalStairs: "landlord",
    },
    appliances: {
      stove: false,
      microwave: false,
      dishwasher: false,
      refrigerator: false,
      washer: false,
      dryer: false,
    },
    furniture: {
      tables: false,
      chairs: false,
      dresser: false,
      sofa: false,
      armchair: false,
      bedWithSize: "",
      other: "",
    },
    otherSignatories: [],
    status: "draft",
    sectionA: {}, // Initialize sectionA to avoid undefined issues
    secondTenantName: "",
    secondTenantStreetNumber: "",
    secondTenantStreetName: "",
    secondTenantApartment: "",
    secondTenantMunicipality: "",
    secondTenantPostalCode: "",
    secondTenantTelephone: "",
    secondTenantCellPhone: "",
    secondTenantEmail: "",
  });

  const [activeTab, setActiveTab] = useState("property-selection");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [hasInitializedFromTenant, setHasInitializedFromTenant] = useState(false);
  const [hasInitializedFromProperty, setHasInitializedFromProperty] = useState(false);
  const [propertyOwnersLoaded, setPropertyOwnersLoaded] = useState(false);

  const setFormData = (updater: any) => {
    if (typeof updater === 'function') {
      setFormDataState(prevState => {
        console.log('Before update:', prevState);
        const newState = updater(prevState);
        console.log('After update:', newState);
        return newState;
      });
    } else {
      setFormDataState(prevState => {
        console.log('Before update:', prevState);
        const newState = { ...prevState, ...updater };
        console.log('After update:', newState);
        return newState;
      });
    }
  };

  // Query to get tenant data
  const {
    data: tenant,
    isLoading: isTenantLoading,
    error: tenantError,
  } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Query to get properties data
  const { data: properties = [], isLoading: isPropertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Query to get units data for selected property
  const { data: units = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["units", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("property_id", selectedPropertyId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPropertyId,
  });

  // Query to get property owners data for the selected property
  const { data: propertyOwners = [], isLoading: isPropertyOwnersLoading } = useQuery({
    queryKey: ["property_owners", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const { data, error } = await supabase
        .from("property_owners")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .order("is_primary", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPropertyId,
    onSuccess: (data) => {
      if (data && data.length > 0 && !propertyOwnersLoaded) {
        console.log("Property owners data loaded:", data);
        
        // Find primary and secondary owner
        const primaryOwner = data.find(owner => owner.is_primary) || data[0];
        const secondaryOwner = data.find(owner => !owner.is_primary && owner.id !== primaryOwner.id);
        
        // Update form data with primary owner information
        setFormData((prev: any) => ({
          ...prev,
          landlordName: primaryOwner.full_name,
          landlordStreetNumber: primaryOwner.street_number || "",
          landlordStreetName: primaryOwner.street_name || "",
          landlordApartment: primaryOwner.apartment || "",
          landlordMunicipality: primaryOwner.city || "",
          landlordPostalCode: primaryOwner.zipcode || "",
          landlordTelephone: primaryOwner.phone || "",
          landlordCellPhone: primaryOwner.other_phone || "",
          landlordEmail: primaryOwner.email || "",
          
          // If there's a secondary owner, populate those fields too
          ...(secondaryOwner ? {
            secondLandlordName: secondaryOwner.full_name,
            secondLandlordStreetNumber: secondaryOwner.street_number || "",
            secondLandlordStreetName: secondaryOwner.street_name || "",
            secondLandlordApartment: secondaryOwner.apartment || "",
            secondLandlordMunicipality: secondaryOwner.city || "",
            secondLandlordPostalCode: secondaryOwner.zipcode || "",
            secondLandlordTelephone: secondaryOwner.phone || "",
            secondLandlordCellPhone: secondaryOwner.other_phone || "",
            secondLandlordEmail: secondaryOwner.email || "",
          } : {}),
        }));
        
        setPropertyOwnersLoaded(true);
      }
    }
  });

  // Query to get lease data for edit mode
  const { data: leaseData, isLoading: isLeaseLoading } = useQuery({
    queryKey: ["lease", leaseId],
    queryFn: async () => {
      if (!isEditMode) return null;
      const { data, error } = await supabase
        .from("leases")
        .select("*")
        .eq("id", leaseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (tenant && !hasInitializedFromTenant) {
      if (tenant.property_id) {
        console.log("Setting selectedPropertyId from tenant:", tenant.property_id);
        setSelectedPropertyId(tenant.property_id);
      }
      
      if (tenant.unit_id) {
        setSelectedUnitId(tenant.unit_id);
      }

      setFormData((prev: any) => ({
        ...prev,
        tenant_name: `${tenant.first_name} ${tenant.last_name}`,
        tenant_email: tenant.email,
        tenant_phone: tenant.phone,
        tenant_cell_phone: tenant.other_phone,
        tenant_street_number: tenant.street_number,
        tenant_street_name: tenant.street_name,
        tenant_apartment: tenant.apartment,
        tenant_municipality: tenant.city,
        tenant_postal_code: tenant.zipcode,
        tenantName: `${tenant.first_name} ${tenant.last_name}`,
        tenantEmail: tenant.email,
        tenantTelephone: tenant.phone,
        tenantCellPhone: tenant.other_phone,
        tenantStreetNumber: tenant.street_number,
        tenantStreetName: tenant.street_name,
        tenantApartment: tenant.apartment,
        tenantMunicipality: tenant.city,
        tenantPostalCode: tenant.zipcode,
      }));
      
      setHasInitializedFromTenant(true);
    }
  }, [tenant, hasInitializedFromTenant]);

  useEffect(() => {
    if (selectedPropertyId && properties.length > 0 && !hasInitializedFromProperty) {
      const property = properties.find((p: any) => p.id === selectedPropertyId);
      if (property) {
        console.log("Found property data:", property);
        setFormData((prev: any) => ({
          ...prev,
          property_id: property.id,
          landlord_street_number: property.street_number,
          landlord_street_name: property.street_name,
          landlord_apartment: property.apartment_unit,
          landlord_municipality: property.municipality,
          landlord_postal_code: property.postal_code,
          dwelling_street_number: property.street_number,
          dwelling_street: property.street_name,
          dwelling_municipality: property.municipality,
          dwelling_zipcode: property.postal_code,
        }));
        
        setHasInitializedFromProperty(true);
      }
    }
  }, [selectedPropertyId, properties, hasInitializedFromProperty]);

  useEffect(() => {
    if (selectedPropertyId) {
      // Reset the property owners loaded flag when property changes
      setPropertyOwnersLoaded(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    if (selectedUnitId && units.length > 0) {
      const unit = units.find((u: any) => u.id === selectedUnitId);
      if (unit) {
        let mixedPurposeTypes: MixedPurposeType[] = [];
        if (Array.isArray(unit.mixed_purpose_types)) {
          mixedPurposeTypes = unit.mixed_purpose_types as MixedPurposeType[];
        }

        setFormData((prev: any) => ({
          ...prev,
          unit_id: unit.id,
          unitNumber: unit.unit_number,
          baseRent: unit.monthly_rent,
          residentialpurposeonly: unit.residential_purpose_only,
          mixed_purpose_types: mixedPurposeTypes,
          numberOfRooms: 1 + Number(unit.bedrooms || 0),
          indoor_parking_spaces: unit.has_parking ? 1 : 0,
          indoor_parking_location: unit.parking_location,
          storage_details: unit.storage_location,
          appliances: {
            ...prev.appliances,
            stove: unit.has_stove,
            microwave: unit.has_microwave,
            dishwasher: unit.has_dishwasher,
            refrigerator: unit.has_refrigerator,
            washer: unit.has_washer,
            dryer: unit.has_dryer,
          }
        }));
      }
    }
  }, [selectedUnitId, units]);

  useEffect(() => {
    if (isEditMode && leaseData) {
      const normalizedLeaseData = JSON.parse(JSON.stringify(leaseData));
      setFormData(normalizedLeaseData);
      
      if (normalizedLeaseData.property_id) {
        setSelectedPropertyId(normalizedLeaseData.property_id);
      }
      
      if (normalizedLeaseData.unit_id) {
        setSelectedUnitId(normalizedLeaseData.unit_id);
      } else if (normalizedLeaseData.unitId) {
        setSelectedUnitId(normalizedLeaseData.unitId);
        
        setFormData((prev: any) => ({
          ...prev,
          unit_id: normalizedLeaseData.unitId
        }));
      }
    }
  }, [isEditMode, leaseData]);

  const handlePropertyChange = useCallback((propertyId: string) => {
    console.log("handlePropertyChange called with:", propertyId);
    setSelectedPropertyId(propertyId);
    setSelectedUnitId(null);
    setHasInitializedFromProperty(false);
    setPropertyOwnersLoaded(false); // Reset property owners loaded state
  }, []);

  const handleUnitChange = useCallback((unitId: string) => {
    setSelectedUnitId(unitId);
  }, []);

  const handleFormChange = useCallback((field: string, value: any) => {
    console.log(`Field changed: ${field} =`, value);
    setFormData((prev: any) => {
      if (field.includes('.')) {
        const [object, property] = field.split('.');
        return {
          ...prev,
          [object]: {
            ...(prev[object] || {}),
            [property]: value
          }
        };
      }
      
      return { ...prev, [field]: value };
    });
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleSave = async () => {
    try {
      console.log("Saving lease data:", formData);
      
      const payload = {
        ...formData,
        tenantId: tenantId,
      };

      const operation = isEditMode
        ? supabase.from("leases").update(payload).eq("id", leaseId)
        : supabase.from("leases").insert([payload]);

      const { data, error } = await operation;

      if (error) throw error;

      toast.success(isEditMode ? "Lease updated successfully" : "Lease created successfully");
      
      if (!isEditMode) {
        navigate(`/tenants/${tenantId}`);
      }
    } catch (error: any) {
      console.error("Error saving lease:", error);
      toast.error(`Error: ${error.message || "There was an error saving the lease."}`);
    }
  };

  return {
    formData,
    handleSave,
    tenant,
    properties,
    units,
    activeTab,
    selectedPropertyId,
    selectedUnitId,
    isTenantLoading,
    isPropertiesLoading,
    isUnitsLoading,
    tenantError,
    handlePropertyChange,
    handleUnitChange,
    handleFormChange,
    handleTabChange,
    setFormData,
  };
}
