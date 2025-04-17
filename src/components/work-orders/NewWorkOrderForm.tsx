
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const workOrderSchema = z.object({
  type: z.string().min(1, "Type is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  description: z.string().optional(),
  priority: z.string().default("normal"),
  dueDate: z.date().optional(),
  tag: z.string().default("Other"),
  unitId: z.string().optional()
});

type WorkOrderSchemaType = z.infer<typeof workOrderSchema>;

interface NewWorkOrderFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess?: () => void;
}

export function NewWorkOrderForm({ open, onClose, propertyId, onSuccess }: NewWorkOrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const form = useForm<WorkOrderSchemaType>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      type: "",
      unitNumber: "",
      description: "",
      priority: "normal",
      tag: "Other"
    }
  });
  
  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, unit_number")
        .eq("property_id", propertyId);
      
      if (error) {
        console.error("Error fetching units:", error);
        return [];
      }
      
      return data;
    },
    enabled: open
  });
  
  const showUnitSelection = form.watch("tag") === "Major Unit-Specific Repairs";
  
  const createWorkOrderMutation = useMutation({
    mutationFn: async (data: WorkOrderSchemaType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const newWorkOrder = {
        property_id: propertyId,
        type: data.type,
        unit_number: data.unitNumber,
        description: data.description,
        priority: data.priority,
        due_date: data.dueDate ? data.dueDate.toISOString().split('T')[0] : null,
        created_by: user.id,
        tag: data.tag,
        unit_id: data.unitId || null
      };
      
      const { error } = await supabase.from("work_orders").insert(newWorkOrder);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        description: "Work order created successfully"
      });
      form.reset();
      setSelectedDate(undefined);
      onSuccess?.();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
    onError: (error) => {
      console.error("Error creating work order:", error);
      toast({
        description: "Failed to create work order",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (values: WorkOrderSchemaType) => {
    createWorkOrderMutation.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Work Order</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Plumbing, Electrical" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unitNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 101, A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Major Building-Wide Repairs">Major Building-Wide Repairs</SelectItem>
                      <SelectItem value="Major Unit-Specific Repairs">Major Unit-Specific Repairs</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showUnitSelection && (
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            Unit {unit.unit_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          field.onChange(date);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter details about the work needed" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWorkOrderMutation.isPending}
              >
                {createWorkOrderMutation.isPending ? "Creating..." : "Create Work Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
