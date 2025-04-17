import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UnitFormProps {
  propertyId: string;
  unitId?: string;
  isEditMode?: boolean;
}

export function useUnitForm({ propertyId, unitId, isEditMode }: UnitFormProps) {
  const [formData, setFormData] = useState<any>({
    propertyId,
    unitNumber: "",
    status: "vacant",
    unitType: "",
    floorNumber: "",
    squareFeet: "",
    bedrooms: "",
    bathrooms: "",
    otherRooms: "",
    monthlyRent: "",
    rentDueDate: 1,
    hasBalcony: false,
    balconySize: "",
    hasStorage: false,
    storageLocation: "",
    storageNumber: "",
    hasParking: false,
    parkingNumber: "",
    parkingLocation: "",
    parkingType: "",
    heatingIncluded: false,
    heatingType: "",
    electricityIncluded: false,
    waterIncluded: false,
    internetIncluded: false,
    hotWaterIncluded: false,
    airConditioningIncluded: false,
    airConditioningType: "",
    otherServices: "",
    paymentMethod: "",
    additionalFees: "",
    hasRefrigerator: false,
    refrigeratorOwner: "landlord",
    hasStove: false,
    stoveOwner: "landlord",
    hasDishwasher: false,
    dishwasherOwner: "landlord",
    hasWasher: false,
    washerOwner: "landlord",
    hasDryer: false,
    dryerOwner: "landlord",
    hasMicrowave: false,
    microwaveOwner: "landlord",
    furnitureList: "",
    fixturesInventory: "",
    keysProvided: "",
    mailboxNumber: "",
    entrySystemInfo: "",
    parkingSpotNumbers: "",
    storageLockerNumber: "",
    lastRenovationDate: "",
    conditionReport: "",
    knownDefects: "",
    maintenanceRequirements: "",
    unitRestrictions: "",
    petPolicy: "",
    smokingPolicy: "",
    sublettingPolicy: "",
    leaseLength: "",
    leaseStartDate: "",
    leaseEndDate: "",
    renewalTerms: "",
    specialConditions: "",
    residentialPurposeOnly: true,
    mixedPurposeTypes: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");

  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const formatDataForDb = useCallback((data: any) => {
    return {
      property_id: data.propertyId,
      unit_number: data.unitNumber,
      status: data.status,
      unit_type: data.unitType,
      floor_number: data.floorNumber ? parseInt(data.floorNumber) : null,
      square_feet: data.squareFeet ? parseInt(data.squareFeet) : null,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : null,
      other_rooms: data.otherRooms,
      monthly_rent: data.monthlyRent ? parseFloat(data.monthlyRent) : null,
      rent_due_date: data.rentDueDate ? parseInt(data.rentDueDate) : 1,
      has_balcony: data.hasBalcony,
      balcony_size: data.balconySize,
      has_storage: data.hasStorage,
      storage_location: data.storageLocation,
      storage_number: data.storageNumber,
      has_parking: data.hasParking,
      parking_number: data.parkingNumber,
      parking_location: data.parkingLocation,
      parking_type: data.parkingType,
      heating_included: data.heatingIncluded,
      heating_type: data.heatingType,
      electricity_included: data.electricityIncluded,
      water_included: data.waterIncluded,
      internet_included: data.internetIncluded,
      hot_water_included: data.hotWaterIncluded,
      air_conditioning_included: data.airConditioningIncluded,
      air_conditioning_type: data.airConditioningType,
      other_services: data.otherServices,
      payment_method: data.paymentMethod,
      additional_fees: data.additionalFees,
      has_refrigerator: data.hasRefrigerator,
      refrigerator_owner: data.refrigeratorOwner,
      has_stove: data.hasStove,
      stove_owner: data.stoveOwner,
      has_dishwasher: data.hasDishwasher,
      dishwasher_owner: data.dishwasherOwner,
      has_washer: data.hasWasher,
      washer_owner: data.washerOwner,
      has_dryer: data.hasDryer,
      dryer_owner: data.dryerOwner,
      has_microwave: data.hasMicrowave,
      microwave_owner: data.microwaveOwner,
      furniture_list: data.furnitureList,
      fixtures_inventory: data.fixturesInventory,
      keys_provided: data.keysProvided,
      mailbox_number: data.mailboxNumber,
      entry_system_info: data.entrySystemInfo,
      parking_spot_numbers: data.parkingSpotNumbers,
      storage_locker_number: data.storageLockerNumber,
      last_renovation_date: data.lastRenovationDate,
      condition_report: data.conditionReport,
      known_defects: data.knownDefects,
      maintenance_requirements: data.maintenanceRequirements,
      unit_restrictions: data.unitRestrictions,
      pet_policy: data.petPolicy,
      smoking_policy: data.smokingPolicy,
      subletting_policy: data.sublettingPolicy,
      lease_length: data.leaseLength,
      lease_start_date: data.leaseStartDate,
      lease_end_date: data.leaseEndDate,
      renewal_terms: data.renewalTerms,
      special_conditions: data.specialConditions,
      residential_purpose_only: data.residentialPurposeOnly,
      mixed_purpose_types: data.mixedPurposeTypes || []
    };
  }, []);

  // Load Unit Data for Edit Mode
  useEffect(() => {
    const loadUnit = async () => {
      if (isEditMode && unitId) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("units")
            .select("*")
            .eq("id", unitId)
            .single();

          if (error) throw error;

          if (data) {
            // This fixes the TS errors by ensuring we're handling the data correctly
            let mixedPurposeTypes: string[] = [];
            if (data.mixed_purpose_types && Array.isArray(data.mixed_purpose_types)) {
              mixedPurposeTypes = data.mixed_purpose_types as string[];
            }

            setFormData({
              propertyId: data.property_id || propertyId,
              unitNumber: data.unit_number || "",
              status: data.status || "vacant",
              unitType: data.unit_type || "",
              floorNumber: data.floor_number?.toString() || "",
              squareFeet: data.square_feet?.toString() || "",
              bedrooms: data.bedrooms?.toString() || "",
              bathrooms: data.bathrooms?.toString() || "",
              otherRooms: data.other_rooms || "",
              monthlyRent: data.monthly_rent?.toString() || "",
              rentDueDate: data.rent_due_date || 1,
              hasBalcony: data.has_balcony || false,
              balconySize: data.balcony_size || "",
              hasStorage: data.has_storage || false,
              storageLocation: data.storage_location || "",
              storageNumber: data.storage_number || "",
              hasParking: data.has_parking || false,
              parkingNumber: data.parking_number || "",
              parkingLocation: data.parking_location || "",
              parkingType: data.parking_type || "",
              heatingIncluded: data.heating_included || false,
              heatingType: data.heating_type || "",
              electricityIncluded: data.electricity_included || false,
              waterIncluded: data.water_included || false,
              internetIncluded: data.internet_included || false,
              hotWaterIncluded: data.hot_water_included || false,
              airConditioningIncluded: data.air_conditioning_included || false,
              airConditioningType: data.air_conditioning_type || "",
              otherServices: data.other_services || "",
              paymentMethod: data.payment_method || "",
              additionalFees: data.additional_fees || "",
              hasRefrigerator: data.has_refrigerator || false,
              refrigeratorOwner: data.refrigerator_owner || "landlord",
              hasStove: data.has_stove || false,
              stoveOwner: data.stove_owner || "landlord",
              hasDishwasher: data.has_dishwasher || false,
              dishwasherOwner: data.dishwasher_owner || "landlord",
              hasWasher: data.has_washer || false,
              washerOwner: data.washer_owner || "landlord",
              hasDryer: data.has_dryer || false,
              dryerOwner: data.dryer_owner || "landlord",
              hasMicrowave: data.has_microwave || false,
              microwaveOwner: data.microwave_owner || "landlord",
              furnitureList: data.furniture_list || "",
              fixturesInventory: data.fixtures_inventory || "",
              keysProvided: data.keys_provided || "",
              mailboxNumber: data.mailbox_number || "",
              entrySystemInfo: data.entry_system_info || "",
              parkingSpotNumbers: data.parking_spot_numbers || "",
              storageLockerNumber: data.storage_locker_number || "",
              lastRenovationDate: data.last_renovation_date || "",
              conditionReport: data.condition_report || "",
              knownDefects: data.known_defects || "",
              maintenanceRequirements: data.maintenance_requirements || "",
              unitRestrictions: data.unit_restrictions || "",
              petPolicy: data.pet_policy || "",
              smokingPolicy: data.smoking_policy || "",
              sublettingPolicy: data.subletting_policy || "",
              leaseLength: data.lease_length || "",
              leaseStartDate: data.lease_start_date || "",
              leaseEndDate: data.lease_end_date || "",
              renewalTerms: data.renewal_terms || "",
              specialConditions: data.special_conditions || "",
              residentialPurposeOnly: data.residential_purpose_only ?? true,
              mixedPurposeTypes: mixedPurposeTypes
            });
          }
        } catch (error) {
          console.error("Error loading unit:", error);
          toast.error("Failed to load unit data");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUnit();
  }, [isEditMode, unitId, propertyId]);

  const saveUnit = async (): Promise<string | null> => {
    try {
      setIsSaving(true);
      const dbData = formatDataForDb(formData);

      let result;
      if (isEditMode && unitId) {
        const { data, error } = await supabase
          .from("units")
          .update(dbData)
          .eq("id", unitId)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success("Unit updated successfully");
      } else {
        const { data, error } = await supabase
          .from("units")
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success("Unit created successfully");
      }

      setIsSaving(false);
      return result?.id || null;
    } catch (error: any) {
      console.error("Error saving unit:", error);
      toast.error("Failed to save unit: " + error.message);
      setIsSaving(false);
      return null;
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    saveUnit,
    isLoading,
    isSaving,
    activeTab,
    handleTabChange
  };
}
