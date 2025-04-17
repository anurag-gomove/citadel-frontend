
export type LeaseType = 'fixed' | 'indeterminate';
export type DurationUnit = 'weeks' | 'months' | 'years';
export type RentFrequency = 'monthly' | 'weekly';
export type LeaseStatus = 'draft' | 'active' | 'expired' | 'terminated';
export type MixedPurposeType = 'professional' | 'commercial' | 'industrial' | 'other';
export type HeatingSourceType = 'electricity' | 'gas' | 'oil' | 'other';

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
  tablesCount?: number;
  chairs: boolean;
  chairsCount?: number;
  dresser: boolean;
  dresserCount?: number;
  sofa: boolean;
  sofaCount?: number;
  armchair: boolean;
  armchairCount?: number;
  bed: boolean;
  bedCount?: number;
  bedWithSize: string;
  other: string;
}

export interface OtherSignatory {
  name: string;
  title: string;
  address: string;
}

export interface Lease {
  id?: string;
  tenantId: string;
  propertyId?: string;
  unitId?: string;
  unitNumber?: string;
  
  // Section A: Landlord Information
  landlordName: string;
  landlordStreetNumber: string;
  landlordStreetName: string;
  landlordApartment: string;
  landlordMunicipality: string;
  landlordPostalCode: string;
  landlordTelephone: string;
  landlordCellPhone: string;
  landlordEmail: string;
  landlordRepresentative: string;
  landlordAddress?: string; // Keeping for backward compatibility
  
  // Second landlord information
  secondLandlordName?: string;
  secondLandlordStreetNumber?: string;
  secondLandlordStreetName?: string;
  secondLandlordApartment?: string;
  secondLandlordMunicipality?: string;
  secondLandlordPostalCode?: string;
  secondLandlordTelephone?: string;
  secondLandlordCellPhone?: string;
  secondLandlordEmail?: string;
  
  // Tenant information (editable)
  tenantName?: string;
  tenantStreetNumber?: string;
  tenantStreetName?: string;
  tenantApartment?: string;
  tenantMunicipality?: string;
  tenantPostalCode?: string;
  tenantTelephone?: string;
  tenantCellPhone?: string;
  tenantEmail?: string;
  
  // Second tenant information
  secondTenantId?: string;
  secondTenantName?: string;
  secondTenantStreetNumber?: string;
  secondTenantStreetName?: string;
  secondTenantApartment?: string;
  secondTenantMunicipality?: string;
  secondTenantPostalCode?: string;
  secondTenantTelephone?: string;
  secondTenantCellPhone?: string;
  secondTenantEmail?: string;
  
  // Section B: Dwelling Description
  dwellingAddress: string;
  dwellingStreetNumber: string;
  dwellingStreet: string;
  dwellingApt: string;
  dwellingMunicipality: string;
  dwellingZipcode: string;
  numberOfRooms: number;
  residentialPurposeOnly: boolean;
  purpose: string;
  mixedPurposeTypes?: MixedPurposeType[];
  isCondominium: boolean;
  // Parking
  hasOutdoorParking?: boolean;
  outdoorParkingSpaces?: number;
  outdoorParkingLocation?: string;
  hasIndoorParking?: boolean;
  indoorParkingSpaces?: number;
  indoorParkingLocation?: string;
  // Storage and accessories
  storageDetails?: string;
  otherAccessories?: string;
  furnitureIncluded?: boolean;
  appliances?: Appliance;
  furniture?: Furniture;
  otherFurnishings?: string;
  smokeDetectorAcknowledged?: boolean;
  
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
  subsidyProgramDetails?: string; // Added this field for subsidy program details
  firstPaymentDate: string;
  paymentDay: number;
  paymentMethod: string;
  postdatedChecks: boolean;
  paymentLocation: string;
  
  // Section E: Services and Conditions
  buildingRegulationsDate: string;
  buildingRegulationsAcknowledged: boolean;
  condominiumRegulationsProvided: boolean;
  condominiumRegulationsDate?: string;
  repairsBeforeDelivery: string;
  repairsDuringLease: string;
  superintendentName: string;
  superintendentPhone: string; 
  superintendentEmail: string;
  superintendentOtherPhone: string;
  serviceResponsibilities: ServiceResponsibilities;
  heatingSourceType?: HeatingSourceType;
  accessToLand: boolean;
  accessToLandDetails?: string; // Added field for access to land details
  animalsAllowed: boolean;
  animalsAllowedDetails?: string; // Added field for animal details
  otherConditions: string;
  
  // Section F: Rent Setting Restrictions
  propertyBuiltLast5Years: boolean;
  propertyBuiltDate?: string;
  propertyConvertedLast5Years: boolean;
  propertyConvertedDate?: string;
  
  // Section G: New Tenant Notice
  previousLowestRent: number;
  previousRentFrequency?: 'weekly' | 'monthly' | 'other';
  previousRentFrequencyOther?: string;
  samePropertyServices: boolean;
  propertyModifications: string;
  tenantSignatureDate?: string;
  
  // Section H & I: Signatures and Declarations
  jointTenantLiability: boolean;
  otherSignatories: OtherSignatory[];
  familyResidenceDeclaration: boolean;
  spouseName: string;
  familyResidenceNotes?: string;
  
  // Status
  status: LeaseStatus;
  createdAt?: string;
  updatedAt?: string;
}
