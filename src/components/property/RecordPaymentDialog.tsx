
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit } from "lucide-react";
import { formatLocalDate } from "@/utils/timezone";

type PaymentMethod = "cash" | "check" | "bank_transfer" | "credit_card" | "debit_card" | "other";

interface Payment {
  id: string;
  expected_amount: number;
  paid_amount: number;
  payment_method: PaymentMethod | null;
  payment_date: string | null;
  notes: string | null;
  payment_status: string;
  balance_due?: number;
}

interface RecordPaymentDialogProps {
  payment: Payment;
}

export const RecordPaymentDialog = ({ payment }: RecordPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [notes, setNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate remaining balance
  const remainingBalance = payment.balance_due !== undefined ? 
    payment.balance_due : 
    payment.expected_amount - payment.paid_amount;

  // Set initial amount to remaining balance or current paid amount based on mode
  const handleDialogOpen = (open: boolean, isEdit = false) => {
    if (open) {
      setEditMode(isEdit);
      if (isEdit) {
        // In edit mode, set amount to current paid amount
        setAmount(payment.paid_amount.toString());
        setMethod(payment.payment_method || "");
        setNotes(payment.notes || "");
      } else {
        // In record mode, set amount to remaining balance
        setAmount(remainingBalance.toString());
        setMethod("");
        setNotes("");
      }
    }
    setOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Get organization_id for RLS policy
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      if (!profile?.organization_id) {
        throw new Error("No organization ID found");
      }

      let newPaidAmount, newBalanceDue, paymentStatus;

      if (editMode) {
        // In edit mode, replace the current paid amount
        newPaidAmount = numericAmount;
        newBalanceDue = payment.expected_amount - numericAmount;
        paymentStatus = newPaidAmount >= payment.expected_amount ? "paid" : 
                     newPaidAmount > 0 ? "partial" : "pending";
      } else {
        // In record mode, add to the current paid amount
        newPaidAmount = payment.paid_amount + numericAmount;
        newBalanceDue = payment.expected_amount - newPaidAmount;
        paymentStatus = newPaidAmount >= payment.expected_amount ? "paid" : "partial";
      }

      const { error } = await supabase
        .from("unit_payments")
        .update({
          paid_amount: newPaidAmount,
          balance_due: newBalanceDue,
          payment_status: paymentStatus,
          payment_method: method || null,
          payment_date: new Date().toISOString(),
          notes: notes || null,
          organization_id: profile.organization_id
        })
        .eq("id", payment.id);

      if (error) throw error;

      toast({
        title: editMode ? "Payment updated" : "Payment recorded",
        description: editMode 
          ? `Successfully updated payment to $${numericAmount.toLocaleString()}`
          : `Successfully recorded payment of $${numericAmount.toLocaleString()}`,
      });

      queryClient.invalidateQueries({ queryKey: ["property-payments"] });
      setOpen(false);
    } catch (error) {
      console.error(editMode ? "Error updating payment:" : "Error recording payment:", error);
      toast({
        title: "Error",
        description: editMode ? "Failed to update payment" : "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Get organization_id for RLS policy
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      if (!profile?.organization_id) {
        throw new Error("No organization ID found");
      }

      // Reset payment information
      const { error } = await supabase
        .from("unit_payments")
        .update({
          paid_amount: 0,
          balance_due: payment.expected_amount,
          payment_status: "pending",
          payment_method: null,
          payment_date: null,
          notes: null,
          organization_id: profile.organization_id
        })
        .eq("id", payment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment record has been reset",
      });

      queryClient.invalidateQueries({ queryKey: ["property-payments"] });
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment record",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={(o) => handleDialogOpen(o)}>
        <DialogTrigger asChild>
          <Button variant="outline">
            {payment.payment_status === "partial" ? "Complete Payment" : payment.paid_amount > 0 ? "Record Payment" : "Record Payment"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Payment" : payment.payment_status === "partial" ? "Complete Payment" : "Record Payment"}
            </DialogTitle>
            {payment.payment_status === "partial" && !editMode && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Current payment status: <span className="font-medium text-yellow-600 dark:text-yellow-400">Partial</span></p>
                <p>Amount paid so far: <span className="font-medium">${payment.paid_amount.toLocaleString()}</span></p>
                <p>Remaining balance: <span className="font-medium text-rose-600 dark:text-rose-400">${remainingBalance.toLocaleString()}</span></p>
              </div>
            )}
            {editMode && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Expected amount: <span className="font-medium">${payment.expected_amount.toLocaleString()}</span></p>
                <p>Current payment: <span className="font-medium">${payment.paid_amount.toLocaleString()}</span></p>
                <p>Enter the corrected payment amount:</p>
              </div>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={editMode ? "Enter corrected amount" : 
                payment.payment_status === "partial" ? `Remaining: $${remainingBalance}` : "Enter payment amount"}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormInput
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this payment"
            />
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editMode ? "Update Payment" : "Record Payment"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {payment.paid_amount > 0 && (
        <>
          <Dialog onOpenChange={(o) => handleDialogOpen(o, true)}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="bg-primary/10 hover:bg-primary/20 text-primary">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="bg-primary/10 hover:bg-primary/20 text-primary">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Payment Record?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the recorded payment of ${payment.paid_amount.toLocaleString()} and reset the payment status to pending. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePayment} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Reset Payment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
