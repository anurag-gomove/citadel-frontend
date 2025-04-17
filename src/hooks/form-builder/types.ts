
import { FormField } from "@/types/form";

export const GRID_SIZE = 20;

export const DEFAULT_FIELD_SIZE = {
  width: 200,
  height: 40,
};

export interface DraggedField extends FormField {
  isToolbarItem?: boolean;
}
