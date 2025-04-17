
import { Input } from "@/components/ui/input";
import { forwardRef, useState, useEffect } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  displayValue?: string;
  startIcon?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, className, type, displayValue, startIcon, onChange, value, ...props }, ref) => {
    // For controlled inputs, use local state to manage the display value
    const [inputValue, setInputValue] = useState(value?.toString() || '');
    
    // Update local state when value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value.toString());
      }
    }, [value]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Update local state for immediate visual feedback
      setInputValue(e.target.value);
      
      // Call parent onChange handler with the original event
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">{startIcon}</span>
            </div>
          )}
          <Input
            ref={ref}
            type={type}
            className={`${error ? "border-red-500" : ""} ${startIcon ? "pl-7" : ""} ${className || ""}`}
            {...props}
            value={inputValue}
            onChange={handleChange}
          />
          {displayValue && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{displayValue}</span>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
