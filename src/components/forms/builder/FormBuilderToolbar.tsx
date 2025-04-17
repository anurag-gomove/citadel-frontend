
import { MANUAL_INPUT_FIELDS, AUTO_FILL_FIELDS, FormField } from "@/types/form";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { 
  Square, 
  PenLine, 
  Calendar, 
  CheckSquare, 
  Mail, 
  Phone, 
  Type,
  User 
} from "lucide-react";

interface ToolbarItemProps {
  type: FormField["type"];
  label: string;
  icon: React.ReactNode;
  isAutoFilled?: boolean;
  tenantField?: string;
}

function ToolbarItem({ type, label, icon, isAutoFilled, tenantField }: ToolbarItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `toolbar-${type}-${label}`,
    data: {
      type,
      label,
      isAutoFilled,
      tenantField,
      isToolbarItem: true,
    },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-3 p-4 bg-white border rounded-md shadow-sm cursor-move hover:border-primary hover:shadow-md transition-all mb-2"
      style={style}
    >
      {icon}
      <span className="flex-1 text-sm">{label}</span>
      {isAutoFilled && (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          Auto
        </span>
      )}
    </div>
  );
}

const getFieldIcon = (type: FormField["type"]) => {
  switch (type) {
    case "signature":
      return <PenLine className="h-4 w-4" />;
    case "text":
    case "textarea":
      return <Type className="h-4 w-4" />;
    case "date":
      return <Calendar className="h-4 w-4" />;
    case "checkbox":
      return <CheckSquare className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    default:
      return <Square className="h-4 w-4" />;
  }
};

export function FormBuilderToolbar() {
  return (
    <div className="w-80 bg-secondary border-l flex flex-col h-full flex-shrink-0">
      <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Auto-filled Fields</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              These fields will be automatically filled with tenant information
            </p>
            <div className="space-y-2">
              {AUTO_FILL_FIELDS.map(({ type, label, tenantField }) => (
                <ToolbarItem
                  key={`${type}-${label}`}
                  type={type}
                  label={label}
                  icon={getFieldIcon(type)}
                  isAutoFilled={true}
                  tenantField={tenantField}
                />
              ))}
            </div>
          </div>

          <Card className="p-4">
            <h2 className="font-semibold mb-3">Manual Input Fields</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These fields require tenant input
            </p>
            <div className="space-y-2">
              {MANUAL_INPUT_FIELDS.map(({ type, label }) => (
                <ToolbarItem
                  key={`${type}-${label}`}
                  type={type}
                  label={label}
                  icon={getFieldIcon(type)}
                  isAutoFilled={false}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
