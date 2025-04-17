
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "./PasswordField";
import { RoleSelect } from "./RoleSelect";
import { createUserSchema, CreateUserFormValues } from "../schemas/userSchema";
import { DialogFooter } from "@/components/ui/dialog";

export interface UserFormProps {
  onSubmit: (values: CreateUserFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  defaultValues?: Partial<CreateUserFormValues>;
  submitButtonText?: string;
}

export function UserForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  disabled = false, 
  defaultValues,
  submitButtonText = "Create User"
}: UserFormProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      password: defaultValues?.password || "",
      role: defaultValues?.role || "property_manager", // Default to property_manager
    },
  });

  // Reset form when dialog is closed
  useEffect(() => {
    return () => {
      form.reset();
    };
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PasswordField form={form} disabled={disabled} />
        <RoleSelect form={form} disabled={disabled} />
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
          <Button type="submit" disabled={isSubmitting || disabled}>
            {isSubmitting ? "Creating..." : submitButtonText}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
