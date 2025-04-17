
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CreatePropertyForm } from "./properties/CreatePropertyForm";
import { PropertiesList } from "./properties/PropertiesList";
import { PropertyDetails } from "@/pages/PropertyDetails";
import UnitForm from "@/pages/UnitForm";

export const Properties = () => {
  return (
    <Routes>
      <Route path="/" element={<PropertiesList />} />
      <Route path="/new" element={<CreatePropertyForm />} />
      <Route path="/:id/edit" element={<CreatePropertyForm />} />
      <Route path="/:id" element={<PropertyDetails />} />
      <Route path="/:propertyId/units/new" element={<UnitForm />} />
      <Route path="/:propertyId/units/:unitId/edit" element={<UnitForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
