
import { Badge } from "@/components/ui/badge";
import { CreditCard, Banknote, Building, CheckSquare } from "lucide-react";

interface PaymentMethodBadgeProps {
  method: string;
}

export const PaymentMethodBadge = ({ method }: PaymentMethodBadgeProps) => {
  const getIcon = () => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-3 w-3" />;
      case "cash":
        return <Banknote className="h-3 w-3" />;
      case "bank_transfer":
        return <Building className="h-3 w-3" />;
      case "check":
        return <CheckSquare className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      {getIcon()}
      <span className="capitalize">{method.replace("_", " ")}</span>
    </Badge>
  );
};
