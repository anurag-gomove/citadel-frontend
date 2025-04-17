export type LeaseStatus = 'pending' | 'active' | 'inactive';
export type ApplicationStatus = 'not_sent' | 'sent' | 'received' | 'under_review' | 'approved' | 'rejected';

export interface Tenant {
  id: string;
  organization_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  other_phone?: string;
  status: 'active' | 'inactive';
  lease_status: LeaseStatus;
  credit_score?: number;
  previous_address?: string;
  street_number?: string;
  street_name?: string;
  apartment?: string;
  city?: string;
  zipcode?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  property_id?: string;
  unit_id?: string;
  unit_number?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  preferred_language?: string;
  application_status?: ApplicationStatus;
  application_sent_date?: string;
  application_received_date?: string;
  application_reviewed_date?: string;
  created_at?: string;
  updated_at?: string;
  can_send_new_application?: boolean;
  property_name?: string;
}

export interface PropertyOwner {
  id?: string;
  property_id: string;
  full_name: string;
  street_number?: string;
  street_name?: string;
  apartment?: string;
  city?: string;
  zipcode?: string;
  phone?: string;
  other_phone?: string;
  email?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DurationUnit = 'weeks' | 'months' | 'years';
export type RentFrequency = 'monthly' | 'weekly';

export interface ServiceResponsibilities {
  heating: 'landlord' | 'tenant';
  gas: 'landlord' | 'tenant';
  electricity: 'landlord' | 'tenant';
  waterHeaterRental: 'landlord' | 'tenant';
  hotWater: 'landlord' | 'tenant';
  waterTax: 'landlord' | 'tenant';
  snowRemovalParking: 'landlord' | 'tenant';
  snowRemovalBalcony: 'landlord' | 'tenant';
  snowRemovalEntrance: 'landlord' | 'tenant';
  snowRemovalWalkway: 'landlord' | 'tenant';
  snowRemovalStairs: 'landlord' | 'tenant';
}

export interface Appliance {
  stove: boolean;
  microwave: boolean;
  dishwasher: boolean;
  refrigerator: boolean;
  washer: boolean;
  dryer: boolean;
}

export interface Furniture {
  tables: boolean;
  chairs: boolean;
  dresser: boolean;
  sofa: boolean;
  armchair: boolean;
  bedWithSize: string;
  other: string;
}

export interface OtherSignatory {
  name: string;
  title: string;
  address: string;
}

export type LeaseType = 'fixed' | 'indeterminate';
export type LeaseDocumentStatus = 'draft' | 'active' | 'expired' | 'terminated';

export interface Lease {
  id?: string;
  tenantId: string;
  propertyId?: string;
  unitId?: string;
  unitNumber?: string;
  
  // Section A: Landlord Information
  landlordName: string;
  landlordAddress: string;
  landlordMunicipality: string;
  landlordPostalCode: string;
  landlordTelephone: string;
  landlordCellPhone: string;
  landlordEmail: string;
  landlordRepresentative: string;
  
  // Section B: Dwelling Description
  dwellingAddress: string;
  numberOfRooms: number;
  purpose: string;
  isCondominium: boolean;
  outdoorParkingSpaces: number;
  outdoorParkingLocation: string;
  indoorParkingSpaces: number;
  indoorParkingLocation: string;
  storageDetails: string;
  otherAccessories: string;
  furnitureIncluded: boolean;
  appliances: Appliance;
  furniture: Furniture;
  otherFurnishings: string;
  smokeDetectorAcknowledged: boolean;
  
  // Section C: Lease Term
  leaseType: LeaseType;
  durationValue: number;
  durationUnit: DurationUnit;
  startDate: string;
  endDate?: string;
  
  // Section D: Rent
  baseRent: number;
  servicesCost: number;
  totalRent: number;
  rentFrequency: RentFrequency;
  subsidyProgram: boolean;
  subsidyProgramDetails?: string;
  firstPaymentDate: string;
  paymentDay: number;
  paymentMethod: string;
  postdatedChecks: boolean;
  paymentLocation: string;
  
  // Section E: Services and Conditions
  buildingRegulationsDate: string;
  buildingRegulationsAcknowledged: boolean;
  condominiumRegulationsProvided: boolean;
  repairsBeforeDelivery: string;
  repairsDuringLease: string;
  superintendentContact: string;
  serviceResponsibilities: ServiceResponsibilities;
  accessToLand: boolean;
  animalsAllowed: boolean;
  otherConditions: string;
  
