
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useUser } from "@supabase/auth-helpers-react"
import { supabase } from "@/integrations/supabase/client"

const formSchema = z.object({
  unit_number: z.string().min(1, {
    message: "Unit number is required.",
  }),
  type: z.string().min(1, {
    message: "Work order type is required.",
  }),
  priority: z.string().min(1, {
    message: "Priority is required.",
  }),
  due_date: z.string().min(1, {
    message: "Due date is required.",
  }),
})

interface NewWorkOrderFormProps {
  property: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
}

export function NewWorkOrderForm({ property, onSuccess }: NewWorkOrderFormProps) {
  const user = useUser();

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from("work_orders").insert({
        property_id: property.id,
        unit_number: values.unit_number,
        type: values.type,
        priority: values.priority,
        due_date: values.due_date,
        created_by: user.id,
        status: 'pending'
      });

      if (error) throw error;

      onSuccess?.();
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit_number: "",
      type: "",
      priority: "",
      due_date: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="unit_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Number</FormLabel>
              <FormControl>
                <Input placeholder="Unit #" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Appliance Repair">Appliance Repair</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
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
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date?.toISOString())
                    }}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
