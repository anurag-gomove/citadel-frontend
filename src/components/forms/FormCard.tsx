
import { Card } from "@/components/ui/card";
import { FormCardContent } from "./form-card/FormCardContent";
import { FormCardActions } from "./form-card/FormCardActions";
import { Badge } from "@/components/ui/badge";

interface Form {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  file_path?: string;
  html_path?: string;
  status?: 'pending' | 'processing' | 'ready' | 'error';
}

interface FormCardProps {
  form: Form;
  viewMode: "grid" | "list";
  onView: () => void;
}

export function FormCard({ form, viewMode, onView }: FormCardProps) {
  const getStatusBadge = () => {
    if (!form.status) return null;

    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" },
      processing: { label: "Converting...", variant: "warning" },
      ready: { label: "HTML Ready", variant: "success" },
      error: { label: "Conversion Failed", variant: "destructive" }
    } as const;

    const config = statusConfig[form.status];
    
    return (
      <Badge variant={config.variant as "secondary" | "warning" | "success" | "destructive"}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className={viewMode === "list" ? "flex items-center justify-between p-4" : ""}>
      <div className={viewMode === "list" ? "flex items-center gap-4 flex-1" : ""}>
        <FormCardContent form={form} viewMode={viewMode} />
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <FormCardActions form={form} onView={onView} viewMode={viewMode} />
        </div>
      </div>
    </Card>
  );
}
