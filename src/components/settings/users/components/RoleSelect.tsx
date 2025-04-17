
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateUserFormValues } from "../schemas/userSchema";

interface RoleSelectProps {
  form: UseFormReturn<CreateUserFormValues>;
  disabled?: boolean;
}

export function RoleSelect({ form, disabled = false }: RoleSelectProps) {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="property_manager">Property Manager</SelectItem>
              <SelectItem value="accounting">Accounting</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
