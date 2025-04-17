
import { AUTO_FILL_FIELDS, MANUAL_INPUT_FIELDS, FormField } from "@/types/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

interface FormBuilderSidebarProps {
  onFieldAdd: (field: FormField) => void;
}

export function FormBuilderSidebar({ onFieldAdd }: FormBuilderSidebarProps) {
  const handleAddField = (
    baseField: (typeof AUTO_FILL_FIELDS[number] | typeof MANUAL_INPUT_FIELDS[number]),
    isAutoFill: boolean = false
  ) => {
    const field: FormField = {
      id: uuidv4(),
      type: baseField.type,
      label: baseField.label,
      placeholder: "",
      required: false,
      position: { x: 0, y: 0 },
      width: 200,
      height: 40,
      isAutoFilled: isAutoFill,
      tenantField: isAutoFill ? (baseField as typeof AUTO_FILL_FIELDS[number]).tenantField : null,
    };
    onFieldAdd(field);
  };

  return (
    <div className="col-span-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Auto-fill Fields</CardTitle>
          <CardDescription>
            Fields that can be auto-filled with tenant data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AUTO_FILL_FIELDS.map((field) => (
              <Button
                key={field.tenantField}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddField(field, true)}
              >
                {field.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Input Fields</CardTitle>
          <CardDescription>
            Fields that require manual input
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MANUAL_INPUT_FIELDS.map((field) => (
              <Button
                key={field.type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddField(field)}
              >
                {field.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
