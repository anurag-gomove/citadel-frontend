
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormBuilderHeaderProps {
  formName: string;
  setFormName: (name: string) => void;
  formCategory: string;
  setFormCategory: (category: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function FormBuilderHeader({
  formName,
  setFormName,
  formCategory,
  setFormCategory,
  onSave,
  onCancel,
  isSaving,
}: FormBuilderHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Create New Form</h1>
          <p className="text-muted-foreground">
            Drag and drop fields to design your form
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      <div className="col-span-12 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Form Name</label>
            <Input
              placeholder="Enter form name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={formCategory} onValueChange={setFormCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lease Agreements">Lease Agreements</SelectItem>
                <SelectItem value="Maintenance Forms">Maintenance Forms</SelectItem>
                <SelectItem value="Legal Documents">Legal Documents</SelectItem>
                <SelectItem value="Application Forms">Application Forms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
