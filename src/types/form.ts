
export type FormStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface Form {
  id: string;
  name: string;
  category: string;
  description: string | null;
  icon: string;
  isFavorite: boolean;
  file_path: string | null;
  html_path?: string | null;
  status: FormStatus;
  created_at: string | null;
  created_by: string;
  organization_id: string;
  updated_at: string | null;
}

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "checkbox"
  | "date"
  | "signature"
  | "select"
  | "radio"
  | "textarea"
  | "time";

export type DBFieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "checkbox"
  | "date"
  | "signature";

export interface FormField {
  id: string;
  form_id?: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  position?: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  isAutoFilled?: boolean;
  tenantField?: string | null;
  options?: string[];
}

export interface DBFormField {
  form_id: string;
  field_type: DBFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  is_auto_filled: boolean;
  tenant_field: string | null;
}

export const AUTO_FILL_FIELDS = [
  {
    type: "text" as const,
    label: "First Name",
    tenantField: "first_name",
  },
  {
    type: "text" as const,
    label: "Last Name",
    tenantField: "last_name",
  },
  {
    type: "email" as const,
    label: "Email",
    tenantField: "email",
  },
  {
    type: "phone" as const,
    label: "Phone",
    tenantField: "phone",
  },
] as const;

export const MANUAL_INPUT_FIELDS = [
  {
    type: "text" as const,
    label: "Text Field",
  },
  {
    type: "number" as const,
    label: "Number Field",
  },
  {
    type: "email" as const,
    label: "Email Field",
  },
  {
    type: "textarea" as const,
    label: "Text Area",
  },
  {
    type: "checkbox" as const,
    label: "Checkbox",
  },
  {
    type: "date" as const,
    label: "Date",
  },
  {
    type: "signature" as const,
    label: "Signature",
  },
] as const;
