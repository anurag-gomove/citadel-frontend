import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BillsSummary } from "./bills/BillsSummary";
import { AddBillForm } from "./bills/AddBillForm";
import { EditBillForm } from "./bills/EditBillForm";
import { BillHistoryTable } from "./bills/BillHistoryTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface PropertyBillsProps {
  propertyId: string;
}

export const PropertyBills = ({ propertyId }: PropertyBillsProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [showAddBillDialog, setShowAddBillDialog] = useState(false);
  const [showEditBillDialog, setShowEditBillDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  const years = useMemo(() => {
    const yearList = [];
    for (let year = 2020; year <= currentYear; year++) {
      yearList.push(year.toString());
    }
    return yearList.reverse();
  }, [currentYear]);

  const { data: bills = [], refetch, isLoading } = useQuery({
    queryKey: ["property-bills", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_bills")
        .select("*")
        .eq("property_id", propertyId);

      if (error) {
        console.error("Error fetching property bills:", error);
        return [];
      }

      return data;
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, unit_number")
        .eq("property_id", propertyId);

      if (error) {
        console.error("Error fetching property units:", error);
        return [];
      }

      return data;
    },
  });

  const filteredBills = useMemo(() => {
    if (!selectedYear || selectedYear === "all") {
      return bills;
    }
    
    return bills.filter(bill => {
      const billDate = new Date(bill.due_date);
      return billDate.getFullYear().toString() === selectedYear;
    });
  }, [bills, selectedYear]);

  const handleBillAdded = () => {
    refetch();
    setShowAddBillDialog(false);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowEditBillDialog(true);
  };

  const handleBillUpdated = () => {
    refetch();
    setShowEditBillDialog(false);
    setSelectedBill(null);
  };

  return (
    <div className="w-full mx-auto py-0">
      {/* Top action buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="year-filter" className="mr-2">Filter by Year:</Label>
          <Select
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setShowAddBillDialog(true)}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Bill
        </Button>
      </div>

      {/* Bills Summary Section */}
      <BillsSummary bills={bills} selectedYear={selectedYear} />

      {/* Bill History Table Section */}
      <div className="space-y-6 mt-6">
        <BillHistoryTable 
          bills={bills}
          filteredBills={filteredBills}
          isLoading={isLoading}
          units={units}
          onEditBill={handleEditBill}
        />
      </div>

      {/* Add Bill Dialog */}
      <Dialog open={showAddBillDialog} onOpenChange={setShowAddBillDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
          </DialogHeader>
          <AddBillForm 
            propertyId={propertyId} 
            units={units} 
            onBillAdded={handleBillAdded} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog open={showEditBillDialog} onOpenChange={setShowEditBillDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <EditBillForm 
              propertyId={propertyId} 
              units={units} 
              bill={selectedBill}
              onBillUpdated={handleBillUpdated} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
