import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Trash2 } from "lucide-react";

const unitTemplateFormSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  square_feet: z.string().optional(),
  monthly_rent: z.string().optional(),
  rent_due_date: z.string().default("1"),
  floor_number: z.string().optional(),
  unit_type: z.string().optional(),
});

type UnitTemplateFormValues = z.infer<typeof unitTemplateFormSchema>;

interface UnitTemplatesDialogProps {
  propertyId: string;
  buttonText?: string;
}

export function UnitTemplatesDialog({
  propertyId,
  buttonText = "Manage Unit Templates",
}: UnitTemplatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UnitTemplateFormValues>({
    resolver: zodResolver(unitTemplateFormSchema),
    defaultValues: {
      name: "",
      bedrooms: "",
      bathrooms: "",
      square_feet: "",
      monthly_rent: "",
      rent_due_date: "1",
      floor_number: "",
      unit_type: "",
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

  const { data: templates = [], refetch } = useQuery({
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

  const onSubmit = async (values: UnitTemplateFormValues) => {
    try {
      if (!propertyId) {
        throw new Error("Property ID is missing");
      }

      if (!userProfile?.organization_id) {
        throw new Error("No organization found");
      }

      const templateData = {
        name: values.name,
        property_id: propertyId,
        organization_id: userProfile.organization_id,
        bedrooms: values.bedrooms ? parseInt(values.bedrooms) : null,
        bathrooms: values.bathrooms ? parseFloat(values.bathrooms) : null,
        square_feet: values.square_feet ? parseInt(values.square_feet) : null,
        monthly_rent: values.monthly_rent ? parseFloat(values.monthly_rent) : null,
        rent_due_date: values.rent_due_date ? parseInt(values.rent_due_date) : 1,
        floor_number: values.floor_number ? parseInt(values.floor_number) : null,
        unit_type: values.unit_type || null,
      };

      const { error } = await supabase
        .from("unit_templates")
        .insert(templateData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully",
      });

      form.reset();
      setIsCreating(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["unit-templates"] });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("unit_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      refetch();
      queryClient.invalidateQueries({ queryKey: ["unit-templates"] });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardList className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unit Templates</DialogTitle>
          <DialogDescription>
            Create and manage unit templates to quickly apply common configurations
            when creating new units.
          </DialogDescription>
        </DialogHeader>

        {isCreating ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="square_feet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthly_rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rent_due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Due Date</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a date" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day} of each month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="unit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="loft">Loft</SelectItem>
                        <SelectItem value="duplex">Duplex</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Bedrooms</TableHead>
                    <TableHead>Bathrooms</TableHead>
                    <TableHead>Sq Ft</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.bedrooms || "-"}</TableCell>
                        <TableCell>{template.bathrooms || "-"}</TableCell>
                        <TableCell>{template.square_feet || "-"}</TableCell>
                        <TableCell>
                          {template.monthly_rent
                            ? `$${template.monthly_rent.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell>{template.unit_type || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No templates found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => setIsCreating(true)}>
                Create New Template
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
