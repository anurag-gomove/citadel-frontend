export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      form_fields: {
        Row: {
          created_at: string | null
          field_type: string
          form_id: string
          height: number
          id: string
          is_auto_filled: boolean | null
          label: string
          placeholder: string | null
          required: boolean | null
          tenant_field: string | null
          updated_at: string | null
          width: number
          x_position: number
          y_position: number
        }
        Insert: {
          created_at?: string | null
          field_type: string
          form_id: string
          height?: number
          id?: string
          is_auto_filled?: boolean | null
          label: string
          placeholder?: string | null
          required?: boolean | null
          tenant_field?: string | null
          updated_at?: string | null
          width?: number
          x_position?: number
          y_position?: number
        }
        Update: {
          created_at?: string | null
          field_type?: string
          form_id?: string
          height?: number
          id?: string
          is_auto_filled?: boolean | null
          label?: string
          placeholder?: string | null
          required?: boolean | null
          tenant_field?: string | null
          updated_at?: string | null
          width?: number
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          file_path: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          file_path?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          file_path?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          access_to_land: boolean | null
          animals_allowed: boolean | null
          appliances: Json | null
          base_rent: number | null
          building_regulations_acknowledged: boolean | null
          building_regulations_date: string | null
          condominium_regulations_date: string | null
          condominium_regulations_provided: boolean | null
          created_at: string | null
          duration_unit: string | null
          duration_value: number | null
          dwelling_address: string | null
          dwelling_apt: string | null
          dwelling_municipality: string | null
          dwelling_street: string | null
          dwelling_street_number: string | null
          dwelling_zipcode: string | null
          end_date: string | null
          family_residence_declaration: boolean | null
          family_residence_notes: string | null
          first_payment_date: string | null
          furniture: Json | null
          furniture_included: boolean | null
          heating_source_type: string | null
          id: string
          indoor_parking_location: string | null
          indoor_parking_spaces: number | null
          is_condominium: boolean | null
          joint_tenant_liability: boolean | null
          landlord_address: string | null
          landlord_apartment: string | null
          landlord_cell_phone: string | null
          landlord_email: string | null
          landlord_municipality: string | null
          landlord_name: string | null
          landlord_postal_code: string | null
          landlord_representative: string | null
          landlord_street_name: string | null
          landlord_street_number: string | null
          landlord_telephone: string | null
          lease_type: string | null
          mixed_purpose_types: Json | null
          number_of_rooms: number | null
          other_accessories: string | null
          other_conditions: string | null
          other_furnishings: string | null
          other_signatories: Json | null
          outdoor_parking_location: string | null
          outdoor_parking_spaces: number | null
          payment_day: number | null
          payment_location: string | null
          payment_method: string | null
          postdated_checks: boolean | null
          previous_lowest_rent: number | null
          property_built_date: string | null
          property_built_last_5_years: boolean | null
          property_converted_date: string | null
          property_converted_last_5_years: boolean | null
          property_id: string | null
          property_modifications: string | null
          purpose: string | null
          rent_frequency: string | null
          repairs_before_delivery: string | null
          repairs_during_lease: string | null
          residentialpurposeonly: boolean | null
          same_property_services: boolean | null
          second_landlord_apartment: string | null
          second_landlord_cell_phone: string | null
          second_landlord_email: string | null
          second_landlord_municipality: string | null
          second_landlord_name: string | null
          second_landlord_postal_code: string | null
          second_landlord_street_name: string | null
          second_landlord_street_number: string | null
          second_landlord_telephone: string | null
          second_tenant_apartment: string | null
          second_tenant_cell_phone: string | null
          second_tenant_email: string | null
          second_tenant_id: string | null
          second_tenant_municipality: string | null
          second_tenant_name: string | null
          second_tenant_postal_code: string | null
          second_tenant_street_name: string | null
          second_tenant_street_number: string | null
          second_tenant_telephone: string | null
          service_responsibilities: Json | null
          services_cost: number | null
          smoke_detector_acknowledged: boolean | null
          spouse_name: string | null
          start_date: string | null
          status: string | null
          storage_details: string | null
          subsidy_program: boolean | null
          superintendent_email: string | null
          superintendent_name: string | null
          superintendent_other_phone: string | null
          superintendent_phone: string | null
          tenant_apartment: string | null
          tenant_cell_phone: string | null
          tenant_email: string | null
          tenant_id: string
          tenant_municipality: string | null
          tenant_name: string | null
          tenant_postal_code: string | null
          tenant_street_name: string | null
          tenant_street_number: string | null
          tenant_telephone: string | null
          total_rent: number | null
          updated_at: string | null
        }
        Insert: {
          access_to_land?: boolean | null
          animals_allowed?: boolean | null
          appliances?: Json | null
          base_rent?: number | null
          building_regulations_acknowledged?: boolean | null
          building_regulations_date?: string | null
          condominium_regulations_date?: string | null
          condominium_regulations_provided?: boolean | null
          created_at?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          dwelling_address?: string | null
          dwelling_apt?: string | null
          dwelling_municipality?: string | null
          dwelling_street?: string | null
          dwelling_street_number?: string | null
          dwelling_zipcode?: string | null
          end_date?: string | null
          family_residence_declaration?: boolean | null
          family_residence_notes?: string | null
          first_payment_date?: string | null
          furniture?: Json | null
          furniture_included?: boolean | null
          heating_source_type?: string | null
          id?: string
          indoor_parking_location?: string | null
          indoor_parking_spaces?: number | null
          is_condominium?: boolean | null
          joint_tenant_liability?: boolean | null
          landlord_address?: string | null
          landlord_apartment?: string | null
          landlord_cell_phone?: string | null
          landlord_email?: string | null
          landlord_municipality?: string | null
          landlord_name?: string | null
          landlord_postal_code?: string | null
          landlord_representative?: string | null
          landlord_street_name?: string | null
          landlord_street_number?: string | null
          landlord_telephone?: string | null
          lease_type?: string | null
          mixed_purpose_types?: Json | null
          number_of_rooms?: number | null
          other_accessories?: string | null
          other_conditions?: string | null
          other_furnishings?: string | null
          other_signatories?: Json | null
          outdoor_parking_location?: string | null
          outdoor_parking_spaces?: number | null
          payment_day?: number | null
          payment_location?: string | null
          payment_method?: string | null
          postdated_checks?: boolean | null
          previous_lowest_rent?: number | null
          property_built_date?: string | null
          property_built_last_5_years?: boolean | null
          property_converted_date?: string | null
          property_converted_last_5_years?: boolean | null
          property_id?: string | null
          property_modifications?: string | null
          purpose?: string | null
          rent_frequency?: string | null
          repairs_before_delivery?: string | null
          repairs_during_lease?: string | null
          residentialpurposeonly?: boolean | null
          same_property_services?: boolean | null
          second_landlord_apartment?: string | null
          second_landlord_cell_phone?: string | null
          second_landlord_email?: string | null
          second_landlord_municipality?: string | null
          second_landlord_name?: string | null
          second_landlord_postal_code?: string | null
          second_landlord_street_name?: string | null
          second_landlord_street_number?: string | null
          second_landlord_telephone?: string | null
          second_tenant_apartment?: string | null
          second_tenant_cell_phone?: string | null
          second_tenant_email?: string | null
          second_tenant_id?: string | null
          second_tenant_municipality?: string | null
          second_tenant_name?: string | null
          second_tenant_postal_code?: string | null
          second_tenant_street_name?: string | null
          second_tenant_street_number?: string | null
          second_tenant_telephone?: string | null
          service_responsibilities?: Json | null
          services_cost?: number | null
          smoke_detector_acknowledged?: boolean | null
          spouse_name?: string | null
          start_date?: string | null
          status?: string | null
          storage_details?: string | null
          subsidy_program?: boolean | null
          superintendent_email?: string | null
          superintendent_name?: string | null
          superintendent_other_phone?: string | null
          superintendent_phone?: string | null
          tenant_apartment?: string | null
          tenant_cell_phone?: string | null
          tenant_email?: string | null
          tenant_id: string
          tenant_municipality?: string | null
          tenant_name?: string | null
          tenant_postal_code?: string | null
          tenant_street_name?: string | null
          tenant_street_number?: string | null
          tenant_telephone?: string | null
          total_rent?: number | null
          updated_at?: string | null
        }
        Update: {
          access_to_land?: boolean | null
          animals_allowed?: boolean | null
          appliances?: Json | null
          base_rent?: number | null
          building_regulations_acknowledged?: boolean | null
          building_regulations_date?: string | null
          condominium_regulations_date?: string | null
          condominium_regulations_provided?: boolean | null
          created_at?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          dwelling_address?: string | null
          dwelling_apt?: string | null
          dwelling_municipality?: string | null
          dwelling_street?: string | null
          dwelling_street_number?: string | null
          dwelling_zipcode?: string | null
          end_date?: string | null
          family_residence_declaration?: boolean | null
          family_residence_notes?: string | null
          first_payment_date?: string | null
          furniture?: Json | null
          furniture_included?: boolean | null
          heating_source_type?: string | null
          id?: string
          indoor_parking_location?: string | null
          indoor_parking_spaces?: number | null
          is_condominium?: boolean | null
          joint_tenant_liability?: boolean | null
          landlord_address?: string | null
          landlord_apartment?: string | null
          landlord_cell_phone?: string | null
          landlord_email?: string | null
          landlord_municipality?: string | null
          landlord_name?: string | null
          landlord_postal_code?: string | null
          landlord_representative?: string | null
          landlord_street_name?: string | null
          landlord_street_number?: string | null
          landlord_telephone?: string | null
          lease_type?: string | null
          mixed_purpose_types?: Json | null
          number_of_rooms?: number | null
          other_accessories?: string | null
          other_conditions?: string | null
          other_furnishings?: string | null
          other_signatories?: Json | null
          outdoor_parking_location?: string | null
          outdoor_parking_spaces?: number | null
          payment_day?: number | null
          payment_location?: string | null
          payment_method?: string | null
          postdated_checks?: boolean | null
          previous_lowest_rent?: number | null
          property_built_date?: string | null
          property_built_last_5_years?: boolean | null
          property_converted_date?: string | null
          property_converted_last_5_years?: boolean | null
          property_id?: string | null
          property_modifications?: string | null
          purpose?: string | null
          rent_frequency?: string | null
          repairs_before_delivery?: string | null
          repairs_during_lease?: string | null
          residentialpurposeonly?: boolean | null
          same_property_services?: boolean | null
          second_landlord_apartment?: string | null
          second_landlord_cell_phone?: string | null
          second_landlord_email?: string | null
          second_landlord_municipality?: string | null
          second_landlord_name?: string | null
          second_landlord_postal_code?: string | null
          second_landlord_street_name?: string | null
          second_landlord_street_number?: string | null
          second_landlord_telephone?: string | null
          second_tenant_apartment?: string | null
          second_tenant_cell_phone?: string | null
          second_tenant_email?: string | null
          second_tenant_id?: string | null
          second_tenant_municipality?: string | null
          second_tenant_name?: string | null
          second_tenant_postal_code?: string | null
          second_tenant_street_name?: string | null
          second_tenant_street_number?: string | null
          second_tenant_telephone?: string | null
          service_responsibilities?: Json | null
          services_cost?: number | null
          smoke_detector_acknowledged?: boolean | null
          spouse_name?: string | null
          start_date?: string | null
          status?: string | null
          storage_details?: string | null
          subsidy_program?: boolean | null
          superintendent_email?: string | null
          superintendent_name?: string | null
          superintendent_other_phone?: string | null
          superintendent_phone?: string | null
          tenant_apartment?: string | null
          tenant_cell_phone?: string | null
          tenant_email?: string | null
          tenant_id?: string
          tenant_municipality?: string | null
          tenant_name?: string | null
          tenant_postal_code?: string | null
          tenant_street_name?: string | null
          tenant_street_number?: string | null
          tenant_telephone?: string | null
          total_rent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_second_tenant_id_fkey"
            columns: ["second_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          property_id: string | null
          status: string | null
          tenant_id: string | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          property_id?: string | null
          status?: string | null
          tenant_id?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          property_id?: string | null
          status?: string | null
          tenant_id?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_superadmin: boolean | null
          language: string | null
          last_name: string | null
          location: string | null
          mobile_phone: string | null
          organization_id: string | null
          phone_number: string | null
          status: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_superadmin?: boolean | null
          language?: string | null
          last_name?: string | null
          location?: string | null
          mobile_phone?: string | null
          organization_id?: string | null
          phone_number?: string | null
          status?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_superadmin?: boolean | null
          language?: string | null
          last_name?: string | null
          location?: string | null
          mobile_phone?: string | null
          organization_id?: string | null
          phone_number?: string | null
          status?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          apartment_unit: string | null
          country: string | null
          created_at: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          municipality: string | null
          name: string
          occupied_units: number | null
          organization_id: string
          owner_id: string
          postal_code: string | null
          primary_classification: string | null
          province: string | null
          secondary_classification: string | null
          status: string | null
          street_address: string | null
          street_name: string | null
          street_number: string | null
          total_units: number | null
          type: string
          updated_at: string | null
          year_built: number | null
          year_occupied: number | null
        }
        Insert: {
          address: string
          apartment_unit?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          municipality?: string | null
          name: string
          occupied_units?: number | null
          organization_id: string
          owner_id: string
          postal_code?: string | null
          primary_classification?: string | null
          province?: string | null
          secondary_classification?: string | null
          status?: string | null
          street_address?: string | null
          street_name?: string | null
          street_number?: string | null
          total_units?: number | null
          type: string
          updated_at?: string | null
          year_built?: number | null
          year_occupied?: number | null
        }
        Update: {
          address?: string
          apartment_unit?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          municipality?: string | null
          name?: string
          occupied_units?: number | null
          organization_id?: string
          owner_id?: string
          postal_code?: string | null
          primary_classification?: string | null
          province?: string | null
          secondary_classification?: string | null
          status?: string | null
          street_address?: string | null
          street_name?: string | null
          street_number?: string | null
          total_units?: number | null
          type?: string
          updated_at?: string | null
          year_built?: number | null
          year_occupied?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_bills: {
        Row: {
          amount: number
          attachment_url: string | null
          created_at: string | null
          created_by: string
          description: string
          due_date: string
          gst_amount: number | null
          id: string
          paid: boolean | null
          property_id: string
          qst_amount: number | null
          status: string
          tag: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          created_at?: string | null
          created_by: string
          description: string
          due_date: string
          gst_amount?: number | null
          id?: string
          paid?: boolean | null
          property_id: string
          qst_amount?: number | null
          status?: string
          tag?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          due_date?: string
          gst_amount?: number | null
          id?: string
          paid?: boolean | null
          property_id?: string
          qst_amount?: number | null
          status?: string
          tag?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_bills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bills_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bills_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          apartment: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_primary: boolean | null
          other_phone: string | null
          phone: string | null
          property_id: string
          street_name: string | null
          street_number: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          apartment?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean | null
          other_phone?: string | null
          phone?: string | null
          property_id: string
          street_name?: string | null
          street_number?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          apartment?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean | null
          other_phone?: string | null
          phone?: string | null
          property_id?: string
          street_name?: string | null
          street_number?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_owners_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_transactions: {
        Row: {
          amount: number
          budget_year: number | null
          category: string
          created_at: string | null
          created_by: string
          date: string
          description: string | null
          id: string
          is_budgeted: boolean | null
          is_one_time: boolean | null
          is_recurring: boolean | null
          property_id: string
          recurrence_interval: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          budget_year?: number | null
          category: string
          created_at?: string | null
          created_by: string
          date: string
          description?: string | null
          id?: string
          is_budgeted?: boolean | null
          is_one_time?: boolean | null
          is_recurring?: boolean | null
          property_id: string
          recurrence_interval?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          budget_year?: number | null
          category?: string
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          is_budgeted?: boolean | null
          is_one_time?: boolean | null
          is_recurring?: boolean | null
          property_id?: string
          recurrence_interval?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_applications: {
        Row: {
          application_type: string
          created_at: string | null
          id: string
          notes: string | null
          received_date: string | null
          reviewed_date: string | null
          sent_date: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          application_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          received_date?: string | null
          reviewed_date?: string | null
          sent_date?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          application_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          received_date?: string | null
          reviewed_date?: string | null
          sent_date?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          apartment: string | null
          application_received_date: string | null
          application_reviewed_date: string | null
          application_sent_date: string | null
          application_status: string | null
          can_send_new_application: boolean | null
          city: string | null
          created_at: string | null
          credit_score: number | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          last_name: string
          lease_end_date: string | null
          lease_start_date: string | null
          lease_status: string | null
          notes: string | null
          organization_id: string | null
          other_phone: string | null
          phone: string | null
          preferred_language: string | null
          previous_address: string | null
          property_id: string | null
          status: string
          street_name: string | null
          street_number: string | null
          unit_id: string | null
          unit_number: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          apartment?: string | null
          application_received_date?: string | null
          application_reviewed_date?: string | null
          application_sent_date?: string | null
          application_status?: string | null
          can_send_new_application?: boolean | null
          city?: string | null
          created_at?: string | null
          credit_score?: number | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          lease_end_date?: string | null
          lease_start_date?: string | null
          lease_status?: string | null
          notes?: string | null
          organization_id?: string | null
          other_phone?: string | null
          phone?: string | null
          preferred_language?: string | null
          previous_address?: string | null
          property_id?: string | null
          status?: string
          street_name?: string | null
          street_number?: string | null
          unit_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          apartment?: string | null
          application_received_date?: string | null
          application_reviewed_date?: string | null
          application_sent_date?: string | null
          application_status?: string | null
          can_send_new_application?: boolean | null
          city?: string | null
          created_at?: string | null
          credit_score?: number | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lease_end_date?: string | null
          lease_start_date?: string | null
          lease_status?: string | null
          notes?: string | null
          organization_id?: string | null
          other_phone?: string | null
          phone?: string | null
          preferred_language?: string | null
          previous_address?: string | null
          property_id?: string | null
          status?: string
          street_name?: string | null
          street_number?: string | null
          unit_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_payments: {
        Row: {
          balance_due: number | null
          created_at: string | null
          due_date: string | null
          expected_amount: number
          id: string
          notes: string | null
          organization_id: string | null
          paid_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          property_id: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          balance_due?: number | null
          created_at?: string | null
          due_date?: string | null
          expected_amount: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          property_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          balance_due?: number | null
          created_at?: string | null
          due_date?: string | null
          expected_amount?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          property_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_templates: {
        Row: {
          additional_fees: string | null
          air_conditioning_included: boolean | null
          air_conditioning_type: string | null
          balcony_size: string | null
          bathrooms: number | null
          bedrooms: number | null
          condition_report: string | null
          created_at: string | null
          dishwasher_owner: string | null
          dryer_owner: string | null
          electricity_included: boolean | null
          entry_system_info: string | null
          fixtures_inventory: string | null
          floor_number: number | null
          furniture_list: string | null
          has_balcony: boolean | null
          has_dishwasher: boolean | null
          has_dryer: boolean | null
          has_microwave: boolean | null
          has_parking: boolean | null
          has_refrigerator: boolean | null
          has_storage: boolean | null
          has_stove: boolean | null
          has_washer: boolean | null
          heating_included: boolean | null
          heating_type: string | null
          hot_water_included: boolean | null
          id: string
          internet_included: boolean | null
          keys_provided: string | null
          known_defects: string | null
          last_renovation_date: string | null
          lease_end_date: string | null
          lease_length: string | null
          lease_start_date: string | null
          mailbox_number: string | null
          maintenance_requirements: string | null
          microwave_owner: string | null
          monthly_rent: number | null
          name: string
          organization_id: string | null
          other_rooms: string | null
          other_services: string | null
          parking_location: string | null
          parking_number: string | null
          parking_spot_numbers: string | null
          parking_type: string | null
          payment_method: string | null
          pet_policy: string | null
          previous_tenant_rent: string | null
          property_id: string
          refrigerator_owner: string | null
          renewal_terms: string | null
          rent_due_date: number | null
          rent_increase_history: string | null
          smoking_policy: string | null
          special_conditions: string | null
          square_feet: number | null
          storage_location: string | null
          storage_locker_number: string | null
          storage_number: string | null
          stove_owner: string | null
          subletting_policy: string | null
          unit_restrictions: string | null
          unit_type: string | null
          updated_at: string | null
          washer_owner: string | null
          water_included: boolean | null
        }
        Insert: {
          additional_fees?: string | null
          air_conditioning_included?: boolean | null
          air_conditioning_type?: string | null
          balcony_size?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          condition_report?: string | null
          created_at?: string | null
          dishwasher_owner?: string | null
          dryer_owner?: string | null
          electricity_included?: boolean | null
          entry_system_info?: string | null
          fixtures_inventory?: string | null
          floor_number?: number | null
          furniture_list?: string | null
          has_balcony?: boolean | null
          has_dishwasher?: boolean | null
          has_dryer?: boolean | null
          has_microwave?: boolean | null
          has_parking?: boolean | null
          has_refrigerator?: boolean | null
          has_storage?: boolean | null
          has_stove?: boolean | null
          has_washer?: boolean | null
          heating_included?: boolean | null
          heating_type?: string | null
          hot_water_included?: boolean | null
          id?: string
          internet_included?: boolean | null
          keys_provided?: string | null
          known_defects?: string | null
          last_renovation_date?: string | null
          lease_end_date?: string | null
          lease_length?: string | null
          lease_start_date?: string | null
          mailbox_number?: string | null
          maintenance_requirements?: string | null
          microwave_owner?: string | null
          monthly_rent?: number | null
          name: string
          organization_id?: string | null
          other_rooms?: string | null
          other_services?: string | null
          parking_location?: string | null
          parking_number?: string | null
          parking_spot_numbers?: string | null
          parking_type?: string | null
          payment_method?: string | null
          pet_policy?: string | null
          previous_tenant_rent?: string | null
          property_id: string
          refrigerator_owner?: string | null
          renewal_terms?: string | null
          rent_due_date?: number | null
          rent_increase_history?: string | null
          smoking_policy?: string | null
          special_conditions?: string | null
          square_feet?: number | null
          storage_location?: string | null
          storage_locker_number?: string | null
          storage_number?: string | null
          stove_owner?: string | null
          subletting_policy?: string | null
          unit_restrictions?: string | null
          unit_type?: string | null
          updated_at?: string | null
          washer_owner?: string | null
          water_included?: boolean | null
        }
        Update: {
          additional_fees?: string | null
          air_conditioning_included?: boolean | null
          air_conditioning_type?: string | null
          balcony_size?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          condition_report?: string | null
          created_at?: string | null
          dishwasher_owner?: string | null
          dryer_owner?: string | null
          electricity_included?: boolean | null
          entry_system_info?: string | null
          fixtures_inventory?: string | null
          floor_number?: number | null
          furniture_list?: string | null
          has_balcony?: boolean | null
          has_dishwasher?: boolean | null
          has_dryer?: boolean | null
          has_microwave?: boolean | null
          has_parking?: boolean | null
          has_refrigerator?: boolean | null
          has_storage?: boolean | null
          has_stove?: boolean | null
          has_washer?: boolean | null
          heating_included?: boolean | null
          heating_type?: string | null
          hot_water_included?: boolean | null
          id?: string
          internet_included?: boolean | null
          keys_provided?: string | null
          known_defects?: string | null
          last_renovation_date?: string | null
          lease_end_date?: string | null
          lease_length?: string | null
          lease_start_date?: string | null
          mailbox_number?: string | null
          maintenance_requirements?: string | null
          microwave_owner?: string | null
          monthly_rent?: number | null
          name?: string
          organization_id?: string | null
          other_rooms?: string | null
          other_services?: string | null
          parking_location?: string | null
          parking_number?: string | null
          parking_spot_numbers?: string | null
          parking_type?: string | null
          payment_method?: string | null
          pet_policy?: string | null
          previous_tenant_rent?: string | null
          property_id?: string
          refrigerator_owner?: string | null
          renewal_terms?: string | null
          rent_due_date?: number | null
          rent_increase_history?: string | null
          smoking_policy?: string | null
          special_conditions?: string | null
          square_feet?: number | null
          storage_location?: string | null
          storage_locker_number?: string | null
          storage_number?: string | null
          stove_owner?: string | null
          subletting_policy?: string | null
          unit_restrictions?: string | null
          unit_type?: string | null
          updated_at?: string | null
          washer_owner?: string | null
          water_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_templates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          actual_monthly_rent: string | null
          additional_fees: string | null
          air_conditioning_included: boolean | null
          air_conditioning_type: string | null
          balcony_size: string | null
          bathrooms: number | null
          bedrooms: number | null
          condition_report: string | null
          created_at: string | null
          dishwasher_owner: string | null
          dryer_owner: string | null
          electricity_included: boolean | null
          entry_system_info: string | null
          fixtures_inventory: string | null
          floor_number: number | null
          furniture_list: string | null
          has_balcony: boolean | null
          has_dishwasher: boolean | null
          has_dryer: boolean | null
          has_microwave: boolean | null
          has_parking: boolean | null
          has_refrigerator: boolean | null
          has_storage: boolean | null
          has_stove: boolean | null
          has_washer: boolean | null
          heating_included: boolean | null
          heating_type: string | null
          hot_water_included: boolean | null
          id: string
          internet_included: boolean | null
          keys_provided: string | null
          known_defects: string | null
          last_renovation_date: string | null
          lease_end_date: string | null
          lease_length: string | null
          lease_start_date: string | null
          mailbox_number: string | null
          maintenance_requirements: string | null
          microwave_owner: string | null
          mixed_purpose_types: Json | null
          monthly_rent: number | null
          organization_id: string | null
          other_rooms: string | null
          other_services: string | null
          parking_location: string | null
          parking_number: string | null
          parking_spot_numbers: string | null
          parking_type: string | null
          payment_method: string | null
          pet_policy: string | null
          previous_tenant_rent: string | null
          property_id: string
          refrigerator_owner: string | null
          renewal_terms: string | null
          rent_due_date: number | null
          rent_increase_history: string | null
          residential_purpose_only: boolean | null
          smoking_policy: string | null
          special_conditions: string | null
          square_feet: number | null
          status: string
          storage_location: string | null
          storage_locker_number: string | null
          storage_number: string | null
          stove_owner: string | null
          subletting_policy: string | null
          tenant_id: string | null
          unit_number: string
          unit_restrictions: string | null
          unit_type: string | null
          updated_at: string | null
          washer_owner: string | null
          water_included: boolean | null
        }
        Insert: {
          actual_monthly_rent?: string | null
          additional_fees?: string | null
          air_conditioning_included?: boolean | null
          air_conditioning_type?: string | null
          balcony_size?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          condition_report?: string | null
          created_at?: string | null
          dishwasher_owner?: string | null
          dryer_owner?: string | null
          electricity_included?: boolean | null
          entry_system_info?: string | null
          fixtures_inventory?: string | null
          floor_number?: number | null
          furniture_list?: string | null
          has_balcony?: boolean | null
          has_dishwasher?: boolean | null
          has_dryer?: boolean | null
          has_microwave?: boolean | null
          has_parking?: boolean | null
          has_refrigerator?: boolean | null
          has_storage?: boolean | null
          has_stove?: boolean | null
          has_washer?: boolean | null
          heating_included?: boolean | null
          heating_type?: string | null
          hot_water_included?: boolean | null
          id?: string
          internet_included?: boolean | null
          keys_provided?: string | null
          known_defects?: string | null
          last_renovation_date?: string | null
          lease_end_date?: string | null
          lease_length?: string | null
          lease_start_date?: string | null
          mailbox_number?: string | null
          maintenance_requirements?: string | null
          microwave_owner?: string | null
          mixed_purpose_types?: Json | null
          monthly_rent?: number | null
          organization_id?: string | null
          other_rooms?: string | null
          other_services?: string | null
          parking_location?: string | null
          parking_number?: string | null
          parking_spot_numbers?: string | null
          parking_type?: string | null
          payment_method?: string | null
          pet_policy?: string | null
          previous_tenant_rent?: string | null
          property_id: string
          refrigerator_owner?: string | null
          renewal_terms?: string | null
          rent_due_date?: number | null
          rent_increase_history?: string | null
          residential_purpose_only?: boolean | null
          smoking_policy?: string | null
          special_conditions?: string | null
          square_feet?: number | null
          status?: string
          storage_location?: string | null
          storage_locker_number?: string | null
          storage_number?: string | null
          stove_owner?: string | null
          subletting_policy?: string | null
          tenant_id?: string | null
          unit_number: string
          unit_restrictions?: string | null
          unit_type?: string | null
          updated_at?: string | null
          washer_owner?: string | null
          water_included?: boolean | null
        }
        Update: {
          actual_monthly_rent?: string | null
          additional_fees?: string | null
          air_conditioning_included?: boolean | null
          air_conditioning_type?: string | null
          balcony_size?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          condition_report?: string | null
          created_at?: string | null
          dishwasher_owner?: string | null
          dryer_owner?: string | null
          electricity_included?: boolean | null
          entry_system_info?: string | null
          fixtures_inventory?: string | null
          floor_number?: number | null
          furniture_list?: string | null
          has_balcony?: boolean | null
          has_dishwasher?: boolean | null
          has_dryer?: boolean | null
          has_microwave?: boolean | null
          has_parking?: boolean | null
          has_refrigerator?: boolean | null
          has_storage?: boolean | null
          has_stove?: boolean | null
          has_washer?: boolean | null
          heating_included?: boolean | null
          heating_type?: string | null
          hot_water_included?: boolean | null
          id?: string
          internet_included?: boolean | null
          keys_provided?: string | null
          known_defects?: string | null
          last_renovation_date?: string | null
          lease_end_date?: string | null
          lease_length?: string | null
          lease_start_date?: string | null
          mailbox_number?: string | null
          maintenance_requirements?: string | null
          microwave_owner?: string | null
          mixed_purpose_types?: Json | null
          monthly_rent?: number | null
          organization_id?: string | null
          other_rooms?: string | null
          other_services?: string | null
          parking_location?: string | null
          parking_number?: string | null
          parking_spot_numbers?: string | null
          parking_type?: string | null
          payment_method?: string | null
          pet_policy?: string | null
          previous_tenant_rent?: string | null
          property_id?: string
          refrigerator_owner?: string | null
          renewal_terms?: string | null
          rent_due_date?: number | null
          rent_increase_history?: string | null
          residential_purpose_only?: boolean | null
          smoking_policy?: string | null
          special_conditions?: string | null
          square_feet?: number | null
          status?: string
          storage_location?: string | null
          storage_locker_number?: string | null
          storage_number?: string | null
          stove_owner?: string | null
          subletting_policy?: string | null
          tenant_id?: string | null
          unit_number?: string
          unit_restrictions?: string | null
          unit_type?: string | null
          updated_at?: string | null
          washer_owner?: string | null
          water_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          account_name: string | null
          account_url: string | null
          created_at: string | null
          data_region: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_name?: string | null
          account_url?: string | null
          created_at?: string | null
          data_region?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_name?: string | null
          account_url?: string | null
          created_at?: string | null
          data_region?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          property_id: string
          status: string
          type: string
          unit_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          property_id: string
          status?: string
          type: string
          unit_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          property_id?: string
          status?: string
          type?: string
          unit_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_profile_and_role: {
        Args: {
          user_id: string
          first_name: string
          last_name: string
          user_email: string
          org_id: string
          user_role: string
          is_super: boolean
        }
        Returns: undefined
      }
      get_all_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_superadmin: boolean | null
          language: string | null
          last_name: string | null
          location: string | null
          mobile_phone: string | null
          organization_id: string | null
          phone_number: string | null
          status: string | null
          theme: string | null
          updated_at: string | null
        }[]
      }
      get_own_profile: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          email: string
          status: string
        }[]
      }
      get_properties_by_distance: {
        Args: {
          lat: number
          lng: number
          distance_km: number
        }
        Returns: {
          address: string
          apartment_unit: string | null
          country: string | null
          created_at: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          municipality: string | null
          name: string
          occupied_units: number | null
          organization_id: string
          owner_id: string
          postal_code: string | null
          primary_classification: string | null
          province: string | null
          secondary_classification: string | null
          status: string | null
          street_address: string | null
          street_name: string | null
          street_number: string | null
          total_units: number | null
          type: string
          updated_at: string | null
          year_built: number | null
          year_occupied: number | null
        }[]
      }
      get_table_info: {
        Args: {
          table_name: string
        }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      is_super_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_user_super_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      update_own_profile: {
        Args: {
          user_id: string
          first_name: string
          last_name: string
          phone_number: string
          mobile_phone: string
          location: string
          language: string
          theme: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      user_role:
        | "super_admin"
        | "property_manager"
        | "landlord"
        | "tenant"
        | "maintenance"
      user_role_type: "super_admin" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
