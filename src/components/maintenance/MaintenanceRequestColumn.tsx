
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceRequestItem } from "./MaintenanceRequestItem";

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

interface MaintenanceRequestColumnProps {
  title: string;
  columnId: string;
  requests: MaintenanceRequest[];
}

export function MaintenanceRequestColumn({ 
  title, 
  columnId, 
  requests 
}: MaintenanceRequestColumnProps) {
  // Setup droppable area for the column
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: {
      type: 'column',
      status: columnId,
    }
  });

  // Get background color based on column type
  const getColumnColor = () => {
    switch(columnId) {
      case 'todo':
        return 'bg-amber-50 dark:bg-amber-950/20';
      case 'ongoing':
        return 'bg-blue-50 dark:bg-blue-950/20';
      case 'done':
        return 'bg-green-50 dark:bg-green-950/20';
      default:
        return '';
    }
  };

  // Add hover effect for droppable area
  const getHoverStyle = () => {
    return isOver ? 'border-dashed border-2 border-primary/50 bg-muted/20' : '';
  };

  return (
    <Card className={`${getColumnColor()} h-full min-h-[500px] border-0 shadow-none`}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex justify-between items-center text-xl font-bold">
          <span>{title}</span>
          <span className="text-sm bg-white px-2 py-1 rounded-full shadow-sm">
            {requests.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div 
          ref={setNodeRef} 
          className={`h-full min-h-[400px] rounded-md transition-colors p-2 ${getHoverStyle()}`}
          data-column-id={columnId}
          data-column-type="column"
        >
          <SortableContext 
            items={requests.map(req => req.id)} 
            strategy={verticalListSortingStrategy}
          >
            {requests.length === 0 ? (
              <div className="flex items-center justify-center h-20 border border-dashed rounded-md text-muted-foreground">
                No requests
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <MaintenanceRequestItem 
                    key={request.id} 
                    request={request} 
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}
