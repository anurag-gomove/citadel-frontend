
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface FormCardContentProps {
  form: {
    icon: string;
    name: string;
    category: string;
    description: string;
  };
  viewMode: "grid" | "list";
}

export function FormCardContent({ form, viewMode }: FormCardContentProps) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-2xl">{form.icon}</span>
        <div>
          <CardTitle className="text-lg">{form.name}</CardTitle>
          <CardDescription>{form.category}</CardDescription>
        </div>
      </div>
    );
  }

  return (
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">
        {form.description}
      </p>
    </CardContent>
  );
}
