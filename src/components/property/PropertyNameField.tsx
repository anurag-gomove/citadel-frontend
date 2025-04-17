
import React from "react";
import { FormInput } from "@/components/FormInput";

interface PropertyNameFieldProps {
  name: string;
  onChange: (name: string) => void;
  disabled: boolean;
}

export function PropertyNameField({ name, onChange, disabled }: PropertyNameFieldProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FormInput
        label="Property Name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
      />
    </div>
  );
}
