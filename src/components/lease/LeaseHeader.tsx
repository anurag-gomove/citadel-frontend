
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tenant } from "@/types/database";

interface LeaseHeaderProps {
  tenant: Tenant;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onFinalize: () => void;
  isEditingExisting?: boolean;
}

export function LeaseHeader({ 
  tenant, 
  isSaving, 
  onBack, 
  onSave, 
  onFinalize,
  isEditingExisting = false
}: LeaseHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditingExisting ? "Edit Lease" : "Create New Lease"}
          </h1>
          <p className="text-muted-foreground">
            Tenant: {tenant.first_name} {tenant.last_name}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button 
          onClick={onFinalize}
          disabled={isSaving}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Finalize & Create Lease"}
        </Button>
      </div>
    </div>
  );
}
