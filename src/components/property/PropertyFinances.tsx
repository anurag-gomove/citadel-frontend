
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format-currency";
import { useState, useEffect } from "react";

interface PropertyFinancesProps {
  propertyId: string;
}

export const PropertyFinances = ({ propertyId }: PropertyFinancesProps) => {
  const [chartData, setChartData] = useState<{ month: string; amount: number }[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netCashflow, setNetCashflow] = useState(0);
  
  // Fetch active tenants with units in this property
  const { data: tenants, isLoading: isLoadingTenants } = useQuery({
    queryKey: ["property-tenants", propertyId],
    queryFn: async () => {
      console.log("Fetching tenants for property:", propertyId);
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          id,
          first_name,
          last_name,
          lease_status,
          unit_id,
          units:unit_id(
            id,
            monthly_rent
          ),
          units_info:units(
            monthly_rent
          )
        `)
        .eq("property_id", propertyId)
        .eq("lease_status", "active");
      
      if (error) {
        console.error("Error fetching tenants:", error);
        throw error;
      }
      
      console.log("Fetched tenants:", data);
      return data || [];
    }
  });
  
  // Fetch units directly to double-check rent values
  const { data: units } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select(`
          id,
          unit_number,
          status,
          monthly_rent,
          tenant_id,
          tenants:tenant_id(
            id,
            first_name,
            last_name,
            lease_start_date
          )
        `)
        .eq("property_id", propertyId);
      
      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      
      console.log("Fetched units for property finance:", data);
      return data || [];
    }
  });
  
  // Fetch expenses for this property (actual recorded expenses, not budgeted)
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["property-expenses", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .eq("type", "expense")
        .is("is_budgeted", false);
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch budgeted expenses for this property
  const { data: budgetedExpenses, isLoading: isLoadingBudgetedExpenses } = useQuery({
    queryKey: ["property-budgeted-expenses", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .eq("type", "expense")
        .eq("is_budgeted", true);
      
      if (error) throw error;
      console.log("Fetched budgeted expenses:", data);
      return data || [];
    }
  });
  
  // Calculate finances whenever data changes
  useEffect(() => {
    if (units && units.length > 0) {
      // Calculate total monthly income from occupied units only
      const income = units.reduce((sum, unit) => {
        // Only add rent if the unit is occupied
        if (unit.status === 'occupied') {
          // Ensure monthly_rent is treated as a number, handle null/undefined
          const monthlyRent = Number(unit.monthly_rent || 0);
          console.log(`PropertyFinances - Unit ${unit.unit_number} occupied with rent: ${monthlyRent}`);
          return sum + monthlyRent;
        }
        return sum;
      }, 0);
      
      console.log("Calculated income from occupied units:", income);
      setTotalIncome(income);
      
      // Calculate actual recorded expenses
      const actualExpensesTotal = expenses ? expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount || 0);
      }, 0) : 0;
      
      // Calculate budgeted expenses
      const budgetedExpensesTotal = budgetedExpenses ? budgetedExpenses.reduce((sum, expense) => {
        return sum + Number(expense.amount || 0);
      }, 0) : 0;
      
      console.log("Actual expenses total:", actualExpensesTotal);
      console.log("Budgeted expenses total:", budgetedExpensesTotal);
      
      // Use budgeted expenses as the primary expense calculation
      const totalExpensesCalculated = budgetedExpensesTotal || actualExpensesTotal;
      setTotalExpenses(totalExpensesCalculated);
      
      // Calculate net cashflow
      setNetCashflow(income - totalExpensesCalculated);
      
      // Generate chart data - 6 months of income data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setChartData(months.map(month => ({
        month,
        amount: income // For simplicity, using the same income for all months
        // In a real app, you'd fetch historical data for each month
      })));
    } else {
      // Reset values if no units
      setTotalIncome(0);
      
      // Even if no units, still calculate expenses
      const budgetedExpensesTotal = budgetedExpenses ? budgetedExpenses.reduce((sum, expense) => {
        return sum + Number(expense.amount || 0);
      }, 0) : 0;
      
      setTotalExpenses(budgetedExpensesTotal);
      setNetCashflow(0 - budgetedExpensesTotal);
      
      // Update chart with zero income
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setChartData(months.map(month => ({ month, amount: 0 })));
    }
  }, [units, expenses, budgetedExpenses]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netCashflow)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cashflow</CardTitle>
          <CardDescription>Monthly income vs expenses overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
