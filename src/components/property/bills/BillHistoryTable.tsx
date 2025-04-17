
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Bill {
  id: string;
  amount: number;
  due_date: string;
  tag: string | null;
  description: string | null;
  unit_id: string | null;
  attachment_url: string | null;
  [key: string]: any;
}

interface Unit {
  id: string;
  unit_number: string;
}

interface BillHistoryTableProps {
  bills: Bill[];
  filteredBills: Bill[];
  isLoading: boolean;
  units: Unit[];
  onEditBill: (bill: Bill) => void;
}

export const BillHistoryTable = ({
  bills,
  filteredBills,
  isLoading,
  units,
  onEditBill,
}: BillHistoryTableProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-left">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bill History</CardTitle>
            <CardDescription>
              All bills associated with this property.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <ReloadIcon className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            {bills.length === 0 
              ? "No bills recorded yet. Add your first bill to get started."
              : "No bills found for the selected year."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>${bill.amount}</TableCell>
                    <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.tag || "Other"}</TableCell>
                    <TableCell>{bill.description || "-"}</TableCell>
                    <TableCell>
                      {bill.unit_id ? (
                        units.find(unit => unit.id === bill.unit_id)?.unit_number || "-"
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {bill.attachment_url ? (
                        <a 
                          href={`${supabase.storage.from('bills').getPublicUrl(bill.attachment_url).data.publicUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "No attachment"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditBill(bill)}
                        title="Edit Bill"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
