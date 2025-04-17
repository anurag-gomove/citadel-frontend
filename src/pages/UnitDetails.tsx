
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropertyUnitDetails from "@/components/property/PropertyUnitDetails";

export default function UnitDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(`/properties/${propertyId}?tab=units`);
  };

  return (
    <div className="container py-6">
      <PropertyUnitDetails onBack={handleBack} />
    </div>
  );
}
