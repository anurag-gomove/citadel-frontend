import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, isWithinInterval, startOfYear, endOfYear, parse, addMonths, setDate, isBefore, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { UnitPayment, PaymentStatus, Unit } from "@/types/database";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, User, Trash2, CreditCard, CalendarIcon, X } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { formatPaymentForDialog } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isPaymentLate } from "@/utils/timezone";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PropertyPaymentsProps {
  propertyId: string;
}

interface UnitWithJoinedData extends Omit<Unit, 'status'> {
  status: string;
  actual_monthly_rent?: string;
  unit_number: string;
  tenant?: {
    id: string;
    lease_start_date: string | null;
    lease_end_date: string | null;
    first_name?: string;
    last_name?: string;
  };
}

interface ExtendedUnitPayment extends UnitPayment {
  unit_number?: string;
  tenant_name?: string;
  units?: {
    unit_number: string;
    tenant_id?: string;
    tenant?: {
      first_name: string;
      last_name: string;
    };
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "money_order", label: "Money Order" },
  { value: "other", label: "Other" }
];

const bulkPaymentSchema = z.object({
  payment_method: z.string().min(1, "Payment method is required"),
  payment_date: z.date({ required_error: "Payment date is required" }),
  notes: z.string().optional()
});

type BulkPaymentFormValues = z.infer<typeof bulkPaymentSchema>;

