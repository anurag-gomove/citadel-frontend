
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
import { CalendarIcon, Upload, File, Trash, Download } from "lucide-react";
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

interface Bill {
  id: string;
  amount: number;
  due_date: string;
  tag: string | null;
  description: string | null;
  unit_id: string | null;
  attachment_url: string | null;
  gst_amount: number | null;
  qst_amount: number | null;
  [key: string]: any;
}

interface EditBillFormProps {
  propertyId: string;
  units: Array<{ id: string; unit_number: string }>;
  onBillUpdated: () => void;
  bill: Bill;
}

export const EditBillForm = ({ propertyId, units, onBillUpdated, bill }: EditBillFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date(bill.due_date));
  const [deleteAttachment, setDeleteAttachment] = useState<boolean>(false);
  
  // Get file name from the attachment URL
  const getFileName = (url: string | null) => {
    if (!url) return "";
    const parts = url.split('/');
    return parts[parts.length - 1];
  };
  
  const hasAttachment = !!bill.attachment_url;
  const attachmentFileName = getFileName(bill.attachment_url);

  // Calculate the original amount before taxes
  const isTaxExempt = !bill.gst_amount && !bill.qst_amount;
  let originalAmount = bill.amount;
  if (!isTaxExempt && (bill.gst_amount || bill.qst_amount)) {
    // If not tax exempt, we need to calculate the original amount before taxes
    originalAmount = bill.amount / (1 + GST_RATE + QST_RATE);
  }

  const form = useForm<BillSchemaType>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      amount: originalAmount,
      purchaseDate: bill.due_date,
      description: bill.description || "",
      file: undefined,
      tag: bill.tag || "Other",
      unitId: bill.unit_id || undefined,
      taxExempt: isTaxExempt
    },
  });

  const { reset, watch } = form;
  const selectedTag = watch("tag");
  const amount = watch("amount");
  const taxExempt = watch("taxExempt");

  const gstAmount = taxExempt ? 0 : amount * GST_RATE;
  const qstAmount = taxExempt ? 0 : amount * QST_RATE;
  const totalWithTaxes = amount + gstAmount + qstAmount;

  const updateBillMutation = useMutation({
    mutationFn: async (formData: BillSchemaType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let attachmentUrl = bill.attachment_url;
      
      // Handle attachment deletion
      if (deleteAttachment) {
        if (attachmentUrl) {
          // Delete the file from storage
          const { error: deleteError } = await supabase.storage
            .from('bills')
            .remove([attachmentUrl]);
            
          if (deleteError) {
            console.error("Error deleting file:", deleteError);
            throw new Error(`File deletion failed: ${deleteError.message}`);
          }
        }
        attachmentUrl = null;
      }
      // Handle new file upload
      else if (formData.file && typeof formData.file === 'object' && 'name' in formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        try {
          // If there's an existing file and we're replacing it, delete it first
          if (attachmentUrl) {
            const { error: deleteError } = await supabase.storage
              .from('bills')
              .remove([attachmentUrl]);
              
            if (deleteError) {
              console.error("Error deleting previous file:", deleteError);
              // Continue with upload even if delete fails
            }
          }
          
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

      const { error } = await supabase.from("property_bills").update({
        amount: totalWithTaxes,
        due_date: formData.purchaseDate,
        description: formData.description || '',
        attachment_url: attachmentUrl,
        tag: formData.tag,
        unit_id: formData.tag === "Major Unit-Specific Repairs" ? formData.unitId : null,
        gst_amount: formData.taxExempt ? null : gstAmount,
        qst_amount: formData.taxExempt ? null : qstAmount
      }).eq('id', bill.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        description: "Bill updated successfully"
      });
      onBillUpdated();
    },
    onError: (error) => {
      console.error("Error updating bill:", error);
      toast({
        title: "Failed to update bill",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: BillSchemaType) => {
    updateBillMutation.mutate(values);
  };
  
  // Function to get public URL for the file
  const getFileUrl = (fileName: string) => {
    if (!fileName) return "";
    return `${supabase.storage.from('bills').getPublicUrl(fileName).data.publicUrl}`;
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
                <div className="space-y-4">
                  {/* Show current attachment if exists */}
                  {hasAttachment && !deleteAttachment && (
                    <div className="p-4 border rounded-md bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <File className="h-5 w-5 text-blue-500" />
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">
                            {attachmentFileName}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(getFileUrl(bill.attachment_url!), '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteAttachment(true)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show mark as deleted message */}
                  {hasAttachment && deleteAttachment && (
                    <div className="p-4 border border-dashed rounded-md bg-red-50 text-red-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trash className="h-5 w-5" />
                          <span className="text-sm">File will be deleted</span>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => setDeleteAttachment(false)}
                        >
                          Undo
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload new file button */}
                  {(!hasAttachment || deleteAttachment || value) && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0];
                          if (file) {
                            onChange(file);
                            if (deleteAttachment) setDeleteAttachment(false);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {value && typeof value === 'object' && 'name' in value ? "Change Selected File" : "Upload New File"}
                    </Button>
                  )}
                  
                  {/* Show selected new file name */}
                  {value && typeof value === 'object' && 'name' in value && (
                    <div className="p-2 border rounded-md bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">
                            {value.name}
                          </span>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onChange(undefined)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
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
          disabled={updateBillMutation.isPending}
        >
          {updateBillMutation.isPending ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Bill"
          )}
        </Button>
      </form>
    </Form>
  );
};
