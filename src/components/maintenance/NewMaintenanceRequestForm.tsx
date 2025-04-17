
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  description: z.string().optional(), 
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Priority is required",
  }),
  unit_id: z.string({
    required_error: "Unit is required",
  }),
  due_date: z.date().optional().nullable(),
});

interface NewMaintenanceRequestFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess?: () => void;
}

export function NewMaintenanceRequestForm({
  open,
  onClose,
  propertyId,
  onSuccess,
}: NewMaintenanceRequestFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      unit_id: "",
      due_date: null,
    },
  });

  // Query to fetch units for this property
  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ["propertyUnits", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, unit_number")
        .eq("property_id", propertyId)
        .order("unit_number");

      if (error) throw error;
      return data || [];
    },
    enabled: !!propertyId && open,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      console.log("Submitting maintenance request:", {
        ...values,
        property_id: propertyId,
        user_id: user.id
      });

      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert({
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          status: "todo",
          property_id: propertyId,
          unit_id: values.unit_id,
          created_by: user.id,
          due_date: values.due_date ? values.due_date.toISOString().split('T')[0] : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error creating maintenance request:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Request Created",
        description: "Maintenance request has been created successfully.",
      });
      form.reset();
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating maintenance request:", error);
      toast({
        title: "Error",
        description: `Failed to create request: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    createRequestMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Maintenance Request</DialogTitle>
          <DialogDescription>
            Create a new maintenance request for this property.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief title for the request"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitsLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : units?.length ? (
                        units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            Unit {unit.unit_number}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No units found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the maintenance issue..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
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
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
