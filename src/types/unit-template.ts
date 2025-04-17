
export interface UnitTemplate {
  id: string;
  name: string;
  property_id: string;
  organization_id?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  square_feet?: number | null;
  monthly_rent?: number | null;
  rent_due_date?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  floor_number?: number | null;
  unit_type?: string | null;
}
