
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  FilterIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format-currency";
import { Badge } from "@/components/ui/badge";

interface FinancialEntry {
  category: string;
  monthlyAmount: number;
  yearlyAmount: number;
}

interface PropertyFinancialOverviewProps {
  propertyId: string;
}

export const PropertyFinancialOverview = ({ propertyId }: PropertyFinancialOverviewProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [budgetYears, setBudgetYears] = useState<number[]>([]);
  
  const [incomeEntries, setIncomeEntries] = useState<FinancialEntry[]>([
    { category: "Rent", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Parking Fees", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Other Income", monthlyAmount: 0, yearlyAmount: 0 },
  ]);

  const [expenseEntries, setExpenseEntries] = useState<FinancialEntry[]>([
    { category: "Mortgage", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Condo Fees", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Insurance", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Municipal Tax", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "School Tax", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Maintenance", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Utilities", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Property Management", monthlyAmount: 0, yearlyAmount: 0 },
    { category: "Other Expenses", monthlyAmount: 0, yearlyAmount: 0 },
  ]);

  useEffect(() => {
    const fetchBudgetYears = async () => {
      try {
        // Fix: replace .distinct() with manual distinct handling
        const { data, error } = await supabase
          .from('property_transactions')
          .select('budget_year')
          .eq('property_id', propertyId)
          .eq('is_budgeted', true)
          .is('is_one_time', false)
          .not('budget_year', 'is', null);

        if (error) throw error;

        // Handle distinct years manually
        const uniqueYears = new Set<number>();
        data.forEach(row => {
          if (row.budget_year) {
            uniqueYears.add(row.budget_year);
          }
        });
        
        let years = Array.from(uniqueYears);
        
        if (!years.includes(currentYear)) {
          years.push(currentYear);
        }

        years.sort((a, b) => b - a);

        setBudgetYears(years);
      } catch (error) {
        console.error('Error fetching budget years:', error);
      }
    };

    fetchBudgetYears();
  }, [propertyId, currentYear]);

  useEffect(() => {
    const loadBudgetedTransactions = async () => {
      try {
        const { data: transactions, error } = await supabase
          .from('property_transactions')
          .select('*')
          .eq('property_id', propertyId)
          .eq('is_budgeted', true)
          .eq('is_one_time', false)
          .eq('budget_year', selectedYear);

        if (error) throw error;

        if (transactions && transactions.length > 0) {
          const transactionMap = new Map();
          transactions.forEach(t => {
            transactionMap.set(t.category, t.amount);
          });

          setIncomeEntries(prev => prev.map(entry => {
            let amount = 0;
            if (entry.category.toLowerCase().includes('rent')) {
              amount = transactionMap.get('rent') || 0;
            } else if (entry.category.toLowerCase().includes('parking')) {
              amount = transactionMap.get('parking_fees') || 0;
            } else if (entry.category.toLowerCase().includes('other income')) {
              amount = transactionMap.get('other_income') || 0;
            }
            return {
              ...entry,
              monthlyAmount: amount,
              yearlyAmount: amount * 12
            };
          }));

          const categoryToDbMap: { [key: string]: string } = {
            "Mortgage": "mortgage",
            "Condo Fees": "condo_fees",
            "Insurance": "insurance",
            "Municipal Tax": "municipal_tax",
            "School Tax": "school_tax",
            "Maintenance": "maintenance",
            "Utilities": "utilities",
            "Property Management": "property_management",
            "Other Expenses": "other_expense"
          };

          setExpenseEntries(prev => prev.map(entry => {
            const dbCategory = categoryToDbMap[entry.category];
            const amount = transactionMap.get(dbCategory) || 0;
            return {
              ...entry,
              monthlyAmount: amount,
              yearlyAmount: amount * 12
            };
          }));
        } else {
          setIncomeEntries([
            { category: "Rent", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Parking Fees", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Other Income", monthlyAmount: 0, yearlyAmount: 0 },
          ]);
          
          setExpenseEntries([
            { category: "Mortgage", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Condo Fees", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Insurance", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Municipal Tax", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "School Tax", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Maintenance", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Utilities", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Property Management", monthlyAmount: 0, yearlyAmount: 0 },
            { category: "Other Expenses", monthlyAmount: 0, yearlyAmount: 0 },
          ]);
        }
      } catch (error) {
        console.error('Error loading budgeted transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load budget data",
          variant: "destructive",
        });
      }
    };

    if (selectedYear) {
      loadBudgetedTransactions();
    }
  }, [propertyId, selectedYear, toast]);

  const handleMonthlyChange = (
    index: number,
    value: string,
    type: "income" | "expense"
  ) => {
    const numValue = parseFloat(value) || 0;
    const yearlyValue = numValue * 12;

    if (type === "income") {
      const newEntries = [...incomeEntries];
      newEntries[index] = {
        ...newEntries[index],
        monthlyAmount: numValue,
        yearlyAmount: yearlyValue,
      };
      setIncomeEntries(newEntries);
    } else {
      const newEntries = [...expenseEntries];
      newEntries[index] = {
        ...newEntries[index],
        monthlyAmount: numValue,
        yearlyAmount: yearlyValue,
      };
      setExpenseEntries(newEntries);
    }
  };

  const handleYearlyChange = (
    index: number,
    value: string,
    type: "income" | "expense"
  ) => {
    const numValue = parseFloat(value) || 0;
    const monthlyValue = numValue / 12;

    if (type === "income") {
      const newEntries = [...incomeEntries];
      newEntries[index] = {
        ...newEntries[index],
        monthlyAmount: monthlyValue,
        yearlyAmount: numValue,
      };
      setIncomeEntries(newEntries);
    } else {
      const newEntries = [...expenseEntries];
      newEntries[index] = {
        ...newEntries[index],
        monthlyAmount: monthlyValue,
        yearlyAmount: numValue,
      };
      setExpenseEntries(newEntries);
    }
  };

  const calculateTotals = (entries: FinancialEntry[]) => {
    return entries.reduce(
      (acc, entry) => ({
        monthly: acc.monthly + entry.monthlyAmount,
        yearly: acc.yearly + entry.yearlyAmount,
      }),
      { monthly: 0, yearly: 0 }
    );
  };

  const incomeTotals = calculateTotals(incomeEntries);
  const expenseTotals = calculateTotals(expenseEntries);
  const netIncome = {
    monthly: incomeTotals.monthly - expenseTotals.monthly,
    yearly: incomeTotals.yearly - expenseTotals.yearly,
  };

  const expenseToIncomeRatio = incomeTotals.monthly > 0 
    ? (expenseTotals.monthly / incomeTotals.monthly * 100).toFixed(1) 
    : "N/A";

  const annualROI = expenseTotals.yearly > 0 
    ? ((netIncome.yearly / expenseTotals.yearly) * 100).toFixed(1) 
    : "N/A";

  const getFinancialHealthStatus = () => {
    if (incomeTotals.monthly === 0) return "unknown";
    const ratio = expenseTotals.monthly / incomeTotals.monthly;
    
    if (ratio < 0.5) return "excellent";
    if (ratio < 0.7) return "good";
    if (ratio < 0.9) return "fair";
    return "concerning";
  };

  const financialHealth = getFinancialHealthStatus();
  
  const changeYear = (direction: 'next' | 'previous') => {
    const currentIndex = budgetYears.indexOf(selectedYear);
    if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(budgetYears[currentIndex - 1]);
    } else if (direction === 'previous' && currentIndex < budgetYears.length - 1) {
      setSelectedYear(budgetYears[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex === 0) {
      const newYear = selectedYear + 1;
      setBudgetYears([newYear, ...budgetYears]);
      setSelectedYear(newYear);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('property_transactions')
        .delete()
        .eq('property_id', propertyId)
        .eq('is_budgeted', true)
        .eq('budget_year', selectedYear);

      const transactions = [
        ...incomeEntries.map(entry => {
          let category: "rent" | "parking_fees" | "other_income";
          if (entry.category.toLowerCase().includes("rent")) {
            category = "rent";
          } else if (entry.category.toLowerCase().includes("parking")) {
            category = "parking_fees";
          } else {
            category = "other_income";
          }
          
          return {
            property_id: propertyId,
            category,
            type: 'income' as const,
            amount: entry.monthlyAmount,
            is_recurring: true,
            recurrence_interval: 'monthly',
            is_budgeted: true,
            is_one_time: false,
            description: entry.category,
            date: new Date().toISOString().split('T')[0],
            created_by: user?.id,
            budget_year: selectedYear
          };
        }),
        ...expenseEntries.map(entry => {
          const categoryMap: { [key: string]: "mortgage" | "condo_fees" | "insurance" | "municipal_tax" | "school_tax" | "maintenance" | "utilities" | "property_management" | "other_expense" } = {
            "Mortgage": "mortgage",
            "Condo Fees": "condo_fees",
            "Insurance": "insurance",
            "Municipal Tax": "municipal_tax",
            "School Tax": "school_tax",
            "Maintenance": "maintenance",
            "Utilities": "utilities",
            "Property Management": "property_management",
            "Other Expenses": "other_expense"
          };
          
          return {
            property_id: propertyId,
            category: categoryMap[entry.category],
            type: 'expense' as const,
            amount: entry.monthlyAmount,
            is_recurring: true,
            recurrence_interval: 'monthly',
            is_budgeted: true,
            is_one_time: false,
            description: entry.category,
            date: new Date().toISOString().split('T')[0],
            created_by: user?.id,
            budget_year: selectedYear
          };
        })
      ];

      const { error } = await supabase
        .from('property_transactions')
        .insert(transactions);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Financial overview for ${selectedYear} has been saved`,
      });
    } catch (error) {
      console.error('Error saving financial overview:', error);
      toast({
        title: "Error",
        description: "Failed to save financial overview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFinancialSection = (
    entries: FinancialEntry[],
    type: "income" | "expense"
  ) => (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div key={entry.category} className="grid grid-cols-12 gap-3 items-center">
          <Label className="text-sm col-span-4">{entry.category}</Label>
          <div className="col-span-4 space-y-1">
            <Label className="text-xs text-muted-foreground">Monthly</Label>
            <Input
              type="number"
              value={entry.monthlyAmount || ""}
              onChange={(e) => handleMonthlyChange(index, e.target.value, type)}
              className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>
          <div className="col-span-4 space-y-1">
            <Label className="text-xs text-muted-foreground">Yearly</Label>
            <Input
              type="number"
              value={entry.yearlyAmount || ""}
              onChange={(e) => handleYearlyChange(index, e.target.value, type)}
              className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Financial Overview</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 rounded-r-none"
                onClick={() => changeYear('previous')}
                disabled={budgetYears.indexOf(selectedYear) === budgetYears.length - 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-2 py-1 text-center min-w-24">
                <div className="font-medium">{selectedYear}</div>
                <div className="text-xs text-muted-foreground">Budget Year</div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 rounded-l-none"
                onClick={() => changeYear('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {selectedYear !== currentYear && (
        <div className="bg-muted p-3 rounded-md flex items-center">
          <FilterIcon className="w-4 h-4 mr-2 text-muted-foreground" />
          <p className="text-sm">
            {selectedYear > currentYear 
              ? <span>You are viewing budget <strong>projections</strong> for <Badge variant="secondary">{selectedYear}</Badge></span>
              : <span>You are viewing the budget for <Badge variant="secondary">{selectedYear}</Badge></span>
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${netIncome.monthly >= 0 ? 'border-emerald-500' : 'border-rose-500'} border-2`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <DollarSign className="w-5 h-5 mr-1" />
              Monthly Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${netIncome.monthly >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netIncome.monthly)}
            </div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center">
              {netIncome.monthly >= 0 ? (
                <ArrowUpCircle className="w-4 h-4 mr-1 text-emerald-500" />
              ) : (
                <ArrowDownCircle className="w-4 h-4 mr-1 text-rose-500" />
              )}
              <span>Monthly net income</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`${netIncome.yearly >= 0 ? 'border-emerald-500' : 'border-rose-500'} border-2`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="w-5 h-5 mr-1" />
              Yearly Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${netIncome.yearly >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netIncome.yearly)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Projected annual net income
            </div>
          </CardContent>
        </Card>

        <Card className={`
          ${financialHealth === "excellent" ? "border-emerald-500" : 
            financialHealth === "good" ? "border-green-500" : 
            financialHealth === "fair" ? "border-amber-500" : 
            financialHealth === "concerning" ? "border-rose-500" : "border-gray-300"} border-2
        `}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="w-5 h-5 mr-1" />
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm font-medium">Expense Ratio</div>
                <div className={`text-lg font-semibold 
                  ${expenseToIncomeRatio === "N/A" ? "text-gray-500" :
                  parseFloat(expenseToIncomeRatio) < 60 ? "text-emerald-600" :
                  parseFloat(expenseToIncomeRatio) < 80 ? "text-amber-600" : "text-rose-600"}`}>
                  {expenseToIncomeRatio === "N/A" ? "N/A" : `${expenseToIncomeRatio}%`}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Annual ROI</div>
                <div className={`text-lg font-semibold
                  ${annualROI === "N/A" ? "text-gray-500" :
                  parseFloat(annualROI) > 20 ? "text-emerald-600" :
                  parseFloat(annualROI) > 10 ? "text-amber-600" : "text-rose-600"}`}>
                  {annualROI === "N/A" ? "N/A" : `${annualROI}%`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-emerald-600">
              <ArrowUpCircle className="w-5 h-5 mr-1" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(incomeTotals.monthly)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Yearly: {formatCurrency(incomeTotals.yearly)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-rose-600">
              <ArrowDownCircle className="w-5 h-5 mr-1" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(expenseTotals.monthly)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Yearly: {formatCurrency(expenseTotals.yearly)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <DollarSign className="w-5 h-5 mr-1" />
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {incomeEntries.filter(entry => entry.monthlyAmount > 0).map(entry => (
              <div key={entry.category} className="flex justify-between items-center">
                <span className="text-sm">{entry.category}</span>
                <span className="text-sm font-medium">{formatCurrency(entry.monthlyAmount)}</span>
              </div>
            ))}
            {incomeEntries.filter(entry => entry.monthlyAmount > 0).length === 0 && (
              <div className="text-sm text-muted-foreground">No income sources added</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderFinancialSection(incomeEntries, "income")}
          <Separator />
          <div className="grid grid-cols-12 gap-3 font-medium">
            <div className="col-span-4">Total Income</div>
            <div className="col-span-4 text-emerald-600">
              {formatCurrency(incomeTotals.monthly)} <span className="text-xs font-normal text-muted-foreground">monthly</span>
            </div>
            <div className="col-span-4 text-emerald-600">
              {formatCurrency(incomeTotals.yearly)} <span className="text-xs font-normal text-muted-foreground">yearly</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderFinancialSection(expenseEntries, "expense")}
          <Separator />
          <div className="grid grid-cols-12 gap-3 font-medium">
            <div className="col-span-4">Total Expenses</div>
            <div className="col-span-4 text-rose-600">
              {formatCurrency(expenseTotals.monthly)} <span className="text-xs font-normal text-muted-foreground">monthly</span>
            </div>
            <div className="col-span-4 text-rose-600">
              {formatCurrency(expenseTotals.yearly)} <span className="text-xs font-normal text-muted-foreground">yearly</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${netIncome.monthly >= 0 ? 'border-emerald-500' : 'border-rose-500'} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            Net Income
            {netIncome.monthly >= 0 ? (
              <TrendingUp className="w-5 h-5 ml-2 text-emerald-500" />
            ) : (
              <TrendingDown className="w-5 h-5 ml-2 text-rose-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid grid-cols-12 gap-3 font-medium">
            <div className="col-span-4">Monthly Cash Flow</div>
            <div className={`col-span-8 text-xl font-bold ${netIncome.monthly >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netIncome.monthly)}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3 font-medium mt-2">
            <div className="col-span-4">Yearly Cash Flow</div>
            <div className={`col-span-8 text-xl font-bold ${netIncome.yearly >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netIncome.yearly)}
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {netIncome.monthly >= 0 ? (
              <p>This property is generating positive cash flow. Current monthly profit is {formatCurrency(netIncome.monthly)}, 
                 projecting to {formatCurrency(netIncome.yearly)} annually.</p>
            ) : (
              <p>This property is operating at a loss of {formatCurrency(Math.abs(netIncome.monthly))} monthly, 
                 projecting to {formatCurrency(Math.abs(netIncome.yearly))} annually. Consider reviewing expenses or increasing income.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
