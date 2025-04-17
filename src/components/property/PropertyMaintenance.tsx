
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewMaintenanceRequestForm } from "@/components/maintenance/NewMaintenanceRequestForm";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { MaintenanceRequestItem } from "@/components/maintenance/MaintenanceRequestItem";
import { MaintenanceRequestColumn } from "@/components/maintenance/MaintenanceRequestColumn";

interface PropertyMaintenanceProps {
  property: string;
}

type MaintenanceStatus = "todo" | "ongoing" | "done";

interface MaintenanceRequest {
  id: string;
  description: string;
  priority: string;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
  property_id: string;
  unit_id?: string;
  tenant_id?: string;
  title: string;
  due_date?: string | null;
}

export function PropertyMaintenance({ property }: PropertyMaintenanceProps) {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeRequest, setActiveRequest] = useState<MaintenanceRequest | null>(null);

  // Setup DnD sensors with permissive activation constraints for better touch/mouse handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Small movement to activate dragging
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    data: maintenanceRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["maintenanceRequests", property],
    queryFn: async () => {
      console.log("Fetching maintenance requests for property:", property);
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("property_id", property);

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      console.log("Fetched maintenance requests:", data);
      return data as MaintenanceRequest[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
    }: {
      requestId: string;
      newStatus: MaintenanceStatus;
    }) => {
      console.log(`Updating request ${requestId} status to: ${newStatus}`);
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) {
        console.error("Error updating status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests", property] });
      toast({
        title: "Status updated",
        description: "The maintenance request status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    // Find the request being dragged
    const { active } = event;
    const draggedRequest = maintenanceRequests?.find(req => req.id === active.id);
    
    if (draggedRequest) {
      console.log("Drag started with request:", draggedRequest);
      setActiveRequest(draggedRequest);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This event fires when dragging over a droppable
    const { over } = event;
    console.log("Dragging over:", over?.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRequest(null);

    if (!over) {
      console.log("Drag ended with no target");
      return;
    }

    const requestId = active.id.toString();
    
    // Check if we're dropping onto a column
    if (over.data.current?.type === 'column') {
      const newStatus = over.data.current.status as MaintenanceStatus;
      const currentRequest = maintenanceRequests?.find(req => req.id === requestId);
      
      console.log("Drag ended:", {
        requestId,
        currentStatus: currentRequest?.status,
        newStatus,
        overData: over.data.current
      });
      
      // Only update if dropping onto a different status column
      if (currentRequest && currentRequest.status !== newStatus) {
        updateStatusMutation.mutate({ requestId, newStatus });
      }
    } else {
      console.log("Not dropped on a column, target was:", over.id);
    }
  };

  const handleDragCancel = () => {
    setActiveRequest(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  // Group requests by status
  const todoRequests = maintenanceRequests?.filter(req => req.status === "todo") || [];
  const ongoingRequests = maintenanceRequests?.filter(req => req.status === "ongoing") || [];
  const doneRequests = maintenanceRequests?.filter(req => req.status === "done") || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" />
          Maintenance Requests
        </h2>
        <Button onClick={() => setIsNewRequestOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MaintenanceRequestColumn 
            title="To Do" 
            requests={todoRequests} 
            columnId="todo"
          />
          
          <MaintenanceRequestColumn 
            title="In Progress" 
            requests={ongoingRequests} 
            columnId="ongoing"
          />
          
          <MaintenanceRequestColumn 
            title="Completed" 
            requests={doneRequests} 
            columnId="done"
          />
        </div>

        {/* Drag overlay for the currently dragged item - with constrained width */}
        <DragOverlay adjustScale={false}>
          {activeRequest && (
            <div className="opacity-90 pointer-events-none" style={{ 
              width: "100%", 
              maxWidth: "400px" // Constrain max width to prevent expansion
            }}>
              <MaintenanceRequestItem 
                request={activeRequest} 
                isDragOverlay={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <NewMaintenanceRequestForm
        open={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        propertyId={property}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["maintenanceRequests", property] });
        }}
      />
    </div>
  );
}
