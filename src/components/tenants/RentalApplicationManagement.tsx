
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tenant, TenantApplication } from '@/types/database';
import { ApplicationStatus } from './ApplicationStatus';
import { ApplicationHistory } from './ApplicationHistory';

interface RentalApplicationManagementProps {
  tenant: Tenant;
  applications: TenantApplication[];
  isApplicationsLoading: boolean;
  onSendApplication: () => void;
  onMarkReceived: () => void;
  onStartReview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onStartNewApplication: () => void;
  currentApplicationType: string;
}

export function RentalApplicationManagement({
  tenant,
  applications,
  isApplicationsLoading,
  onSendApplication,
  onMarkReceived,
  onStartReview,
  onApprove,
  onReject,
  onStartNewApplication,
  currentApplicationType
}: RentalApplicationManagementProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Current Application</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationStatus 
            status={tenant.application_status as ApplicationStatus || 'not_sent'} 
            sentDate={tenant.application_sent_date} 
            receivedDate={tenant.application_received_date} 
            reviewedDate={tenant.application_reviewed_date} 
            onSendApplication={onSendApplication} 
            onMarkReceived={onMarkReceived} 
            onStartReview={onStartReview} 
            onApprove={onApprove} 
            onReject={onReject}
            applicationType={currentApplicationType}
          />
        </CardContent>
      </Card>
      
      <ApplicationHistory 
        applications={applications || []} 
        isLoading={isApplicationsLoading}
        onStartNewApplication={onStartNewApplication} 
        canSendNewApplication={tenant.can_send_new_application !== false}
      />
    </div>
  );
}
