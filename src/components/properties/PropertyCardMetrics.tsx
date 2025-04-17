
import { DollarSign } from "lucide-react";

interface PropertyCardMetricsProps {
  occupiedUnits: number;
  totalUnits: number;
  actualIncome?: number;
  potentialIncome?: number;
}

export const PropertyCardMetrics = ({
  occupiedUnits,
  totalUnits,
  actualIncome = 0,
  potentialIncome = 0
}: PropertyCardMetricsProps) => {
  // For total units, ensure it's never less than 1 when we have occupied units
  const displayTotalUnits = totalUnits > 0 ? totalUnits : (occupiedUnits > 0 ? occupiedUnits : 0);
  
  // For occupied units, use the actual value but don't exceed total
  const displayOccupiedUnits = Math.min(occupiedUnits, displayTotalUnits);

  // Make sure actualIncome and potentialIncome are numbers, not null/undefined
  const safeActualIncome = Number(actualIncome || 0);
  const safePotentialIncome = Number(potentialIncome || 0);

  // Ensure we don't divide by zero
  const incomePercentage = safePotentialIncome > 0 
    ? Math.min((safeActualIncome / safePotentialIncome) * 100, 100) // Cap at 100%
    : 0;

  // Calculate occupancy percentage based on the adjusted values
  const occupancyPercentage = displayTotalUnits > 0 
    ? (displayOccupiedUnits / displayTotalUnits) * 100 
    : 0;

  // For debugging
  console.log(`PropertyCardMetrics: Actual Income: ${safeActualIncome}, Potential Income: ${safePotentialIncome}`);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Units</span>
        <span className="font-medium">
          {displayOccupiedUnits}/{displayTotalUnits}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${occupancyPercentage}%`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-sm pt-2">
        <span className="text-muted-foreground flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          Monthly Income
        </span>
        <div className="text-right">
          <span className="font-medium">
            ${safeActualIncome.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs ml-1">
            / ${safePotentialIncome.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${incomePercentage}%`,
          }}
        />
      </div>
    </div>
  );
};
