
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { UnitFormTabs } from "@/components/property/units/UnitFormTabs";
import { UnitBasicInfoTab } from "@/components/property/units/UnitBasicInfoTab";
import { UnitRentalTab } from "@/components/property/units/UnitRentalTab";
import { UnitOtherInfoTab } from "@/components/property/units/UnitOtherInfoTab";
import { UnitParkingStorageTab } from "@/components/property/units/UnitParkingStorageTab";
import { UnitFurnitureAppliancesTab } from "@/components/property/units/UnitFurnitureAppliancesTab";
import { useUnitForm } from "@/hooks/useUnitForm";
import { UnitFormHeader } from "@/components/property/units/UnitFormHeader";

const UnitForm = () => {
  const { propertyId = "", unitId = "" } = useParams<{ propertyId: string; unitId: string }>();
  const [activeTab, setActiveTab] = useState("basic-info");
  
  const {
    isEditMode,
    isSubmitting,
    isUnitLoading,
    isTenantsLoading,
    selectedUnit,
    availableTenants,
    methods,
    handleSubmit,
    handleFieldChange
  } = useUnitForm({
    propertyId,
    unitId
  });

  // Debug the form state
  console.log("Form values:", methods.getValues());

  return (
    <div className="container mx-auto py-6 space-y-6">
      <UnitFormHeader 
        propertyId={propertyId}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        onSubmit={methods.handleSubmit(handleSubmit)}
      />

      <Card>
        <CardContent className="p-6">
          {isUnitLoading ? (
            <div className="flex justify-center p-4">Loading unit data...</div>
          ) : (
            <FormProvider {...methods}>
              <UnitFormTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                basicInfoContent={
                  <UnitBasicInfoTab
                    formState={methods.getValues()}
                    onChange={handleFieldChange}
                    selectedUnit={selectedUnit}
                  />
                }
                parkingStorageContent={
                  <UnitParkingStorageTab
                    formState={methods.getValues()}
                    onChange={handleFieldChange}
                    selectedUnit={selectedUnit}
                  />
                }
                furnitureAppliancesContent={
                  <UnitFurnitureAppliancesTab
                    formState={methods.getValues()}
                    onChange={handleFieldChange}
                    selectedUnit={selectedUnit}
                  />
                }
                rentalContent={
                  <UnitRentalTab
                    formState={methods.getValues()}
                    onChange={handleFieldChange}
                    availableTenants={availableTenants}
                    isTenantsLoading={isTenantsLoading}
                  />
                }
                otherInfoContent={
                  <UnitOtherInfoTab
                    formState={methods.getValues()}
                    onChange={handleFieldChange}
                  />
                }
              />
            </FormProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UnitForm;
