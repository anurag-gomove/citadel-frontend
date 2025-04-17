
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format-currency";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GST_RATE = 0.05;
const QST_RATE = 0.09975;

const billSchema = z.object({
  amount: z.number(),
  purchaseDate: z.string(),
  description: z.string().optional(),
  file: z.any().optional(),
  tag: z.string().default("Other"),
  unitId: z.string().optional(),
  taxExempt: z.boolean().default(false)
});

type BillSchemaType = z.infer<typeof billSchema>;

interface AddBillFormProps {
  propertyId: string;
  units: Array<{ id: string; unit_number: string }>;
  onBillAdded: () => void;
}

export const AddBillForm = ({ propertyId, units, onBillAdded }: AddBillFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<BillSchemaType>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      amount: 0,
      purchaseDate: new Date().toISOString(),
      description: "",
      file: undefined,
      tag: "Other",
      taxExempt: false
    },
  });

  const { reset, watch } = form;
  const selectedTag = watch("tag");
  const amount = watch("amount");
  const taxExempt = watch("taxExempt");

  const gstAmount = taxExempt ? 0 : amount * GST_RATE;
  const qstAmount = taxExempt ? 0 : amount * QST_RATE;
  const totalWithTaxes = amount + gstAmount + qstAmount;

  const addBillMutation = useMutation({
    mutationFn: async (formData: BillSchemaType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let attachmentUrl = null;
      if (formData.file instanceof File) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        try {
          // Attempt to upload the file directly without checking for bucket existence
          const { error: uploadError, data } = await supabase.storage
            .from('bills')
            .upload(fileName, formData.file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            throw new Error(`File upload failed: ${uploadError.message}`);
          }
          
          attachmentUrl = fileName;
        } catch (error) {
          console.error("Exception during file upload:", error);
          throw error;
        }
      }

      const gstAmount = formData.taxExempt ? 0 : formData.amount * GST_RATE;
      const qstAmount = formData.taxExempt ? 0 : formData.amount * QST_RATE;
      const totalWithTaxes = formData.amount + gstAmount + qstAmount;

      const { error } = await supabase.from("property_bills").insert({
        property_id: propertyId,
        amount: totalWithTaxes,
        due_date: formData.purchaseDate,
        description: formData.description || '',
        attachment_url: attachmentUrl,
        created_by: user.id,
        paid: true,
        tag: formData.tag,
        unit_id: formData.tag === "Major Unit-Specific Repairs" ? formData.unitId : null,
        gst_amount: formData.taxExempt ? null : gstAmount,
        qst_amount: formData.taxExempt ? null : qstAmount
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        description: "Bill added successfully"
      });
      reset();
      setSelectedFileName(null);
      onBillAdded();
    },
    onError: (error) => {
      console.error("Error adding bill:", error);
      toast({
        title: "Failed to add bill",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: BillSchemaType) => {
    addBillMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
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

        {selectedTag === "Major Unit-Specific Repairs" && (
          <FormField
            control={form.control}
            name="unitId"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel>Associated Unit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
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
          name="amount"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel>Amount (Before Taxes)</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  inputMode="decimal"
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    field.onChange(parseFloat(value) || 0);
                  }}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxExempt"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 text-left">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Tax exempt
                </FormLabel>
                <FormDescription>
                  Check this if no taxes should be applied
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {!taxExempt && (
          <div className="space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (5%)</span>
              <span>{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">QST (9.975%)</span>
              <span>{formatCurrency(qstAmount)}</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Total with taxes</span>
              <span>{formatCurrency(totalWithTaxes)}</span>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col text-left">
              <FormLabel>Purchase Date</FormLabel>
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
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      field.onChange(date?.toISOString());
                    }}
                    initialFocus
                    className="pointer-events-auto"
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
            <FormItem className="text-left">
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description of bill (optional)" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem className="text-left">
              <FormLabel>Attachment</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          onChange(file);
                          setSelectedFileName(file.name);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  {selectedFileName && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFileName}
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={addBillMutation.isPending}
        >
          {addBillMutation.isPending ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Bill"
          )}
        </Button>
      </form>
    </Form>
  );
};
