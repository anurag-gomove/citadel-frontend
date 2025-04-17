
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MaintenanceRequest {
  id: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  property_id: string;
  unit_id?: string;
  tenant_id?: string;
  title: string;
  due_date?: string | null;
}

interface EditMaintenanceRequestDialogProps {
  open: boolean;
  onClose: () => void;
  request: MaintenanceRequest | null;
}

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.string(),
  unit_id: z.string({
    required_error: "Unit is required",
  }),
  due_date: z.date().optional().nullable(),
});

export function EditMaintenanceRequestDialog({
  open,
  onClose,
  request,
}: EditMaintenanceRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: request?.title || "",
      description: request?.description || "",
      priority: request?.priority || "medium",
      unit_id: request?.unit_id || "",
      due_date: request?.due_date ? new Date(request.due_date) : null,
    },
  });

  // Query to fetch units for this property
  const { data: units } = useQuery({
    queryKey: ["propertyUnits", request?.property_id],
    queryFn: async () => {
      if (!request?.property_id) return [];
      
      const { data, error } = await supabase
        .from("units")
        .select("id, unit_number")
        .eq("property_id", request.property_id)
        .order("unit_number");

      if (error) throw error;
      return data || [];
    },
    enabled: !!request?.property_id && open,
  });

  React.useEffect(() => {
    if (request) {
      form.reset({
        title: request.title,
        description: request.description || "",
        priority: request.priority,
        unit_id: request.unit_id || "",
        due_date: request.due_date ? new Date(request.due_date) : null,
      });
    }
  }, [request, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!request) return;
      
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          unit_id: values.unit_id,
          due_date: values.due_date ? values.due_date.toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests", request?.property_id] });
      toast({
        title: "Request updated",
        description: "Maintenance request has been updated successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Maintenance Request</DialogTitle>
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
                    <Input {...field} />
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
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units?.map((unit) => (
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
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the maintenance issue"
                      className="h-24"
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
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
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
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
