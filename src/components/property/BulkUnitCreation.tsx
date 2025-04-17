
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnitTemplate } from "@/types/unit-template";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from 'lucide-react';

interface BulkUnitCreationProps {
  propertyId: string;
}

interface BulkCreationUnit {
  templateId: string;
  templateName: string;
  startingNumber: string;
  count: string;
  prefix: string;
  suffix: string;
}

const initialUnitData: BulkCreationUnit = {
  templateId: "",
  templateName: "",
  startingNumber: "1",
  count: "1",
  prefix: "",
  suffix: "",
};

export function BulkUnitCreation({ propertyId }: BulkUnitCreationProps) {
  const [open, setOpen] = useState(false);
  const [bulkUnits, setBulkUnits] = useState<BulkCreationUnit[]>([]);
  const [currentUnit, setCurrentUnit] = useState<BulkCreationUnit>(initialUnitData);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [unitPreviews, setUnitPreviews] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["unit-templates", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_templates")
        .select("*")
        .eq("property_id", propertyId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const bulkCreateUnits = useMutation({
    mutationFn: async () => {
      // Get existing unit numbers to check for duplicates
      const { data: existingUnits } = await supabase
        .from("units")
        .select("unit_number")
        .eq("property_id", propertyId);
      
      const existingUnitNumbers = new Set(existingUnits?.map(u => u.unit_number) || []);
      
      // Generate all unit numbers and check for conflicts
      const allUnitNumbers: string[] = [];
      const unitsToCreate: any[] = [];
      
      for (const bulkUnit of bulkUnits) {
        const template = templates.find(t => t.id === bulkUnit.templateId);
        if (!template) continue;
        
        const startNum = parseInt(bulkUnit.startingNumber);
        const count = parseInt(bulkUnit.count);
        
        for (let i = 0; i < count; i++) {
          const unitNumber = `${bulkUnit.prefix}${startNum + i}${bulkUnit.suffix}`;
          
          if (existingUnitNumbers.has(unitNumber) || allUnitNumbers.includes(unitNumber)) {
            throw new Error(`Unit number ${unitNumber} already exists`);
          }
          
          allUnitNumbers.push(unitNumber);
          
          unitsToCreate.push({
            property_id: propertyId,
            organization_id: userProfile?.organization_id,
            unit_number: unitNumber,
            square_feet: template.square_feet,
            bedrooms: template.bedrooms,
            bathrooms: template.bathrooms,
            monthly_rent: template.monthly_rent,
            rent_due_date: template.rent_due_date,
            status: 'vacant'
          });
        }
      }
      
      if (unitsToCreate.length === 0) {
        throw new Error("No units to create");
      }
      
      const { error } = await supabase
        .from("units")
        .insert(unitsToCreate);
        
      if (error) throw error;
      
      return unitsToCreate.length;
    },
    onSuccess: (count) => {
      toast({
        title: "Success",
        description: `${count} units were created successfully`,
      });
      setOpen(false);
      setBulkUnits([]);
      queryClient.invalidateQueries({ queryKey: ["property-units", propertyId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create units",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUnit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentUnit(prev => ({
        ...prev,
        templateId: templateId,
        templateName: template.name
      }));
    }
  };

  const addTemplateToList = () => {
    if (!currentUnit.templateId) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }
    
    if (parseInt(currentUnit.count) < 1) {
      toast({
        title: "Error",
        description: "Count must be at least 1",
        variant: "destructive",
      });
      return;
    }
    
    setBulkUnits(prev => [...prev, currentUnit]);
    setCurrentUnit(initialUnitData);
  };

  const removeTemplateFromList = (index: number) => {
    setBulkUnits(prev => prev.filter((_, i) => i !== index));
  };

  const generateUnitPreviews = () => {
    const previews: string[] = [];
    
    for (const bulkUnit of bulkUnits) {
      const startNum = parseInt(bulkUnit.startingNumber);
      const count = parseInt(bulkUnit.count);
      
      for (let i = 0; i < count; i++) {
        previews.push(`${bulkUnit.prefix}${startNum + i}${bulkUnit.suffix}`);
      }
    }
    
    setUnitPreviews(previews);
    setPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Bulk Create Units
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bulk Create Units</DialogTitle>
            <DialogDescription>
              Create multiple units at once using unit templates.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-4">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates found. Please create templates first.</p>
            </div>
          ) : (
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Select Template</Label>
                  <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center mb-2">
                        <input
                          type="radio"
                          id={template.id}
                          name="template"
                          className="mr-2"
                          checked={currentUnit.templateId === template.id}
                          onChange={() => handleTemplateChange(template.id)}
                        />
                        <label htmlFor={template.id} className="text-sm cursor-pointer">
                          {template.name} 
                          {template.bedrooms && template.bathrooms && (
                            <span className="text-muted-foreground ml-2">
                              ({template.bedrooms} bed / {template.bathrooms} bath)
                            </span>
                          )}
                          {template.monthly_rent && (
                            <span className="text-muted-foreground ml-2">
                              - ${template.monthly_rent}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prefix">Unit Number Prefix</Label>
                    <Input
                      id="prefix"
                      name="prefix"
                      value={currentUnit.prefix}
                      onChange={handleInputChange}
                      placeholder="e.g. A-"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="suffix">Unit Number Suffix</Label>
                    <Input
                      id="suffix"
                      name="suffix"
                      value={currentUnit.suffix}
                      onChange={handleInputChange}
                      placeholder="e.g. -W"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startingNumber">Starting Number</Label>
                    <Input
                      id="startingNumber"
                      name="startingNumber"
                      type="number"
                      min="1"
                      value={currentUnit.startingNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="count">Number of Units</Label>
                    <Input
                      id="count"
                      name="count"
                      type="number"
                      min="1"
                      value={currentUnit.count}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button type="button" onClick={addTemplateToList} className="mt-2">
                  Add to List
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>Units to Create</Label>
                {bulkUnits.length > 0 ? (
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulkUnits.map((unit, index) => (
                          <TableRow key={index}>
                            <TableCell>{unit.templateName}</TableCell>
                            <TableCell>
                              {unit.prefix}[{unit.startingNumber}-{parseInt(unit.startingNumber) + parseInt(unit.count) - 1}]{unit.suffix}
                            </TableCell>
                            <TableCell>{unit.count}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeTemplateFromList(index)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    No units added yet
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {bulkUnits.length > 0 && (
              <Button variant="outline" onClick={generateUnitPreviews} className="mr-auto">
                Preview
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => bulkCreateUnits.mutate()} disabled={bulkUnits.length === 0}>
              Create Units
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Unit Number Preview</DialogTitle>
            <DialogDescription>
              Here's a preview of the unit numbers that will be created.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2">
            {unitPreviews.map((unitNumber, index) => (
              <div key={index} className="border rounded-md p-2 text-center">
                {unitNumber}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
