
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UnitTemplateSelectorProps {
  templates: any[];
  onTemplateSelect: (templateId: string) => void;
}

export function UnitTemplateSelector({ templates, onTemplateSelect }: UnitTemplateSelectorProps) {
  return (
    <div className="grid gap-4 max-w-md">
      <Label htmlFor="template">Use Template</Label>
      <Select
        onValueChange={onTemplateSelect}
        defaultValue="none"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Select a template</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
              {template.bedrooms && template.bathrooms && (
                <span className="text-muted-foreground ml-2">
                  ({template.bedrooms} bed / {template.bathrooms} bath)
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
