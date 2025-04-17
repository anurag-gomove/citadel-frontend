
import React from 'react';
import { Check, Clock, FileText, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

export type ApplicationStatus = 'not_sent' | 'sent' | 'received' | 'under_review' | 'approved' | 'rejected';

interface ApplicationStatusProps {
  status: ApplicationStatus;
  sentDate?: string | null;
  receivedDate?: string | null;
  reviewedDate?: string | null;
  onSendApplication?: () => void;
  onMarkReceived?: () => void;
  onStartReview?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  applicationType?: string;
  compact?: boolean;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  status,
  sentDate,
  receivedDate,
  reviewedDate,
  onSendApplication,
  onMarkReceived,
  onStartReview,
  onApprove,
  onReject,
  applicationType = 'Rental Application',
  compact = false
}) => {
  const { toast } = useToast();
  
  console.log("Application status props:", { status, sentDate, receivedDate, reviewedDate });
  
  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'not_sent':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Sent</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'received':
        return <Badge className="bg-yellow-100 text-yellow-800">Received</Badge>;
      case 'under_review':
        return <Badge className="bg-purple-100 text-purple-800">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      action();
    } else {
      toast({
        title: "Feature coming soon",
        description: "This functionality will be available in a future update."
      });
    }
  };

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{applicationType} Status</h3>
        {getStatusBadge()}
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline Steps */}
        <div className="space-y-8">
          {/* Step 1: Not Sent */}
          <div className="relative flex items-start">
            <div className={`z-10 flex items-center justify-center w-14 h-14 rounded-full ${status === 'not_sent' ? 'bg-primary text-primary-foreground' : status === 'sent' || status === 'received' || status === 'under_review' || status === 'approved' || status === 'rejected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {status === 'sent' || status === 'received' || status === 'under_review' || status === 'approved' || status === 'rejected' ? <Check className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div className="ml-4 min-w-0 flex-1 pt-1.5">
              <h4 className="text-sm font-medium">Application Ready</h4>
              <p className="text-sm text-muted-foreground">
                {status === 'not_sent' ? `${applicationType} is ready to be sent to tenant` : 'Application prepared'}
              </p>
              {status === 'not_sent' && <div className="mt-2">
                  <Button size="sm" onClick={() => handleAction(onSendApplication)}>
                    Send Application
                  </Button>
                </div>}
            </div>
          </div>

          {/* Step 2: Sent */}
          <div className="relative flex items-start">
            <div className={`z-10 flex items-center justify-center w-14 h-14 rounded-full ${status === 'sent' ? 'bg-primary text-primary-foreground' : status === 'received' || status === 'under_review' || status === 'approved' || status === 'rejected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {status === 'received' || status === 'under_review' || status === 'approved' || status === 'rejected' ? <Check className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="ml-4 min-w-0 flex-1 pt-1.5">
              <h4 className="text-sm font-medium">Application Sent</h4>
              <p className="text-sm text-muted-foreground">
                {status === 'not_sent' ? 'Waiting to send application' : sentDate ? `Sent ${formatDate(sentDate)}` : 'Application has been sent to tenant'}
              </p>
              {status === 'sent' && <div className="mt-2">
                  <Button size="sm" onClick={() => handleAction(onMarkReceived)}>
                    Mark as Received
                  </Button>
                </div>}
            </div>
          </div>

          {/* Step 3: Received/Under Review */}
          <div className="relative flex items-start">
            <div className={`z-10 flex items-center justify-center w-14 h-14 rounded-full ${status === 'received' ? 'bg-primary text-primary-foreground' : status === 'under_review' || status === 'approved' || status === 'rejected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {status === 'under_review' || status === 'approved' || status === 'rejected' ? <Check className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div className="ml-4 min-w-0 flex-1 pt-1.5">
              <h4 className="text-sm font-medium">Application Received</h4>
              <p className="text-sm text-muted-foreground">
                {status === 'not_sent' || status === 'sent' ? 'Waiting to receive application' : receivedDate ? `Received ${formatDate(receivedDate)}` : 'Application has been received'}
              </p>
              {status === 'received' && <div className="mt-2">
                  <Button size="sm" onClick={() => handleAction(onStartReview)}>
                    Start Review
                  </Button>
                </div>}
            </div>
          </div>

          {/* Step 4: Decision */}
          <div className="relative flex items-start">
            <div className={`z-10 flex items-center justify-center w-14 h-14 rounded-full ${status === 'under_review' ? 'bg-primary text-primary-foreground' : status === 'approved' || status === 'rejected' ? status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
              {status === 'approved' ? <Check className="w-6 h-6" /> : status === 'rejected' ? <X className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="ml-4 min-w-0 flex-1 pt-1.5">
              <h4 className="text-sm font-medium">Application Decision</h4>
              <p className="text-sm text-muted-foreground">
                {status === 'not_sent' || status === 'sent' || status === 'received' ? 'Pending review and decision' : status === 'under_review' ? 'Application is currently under review' : status === 'approved' ? 'Application has been approved' : 'Application has been rejected'}
              </p>
              {status === 'under_review' && <div className="mt-2 flex space-x-2">
                  <Button size="sm" onClick={() => handleAction(onApprove)} className="bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleAction(onReject)}>
                    Reject
                  </Button>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
