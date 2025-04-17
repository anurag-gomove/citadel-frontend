
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { HomeIcon, ReceiptIcon, WrenchIcon } from "lucide-react";

interface Bill {
  id: string;
  amount: number;
  tag: string | null;
  due_date: string;
  [key: string]: any;
}

interface BillsSummaryProps {
  bills: Bill[];
  selectedYear: string;
}

interface CategorySummary {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export const BillsSummary = ({ bills, selectedYear }: BillsSummaryProps) => {
  // Define color scheme for categories
  const categoryColors = {
    "Major Building-Wide Repairs": "#10b981", // emerald-500
    "Major Unit-Specific Repairs": "#3b82f6", // blue-500
    "Other": "#8b5cf6", // violet-500
  };

  const categoryIcons = {
    "Major Building-Wide Repairs": <HomeIcon className="h-5 w-5" />,
    "Major Unit-Specific Repairs": <WrenchIcon className="h-5 w-5" />,
    "Other": <ReceiptIcon className="h-5 w-5" />,
  };

  // Calculate totals by category
  const categorySummary = useMemo(() => {
    const filteredBills = selectedYear === "all" 
      ? bills 
      : bills.filter(bill => {
          const billDate = new Date(bill.due_date);
          return billDate.getFullYear().toString() === selectedYear;
        });

    // Group by category and sum amounts
    const categories: Record<string, number> = {};
    let totalAmount = 0;

    filteredBills.forEach(bill => {
      const category = bill.tag || "Other";
      categories[category] = (categories[category] || 0) + Number(bill.amount);
      totalAmount += Number(bill.amount);
    });

    // Format the data for the charts
    const summaryData: CategorySummary[] = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name as keyof typeof categoryColors] || "#6b7280", // gray-500 as fallback
      icon: categoryIcons[name as keyof typeof categoryIcons] || <ReceiptIcon className="h-5 w-5" />
    }));

    return {
      categories: summaryData,
      total: totalAmount
    };
  }, [bills, selectedYear]);

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Expenses by Category</h3>
          <div className="text-sm text-muted-foreground">
            {selectedYear === "all" ? "All Time" : selectedYear}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categorySummary.categories.map((category) => (
            <div 
              key={category.name} 
              className="flex items-center p-3 rounded-lg border"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div style={{ color: category.color }}>
                  {category.icon}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-lg font-bold">{formatCurrency(category.value)}</p>
              </div>
            </div>
          ))}

          {categorySummary.categories.length === 0 && (
            <div className="col-span-3 text-center p-6 text-muted-foreground">
              No bill data available for the selected period.
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatCurrency(categorySummary.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