export function PropertyPayments({ propertyId }: PropertyPaymentsProps) {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  
  const form = useForm<BulkPaymentFormValues>({
    resolver: zodResolver(bulkPaymentSchema),
    defaultValues: {
      payment_method: "cash",
      payment_date: new Date(),
      notes: ""
    }
  });
  
  const yearOptions = useMemo(() => {
    const years = [];
    for (let year = selectedYear - 2; year <= selectedYear + 2; year++) {
      years.push(year);
    }
    return years;
  }, [selectedYear]);
  
  const navigateYear = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedYear(prev => prev + 1);
    }
  };

  const { data: unitsWithTenants = [] } = useQuery({
    queryKey: ["units-with-tenants-leases", propertyId],
    queryFn: async (): Promise<UnitWithJoinedData[]> => {
      console.log("Fetching units with tenants for property:", propertyId);
      const { data, error } = await supabase
        .from("units")
        .select(`
          *,
          tenant:tenants!units_tenant_id_fkey (
            id,
            lease_start_date,
            lease_end_date,
            first_name,
            last_name
          )
        `)
        .eq("property_id", propertyId)
        .not("tenant_id", "is", null);

      if (error) {
        console.error("Error fetching units with tenants:", error);
        throw error;
      }
      
      console.log("Fetched units with tenants:", data);
      return (data || []) as UnitWithJoinedData[];
    }
  });

  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ["property-payments", propertyId, selectedYear],
    queryFn: async (): Promise<ExtendedUnitPayment[]> => {
      const yearStart = startOfYear(new Date(selectedYear, 0, 1));
      const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
      
      console.log("Fetching payments for property:", propertyId);
      
      const { data, error } = await supabase
        .from("unit_payments")
        .select(`
          *, 
          units(
            unit_number, 
            tenant_id
          )
        `)
        .eq("property_id", propertyId);

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }

      console.log("Raw payment data:", data);
      
      const tenantIds = data
        .filter(payment => payment.units?.tenant_id)
        .map(payment => payment.units?.tenant_id)
        .filter(Boolean) as string[];
      
      let tenantDetails: Record<string, { first_name: string, last_name: string }> = {};
      
      if (tenantIds.length > 0) {
        console.log("Fetching tenant details for IDs:", tenantIds);
        const { data: tenantsData, error: tenantsError } = await supabase
          .from("tenants")
          .select("id, first_name, last_name")
          .in("id", tenantIds);
          
        if (tenantsError) {
          console.error("Error fetching tenant details:", tenantsError);
        } else if (tenantsData) {
          console.log("Fetched tenant details:", tenantsData);
          tenantsData.forEach(tenant => {
            tenantDetails[tenant.id] = {
              first_name: tenant.first_name,
              last_name: tenant.last_name
            };
          });
        }
      }

      const paymentsToUpdate: { 
        id: string, 
        payment_status: PaymentStatus,
        expected_amount: number,
        paid_amount: number,
        balance_due: number
      }[] = [];
      
      const enhancedPayments = (data || [])
        .map(payment => {
          const tenantId = payment.units?.tenant_id;
          const tenantInfo = tenantId ? tenantDetails[tenantId] : null;
          
          const isLate = isPaymentLate(payment.due_date) && 
                        payment.payment_status === 'pending' &&
                        payment.balance_due > 0;
          
          if (isLate) {
            paymentsToUpdate.push({
              id: payment.id,
              payment_status: 'late',
              expected_amount: payment.expected_amount,
              paid_amount: payment.paid_amount,
              balance_due: payment.balance_due
            });
          }
          
          return {
            ...payment,
            unit_number: payment.units?.unit_number || 'N/A',
            tenant_name: tenantInfo 
              ? `${tenantInfo.first_name} ${tenantInfo.last_name}`
              : 'No tenant',
            payment_status: isLate ? 'late' as PaymentStatus : payment.payment_status as PaymentStatus,
            payment_method: payment.payment_method as ExtendedUnitPayment['payment_method']
          };
        })
        .filter(payment => {
          const dueDate = new Date(payment.due_date);
          return isWithinInterval(dueDate, { start: yearStart, end: yearEnd });
        });
      
      if (paymentsToUpdate.length > 0) {
        console.log("Updating late payment statuses:", paymentsToUpdate);
        
        const { error: updateError } = await supabase
          .from("unit_payments")
          .upsert(paymentsToUpdate);
          
        if (updateError) {
          console.error("Error updating late payments:", updateError);
        }
      }
        
      console.log("Enhanced payments with tenant names:", enhancedPayments);
      return enhancedPayments;
    }
  });

  const generateRentPaymentsMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw profileError;
        }
        
        if (!profile?.organization_id) {
          console.error("No organization ID found in user profile");
          throw new Error("No organization ID found");
        }

        const paymentEntries = [];
        
        console.log("Generating rent payments for units:", unitsWithTenants.length);
        
        for (const unit of unitsWithTenants) {
          if (!unit.tenant_id || !unit.actual_monthly_rent || !unit.rent_due_date) {
            console.log(`Skipping unit ${unit.unit_number}: missing tenant, rent or due date`);
            continue;
          }
          
          const actualRent = parseFloat(unit.actual_monthly_rent);
          if (isNaN(actualRent) || actualRent <= 0) {
            console.log(`Skipping unit ${unit.unit_number}: invalid rent amount ${unit.actual_monthly_rent}`);
            continue;
          }
          
          const leaseStartDate = unit.tenant?.lease_start_date ? new Date(unit.tenant.lease_start_date) : null;
          const leaseEndDate = unit.tenant?.lease_end_date ? new Date(unit.tenant.lease_end_date) : null;
          
          if (!leaseStartDate) {
            console.log(`Skipping unit ${unit.unit_number}: no lease start date`);
            continue;
          }
          
          console.log(`Processing unit ${unit.unit_number} with lease: ${leaseStartDate} to ${leaseEndDate}`);
          
          const rentDueDay = Number(unit.rent_due_date);
          let firstRentDueDate = new Date(leaseStartDate);
          firstRentDueDate.setDate(rentDueDay);
          
          if (leaseStartDate.getDate() > rentDueDay) {
            firstRentDueDate = addMonths(firstRentDueDate, 1);
          }
          
          let currentDueDate = firstRentDueDate;
          const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
          const endDate = leaseEndDate && isBefore(leaseEndDate, yearEnd) ? leaseEndDate : yearEnd;
          
          console.log(`Calculating payments from ${firstRentDueDate} to ${endDate}`);
          
          while (isBefore(currentDueDate, endDate) || currentDueDate.getTime() === endDate.getTime()) {
            const existingPayment = payments.find(p => 
              p.unit_id === unit.id && 
              new Date(p.due_date).getMonth() === currentDueDate.getMonth() &&
              new Date(p.due_date).getFullYear() === currentDueDate.getFullYear()
            );
            
            if (!existingPayment && 
                currentDueDate.getFullYear() === selectedYear &&
                !isBefore(currentDueDate, firstRentDueDate)) {
              console.log(`Adding payment entry for unit ${unit.unit_number} due on ${currentDueDate}`);
              
              paymentEntries.push({
                property_id: propertyId,
                unit_id: unit.id,
                expected_amount: actualRent,
                paid_amount: 0,
                balance_due: actualRent, // Set the initial balance due
                due_date: currentDueDate.toISOString(),
                payment_status: 'pending' as PaymentStatus,
                organization_id: profile.organization_id // Add the organization_id to satisfy RLS
              });
            } else if (existingPayment) {
              console.log(`Payment already exists for unit ${unit.unit_number} for ${format(currentDueDate, 'MMMM yyyy')}`);
            }
            
            currentDueDate = addMonths(currentDueDate, 1);
          }
        }
        
        if (paymentEntries.length === 0) {
          console.log("No new payments to generate");
          return { message: "No new payments to generate" };
        }
        
        console.log(`Inserting ${paymentEntries.length} payment entries`);
        
        const { error } = await supabase
          .from("unit_payments")
          .insert(paymentEntries);
        
        if (error) {
          console.error("Error inserting payments:", error);
          throw error;
        }
        
        return { message: `Generated ${paymentEntries.length} rent payments successfully` };
      } catch (error) {
        console.error("Error in generateRentPaymentsMutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        description: data.message
      });
      refetch();
    },
    onError: (error) => {
      console.error("Error generating rent payments:", error);
      toast({
        variant: "destructive",
        description: "Failed to generate rent payments: " + (error instanceof Error ? error.message : "Unknown error")
      });
    }
  });

  const deleteYearPaymentsMutation = useMutation({
    mutationFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const yearStart = startOfYear(new Date(selectedYear, 0, 1));
        const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
        
        console.log(`Deleting all payments for property ${propertyId} in year ${selectedYear}`);
        
        const { data, error } = await supabase
          .from("unit_payments")
          .delete()
          .eq("property_id", propertyId)
          .gte("due_date", yearStart.toISOString())
          .lte("due_date", yearEnd.toISOString());
          
        if (error) {
          console.error("Error deleting payments:", error);
          throw error;
        }
        
        return { message: `Successfully deleted all payment records for ${selectedYear}` };
      } catch (error) {
        console.error("Error in deleteYearPaymentsMutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        description: data.message
      });
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting payments:", error);
      toast({
        variant: "destructive",
        description: "Failed to delete payments: " + (error instanceof Error ? error.message : "Unknown error")
      });
    }
  });
  
  const bulkRecordPaymentsMutation = useMutation({
    mutationFn: async (formData: BulkPaymentFormValues) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw profileError;
        }
        
        if (!profile?.organization_id) {
          console.error("No organization ID found in user profile");
          throw new Error("No organization ID found");
        }
        
        const selectedPaymentItems = payments.filter(payment => selectedPayments.includes(payment.id));
        
        if (selectedPaymentItems.length === 0) {
          throw new Error("No payments selected");
        }
        
        const updates = selectedPaymentItems.map(payment => {
          const isPaid = payment.balance_due <= 0;
          const newPaidAmount = payment.expected_amount;
          const newBalanceDue = 0;
          
          return {
            id: payment.id,
            expected_amount: payment.expected_amount,
            paid_amount: newPaidAmount,
            balance_due: newBalanceDue,
            payment_status: 'paid' as PaymentStatus,
            payment_method: formData.payment_method,
            payment_date: formData.payment_date.toISOString(),
            notes: formData.notes || null,
            organization_id: profile.organization_id // Add organization_id to satisfy RLS policies
          };
        });
        
        console.info("Updating payments:", updates);
        
        const { error } = await supabase
          .from("unit_payments")
          .upsert(updates);
          
        if (error) {
          console.error("Error recording bulk payments:", error);
          throw error;
        }
        
        return { 
          message: `Successfully recorded ${updates.length} payments`,
          updatedIds: updates.map(u => u.id)
        };
      } catch (error) {
        console.error("Error in bulkRecordPaymentsMutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        description: data.message
      });
      setSelectedPayments([]);
      refetch();
    },
    onError: (error) => {
      console.error("Error recording bulk payments:", error);
      toast({
        variant: "destructive",
        description: "Failed to record payments: " + (error instanceof Error ? error.message : "Unknown error")
      });
    }
  });

  const paymentsByMonth = useMemo(() => {
    const monthlyPayments: Record<string, ExtendedUnitPayment[]> = {};
    
    MONTHS.forEach(month => {
      monthlyPayments[month] = [];
    });
    
    payments.forEach(payment => {
      const dueDate = new Date(payment.due_date);
      const month = MONTHS[dueDate.getMonth()];
      if (monthlyPayments[month]) {
        monthlyPayments[month].push(payment);
      }
    });
    
    return monthlyPayments;
  }, [payments]);
  
  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };
  
  const handleSelectAllInMonth = (month: string, select: boolean) => {
    const monthPayments = paymentsByMonth[month];
    const eligiblePaymentIds = monthPayments
      .filter(payment => payment.payment_status !== 'paid')
      .map(payment => payment.id);
    
    if (select) {
      setSelectedPayments(prev => {
        const newSelection = [...prev];
        eligiblePaymentIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      setSelectedPayments(prev => 
        prev.filter(id => !eligiblePaymentIds.includes(id))
      );
    }
  };
  
  const totalSelectedAmount = useMemo(() => {
    return payments
      .filter(payment => selectedPayments.includes(payment.id))
      .reduce((sum, payment) => sum + payment.balance_due, 0);
  }, [payments, selectedPayments]);
  
  const handleBulkPaymentSubmit = (values: BulkPaymentFormValues) => {
    bulkRecordPaymentsMutation.mutate(values);
  };
  
  const clearSelection = () => {
    setSelectedPayments([]);
  };

  return (
    <div className="w-full space-y-6 relative">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rent Payments</CardTitle>
            <CardDescription>
              View and manage rent payments for {selectedYear}
            </CardDescription>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateRentPaymentsMutation.mutate()}
              disabled={generateRentPaymentsMutation.isPending}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Generate Rent Payments
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon"
                  disabled={deleteYearPaymentsMutation.isPending}
                  title="Delete Year Payments"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Payments for {selectedYear}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all payment records for {selectedYear}. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteYearPaymentsMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateYear("prev")}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Pagination>
                <PaginationContent>
                  {yearOptions.map(year => (
                    <PaginationItem key={year}>
                      <PaginationLink
                        isActive={year === selectedYear}
                        onClick={() => setSelectedYear(year)}
                        className="cursor-pointer"
                      >
                        {year}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
              </Pagination>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateYear("next")}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading payment data...</div>
          ) : (
            <div className={`space-y-8 ${selectedPayments.length > 0 ? "pb-28" : ""}`}>
              {MONTHS.map((month, index) => (
                <div key={month} className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-medium">
                      {month} {selectedYear}
                    </h3>
                    
                    {paymentsByMonth[month].length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`select-all-${month}`}
                          checked={paymentsByMonth[month]
                            .filter(p => p.payment_status !== 'paid')
                            .every(p => selectedPayments.includes(p.id)) &&
                            paymentsByMonth[month].some(p => p.payment_status !== 'paid')}
                          onCheckedChange={(checked) => 
                            handleSelectAllInMonth(month, !!checked)
                          }
                        />
                        <label 
                          htmlFor={`select-all-${month}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          Select all unpaid
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {paymentsByMonth[month].length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Expected Amount</TableHead>
                            <TableHead>Paid Amount</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentsByMonth[month].map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="pr-0">
                                <Checkbox 
                                  checked={selectedPayments.includes(payment.id)}
                                  onCheckedChange={() => togglePaymentSelection(payment.id)}
                                  disabled={payment.payment_status === 'paid'}
                                />
                              </TableCell>
                              <TableCell>
                                {format(new Date(payment.due_date), "MMMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                {payment.unit_number}
                              </TableCell>
                              <TableCell className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {payment.tenant_name}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(payment.expected_amount)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(payment.paid_amount)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(payment.balance_due)}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                  payment.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  payment.payment_status === 'late' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.payment_status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {payment.payment_method ? (
                                  <PaymentMethodBadge method={payment.payment_method} />
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell>
                                {payment.notes || "N/A"}
                              </TableCell>
                              <TableCell>
                                <RecordPaymentDialog payment={formatPaymentForDialog(payment)} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md">
                      No payments due in {month} {selectedYear}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPayments.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-10 dark:bg-gray-900 dark:border-gray-800">
          <div className="max-w-screen-xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleBulkPaymentSubmit)} className="space-y-4 md:space-y-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                      <span className="font-medium">{selectedPayments.length} payments selected</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearSelection}
                        className="h-8 px-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                    
                    <div className="font-semibold text-lg bg-primary/10 px-4 py-2 rounded-lg">
                      Total: {formatCurrency(totalSelectedAmount)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr_auto] gap-3 items-end">
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" /> Payment Method
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethodOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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
                      name="payment_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" /> Payment Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
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
                                selected={field.value}
                                onSelect={field.onChange}
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Payment notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="min-h-10 px-6"
                      disabled={bulkRecordPaymentsMutation.isPending || selectedPayments.length === 0}
                    >
                      Record {selectedPayments.length} Payments
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
