
import * as z from "zod";

// Define the exact role types we want to allow
// Make sure these match the valid roles in the database
const userRoles = ['super_admin', 'property_manager', 'accounting', 'maintenance'] as const;

export const createUserSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  // Ensure we only allow our predefined roles
  role: z.enum(userRoles),
});

// Add a userSchema alias for backward compatibility
export const userSchema = createUserSchema;

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