  // Section F: Rent Setting Restrictions
  propertyBuiltLast5Years: boolean;
  propertyBuiltDate?: string;
  propertyConvertedLast5Years: boolean;
  propertyConvertedDate?: string;
  
  // Section G: New Tenant Notice
  previousLowestRent: number;
  samePropertyServices: boolean;
  propertyModifications: string;
  
  // Section H & I: Signatures and Declarations
  jointTenantLiability: boolean;
  otherSignatories: OtherSignatory[];
  familyResidenceDeclaration: boolean;
  spouseName: string;
  familyResidenceNotes?: string;
  
  // Status
  status: LeaseDocumentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantApplication {
    id: string;
    tenant_id: string;
    application_type: string;
    status: string;
    sent_date?: string;
    received_date?: string;
    reviewed_date?: string;
    approved_date?: string;
    rejected_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Property {
  id: string;
  name: string;
  organization_id: string;
  owner_id: string;
  address: string;
  type: string;
  primary_classification?: string;
  secondary_classification?: string;
  status: 'active' | 'inactive' | 'pending';
  image_url?: string;
  street_address?: string;
  apartment_unit?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  year_built?: number;
  year_occupied?: number;
  total_units?: number;
  occupied_units?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  actual_income?: number;
  state?: string;
}

export interface Unit {
  id: string;
  property_id: string;
  organization_id?: string;
  unit_number: string;
  status: 'vacant' | 'occupied' | 'maintenance' | 'unavailable';
  tenant_id?: string;
  unit_type?: string;
  floor_number?: number;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  monthly_rent?: number;
  rent_due_date?: number;
  other_rooms?: string;
  has_balcony?: boolean;
  balcony_size?: string;
  has_storage?: boolean;
  storage_location?: string;
  storage_number?: string;
  has_parking?: boolean;
  parking_number?: string;
  parking_location?: string;
  parking_type?: string;
  payment_method?: string;
  additional_fees?: string;
  rent_increase_history?: string;
  previous_tenant_rent?: string;
  heating_included?: boolean;
  heating_type?: string;
  electricity_included?: boolean;
  water_included?: boolean;
  internet_included?: boolean;
  hot_water_included?: boolean;
  air_conditioning_included?: boolean;
  air_conditioning_type?: string;
  other_services?: string;
  has_refrigerator?: boolean;
  refrigerator_owner?: string;
  has_stove?: boolean;
  stove_owner?: string;
  has_dishwasher?: boolean;
  dishwasher_owner?: string;
  has_washer?: boolean;
  washer_owner?: string;
  has_dryer?: boolean;
  dryer_owner?: string;
  has_microwave?: boolean;
  microwave_owner?: string;
  furniture_list?: string;
  fixtures_inventory?: string;
  keys_provided?: string;
  mailbox_number?: string;
  entry_system_info?: string;
  parking_spot_numbers?: string;
  storage_locker_number?: string;
  last_renovation_date?: string;
  condition_report?: string;
  known_defects?: string;
  maintenance_requirements?: string;
  unit_restrictions?: string;
  pet_policy?: string;
  smoking_policy?: string;
  subletting_policy?: string;
  lease_length?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  renewal_terms?: string;
  special_conditions?: string;
  move_in_date?: string;
  created_at?: string;
  updated_at?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'late' | 'overdue' | 'cancelled';

export interface PropertyBill {
  id: string;
  property_id: string;
  amount: number;
  due_date: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  description: string;
  status: string;
  attachment_url?: string;
  paid?: boolean;
}

export interface UnitPayment {
  id: string;
  unit_id?: string;
  property_id?: string;
  expected_amount: number;
  paid_amount: number;
  balance_due: number;
  due_date: string;
  payment_date?: string;
  payment_status: PaymentStatus;
  payment_method?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  unit_id?: string;
  tenant_id?: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  assigned_to?: string;
  due_date?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrder {
  id: string;
  property_id: string;
  unit_number: string;
  type: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  assigned_to?: string;
  due_date?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRoleType = 'super_admin' | 'admin' | 'property_manager' | 'maintenance' | 'tenant';

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  mobile_phone?: string;
  location?: string;
  language?: 'en' | 'fr';
  theme?: 'light' | 'dark';
  organization_id?: string;
  status?: 'active' | 'inactive';
  role?: UserRoleType;
  is_superadmin?: boolean;
  created_at?: string;
  updated_at?: string;
}
