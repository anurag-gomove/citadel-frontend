
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  CalendarClock,
  Home,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EditMaintenanceRequestDialog } from "./EditMaintenanceRequestDialog";
import { DeleteMaintenanceRequestDialog } from "./DeleteMaintenanceRequestDialog";
import { formatLocalDate } from "@/utils/timezone";

interface MaintenanceRequest {
  id: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  property_id: string;
  unit_id?: string;
  tenant_id?: string;
  title: string;
  due_date?: string | null;
}

interface MaintenanceRequestItemProps {
  request: MaintenanceRequest;
  isDragOverlay?: boolean;
}

export function MaintenanceRequestItem({ request, isDragOverlay = false }: MaintenanceRequestItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: request.id,
    disabled: isDragOverlay,
    data: {
      type: 'request',
      request,
    }
  });

  // Query to fetch unit details
  const { data: unitData } = useQuery({
    queryKey: ["unit", request.unit_id],
    queryFn: async () => {
      if (!request.unit_id) return null;
      
      const { data, error } = await supabase
        .from("units")
        .select("unit_number")
        .eq("id", request.unit_id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!request.unit_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    // Control max width to prevent unwanted expansion during drag
    maxWidth: isDragOverlay ? "100%" : undefined,
    width: isDragOverlay ? "100%" : undefined,
  };

  // Get priority badge styling
  const getPriorityBadge = () => {
    switch (request.priority.toLowerCase()) {
      case "urgent":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1 border-amber-200">
            <Clock className="h-3 w-3" />
            Medium
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Low
          </Badge>
        );
    }
  };

  // Handle edit button click - stop propagation to prevent drag
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  // Handle delete button click - stop propagation to prevent drag
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`bg-white cursor-grab active:cursor-grabbing shadow-sm border relative group ${
          isDragging ? 'shadow-md' : ''
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...attributes}
      >
        {/* Action buttons - visible on hover, placed outside the drag listeners */}
        <div 
          className={`absolute top-2 right-2 flex space-x-1 transition-opacity duration-200 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Edit request"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm" 
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete request"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content area - this gets the drag listeners */}
        <div {...listeners}>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title with priority badge */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-medium text-base">{request.title || 'Untitled Request'}</h3>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge()}
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 text-xs">
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Description - if available */}
              {request.description && (
                <div className="text-sm text-muted-foreground">
                  {request.description}
                </div>
              )}
              
              {/* Unit information */}
              <div className="flex items-center text-xs text-muted-foreground">
                <Home className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <span>Unit {unitData?.unit_number || 'Not specified'}</span>
              </div>
              
              {/* Dates section */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                {/* Created date */}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  <span>Created: {formatLocalDate(request.created_at, "MMM d")}</span>
                </div>
                
                {/* Due date - with visual indicator */}
                {request.due_date && (
                  <div className="flex items-center text-xs">
                    <CalendarClock className={`h-3.5 w-3.5 mr-1 ${
                      new Date(request.due_date) < new Date() 
                        ? 'text-red-500' 
                        : 'text-amber-500'
                    }`} />
                    <span className={`${
                      new Date(request.due_date) < new Date() 
                        ? 'text-red-500 font-medium' 
                        : 'text-amber-500'
                    }`}>
                      Due: {formatLocalDate(request.due_date, "MMM d")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Edit Dialog */}
      <EditMaintenanceRequestDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        request={request}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMaintenanceRequestDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        requestId={request.id}
        propertyId={request.property_id}
      />
    </>
  );
}
