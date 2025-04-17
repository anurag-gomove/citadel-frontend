
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash } from "lucide-react";

interface PropertyCardActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const PropertyCardActions = ({ onEdit, onDelete }: PropertyCardActionsProps) => {
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="property-actions absolute top-2 right-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={handleDropdownClick}>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={onDelete}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
