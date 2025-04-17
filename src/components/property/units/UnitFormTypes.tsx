
import { z } from "zod";

// Define our comprehensive form schema
export const unitFormSchema = z.object({
  // Basic Unit Identification
  unit_number: z.string().min(1, { message: "Unit number is required" }),
  floor_number: z.string().optional(),
  unit_type: z.string().optional(),
  square_feet: z.string().optional(),
  
  // Physical Characteristics
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  other_rooms: z.string().optional(),
  has_balcony: z.boolean().default(false),
  balcony_size: z.string().optional(),
  has_storage: z.boolean().default(false),
  storage_location: z.string().optional(),
  storage_number: z.string().optional(),
  has_parking: z.boolean().default(false),
  parking_number: z.string().optional(),
  parking_location: z.string().optional(),
  parking_type: z.string().optional(),
  
  // Rental Terms
  expected_monthly_rent: z.string().optional(),
  actual_monthly_rent: z.string().optional(),
  rent_due_date: z.string().default("1"),
  payment_method: z.string().optional(),
  additional_fees: z.string().optional(),
  rent_increase_history: z.string().optional(),
  previous_tenant_rent: z.string().optional(),
  
  // Utilities and Services
  heating_included: z.boolean().default(false),
  heating_type: z.string().optional(),
  electricity_included: z.boolean().default(false),
  water_included: z.boolean().default(false),
  internet_included: z.boolean().default(false),
  hot_water_included: z.boolean().default(false),
  air_conditioning_included: z.boolean().default(false),
  air_conditioning_type: z.string().optional(),
  other_services: z.string().optional(),
  
  // Appliances and Furnishings
  has_refrigerator: z.boolean().default(false),
  refrigerator_owner: z.string().optional(),
  has_stove: z.boolean().default(false),
  stove_owner: z.string().optional(),
  has_dishwasher: z.boolean().default(false),
  dishwasher_owner: z.string().optional(),
  has_washer: z.boolean().default(false),
  washer_owner: z.string().optional(),
  has_dryer: z.boolean().default(false),
  dryer_owner: z.string().optional(),
  has_microwave: z.boolean().default(false),
  microwave_owner: z.string().optional(),
  furniture_list: z.string().optional(),
  fixtures_inventory: z.string().optional(),
  
  // Access Details
  keys_provided: z.string().optional(),
  mailbox_number: z.string().optional(),
  entry_system_info: z.string().optional(),
  parking_spot_numbers: z.string().optional(),
  storage_locker_number: z.string().optional(),
  
  // Unit Condition
  last_renovation_date: z.string().optional(),
  condition_report: z.string().optional(),
  known_defects: z.string().optional(),
  maintenance_requirements: z.string().optional(),
  
  // Lease Restrictions
  unit_restrictions: z.string().optional(),
  pet_policy: z.string().optional(),
  smoking_policy: z.string().optional(),
  subletting_policy: z.string().optional(),
  
  // Additional Lease Terms
  lease_length: z.string().optional(),
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  renewal_terms: z.string().optional(),
  special_conditions: z.string().optional(),
  
  // Tenant assignment (for edit mode)
  tenant_id: z.string().optional(),
  
  // Tenant move-in date
  move_in_date: z.string().optional(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;
