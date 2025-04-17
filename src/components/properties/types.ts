
// Check if this file exists, if not create it
export type PropertyType = 
  | 'residential' 
  | 'commercial' 
  | 'industrial' 
  | 'mixed_use'
  | 'land'
  | 'special_purpose';

export type PrimaryClassification = 
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'land';

export const PRIMARY_CLASSIFICATIONS: PrimaryClassification[] = [
  'residential',
  'commercial',
  'industrial',
  'land'
];

export const SECONDARY_CLASSIFICATIONS: Record<PrimaryClassification, string[]> = {
  residential: ['single_family', 'duplex', 'triplex', 'quadplex', 'multi_family', 'condo', 'apartment_building', 'townhouse', 'mobile_home'],
  commercial: ['office', 'retail', 'shopping_center', 'hotel', 'restaurant', 'warehouse', 'self_storage'],
  industrial: ['manufacturing', 'warehouse', 'flex_space', 'research_development'],
  land: ['residential_lot', 'commercial_lot', 'industrial_lot', 'agricultural', 'recreational']
};

export const PROPERTY_TYPES = [
  'residential',
  'commercial',
  'industrial',
  'mixed_use',
  'land',
  'special_purpose'
];

export interface PropertyFormData {
  name: string;
  street_number: string;
  street_name: string;
  apartment_unit?: string;
  municipality: string;
  province?: string;
  postal_code?: string;
  country?: string;
  type?: PropertyType;
  primary_classification?: PrimaryClassification;
  secondary_classification?: string;
  year_built?: string;
  year_occupied?: string;
  total_units?: number;
  occupied_units?: number;
  status?: 'active' | 'inactive' | 'pending';
  latitude?: string;
  longitude?: string;
}
