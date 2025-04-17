
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { CreateUserFormValues } from "../schemas/userSchema";

interface PasswordFieldProps {
  form: UseFormReturn<CreateUserFormValues>;
  disabled?: boolean;
}

export function PasswordField({ form, disabled = false }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={togglePasswordVisibility}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
