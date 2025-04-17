
import { FormField } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface FormBuilderPropertiesProps {
  selectedField: FormField | null;
  onFieldUpdate: (field: FormField) => void;
}

export function FormBuilderProperties({
  selectedField,
  onFieldUpdate,
}: FormBuilderPropertiesProps) {
  if (!selectedField) {
    return (
      <div className="col-span-3 bg-secondary p-4 rounded-lg">
        <p className="text-muted-foreground text-center">
          Select a field to customize its properties
        </p>
      </div>
    );
  }

  const handleChange = (
    key: keyof FormField,
    value: string | boolean | string[] | undefined
  ) => {
    console.log("Updating field property:", key, value);
    onFieldUpdate({
      ...selectedField,
      [key]: value,
    });
  };

  return (
    <div className="col-span-3 bg-secondary p-4 rounded-lg overflow-y-auto">
      <h2 className="font-semibold mb-4">Field Properties</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={selectedField.label}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={selectedField.placeholder || ""}
            onChange={(e) => handleChange("placeholder", e.target.value)}
            placeholder={`Enter ${selectedField.label.toLowerCase()}`}
          />
        </div>

        {(selectedField.type === "select" ||
          selectedField.type === "checkbox" ||
          selectedField.type === "radio") && (
          <div className="space-y-2">
            <Label>Options (one per line)</Label>
            <Textarea
              value={selectedField.options?.join("\n") || ""}
              onChange={(e) =>
                handleChange(
                  "options",
                  e.target.value.split("\n").filter((o) => o.trim())
                )
              }
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={selectedField.required || false}
            onCheckedChange={(checked) => handleChange("required", !!checked)}
          />
          <Label htmlFor="required">Required field</Label>
        </div>
      </div>
    </div>
  );
}
