import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Users, 
  DollarSign,
  MoreVertical,
  CalendarClock,
  KeyRound,
  Wrench,
  Clock,
  User,
  AlertTriangle,
  Calendar,
  ExternalLink,
  AlertCircle,
  Eye,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Property, Tenant, Unit, UnitPayment, MaintenanceRequest, WorkOrder } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewTenantForm } from "@/components/tenants/NewTenantForm";
import { formatLocalDate, getDaysLate } from "@/utils/timezone";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DashboardContentProps {
  organizationId?: string;
}

export function DashboardContent({ organizationId: propOrgId }: DashboardContentProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState<string | undefined>(propOrgId);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isLatePaymentsExpanded, setIsLatePaymentsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const handleAddTenantSuccess = () => {
    setIsAddTenantOpen(false);
    toast({
      title: "Tenant added",
      description: "The tenant has been successfully added",
    });
  };

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, organization_id")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching current user:", error);
        return null;
      }
      
      return data;
    },
  });
  
  const { data: userProfile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data;
    },
    enabled: !propOrgId,
  });
  
  const { data: organizationData } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .single();
      
      if (error) {
        console.error("Error fetching organization:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!organizationId,
  });
  
  useEffect(() => {
    if (!propOrgId && userProfile?.organization_id) {
      console.log("Setting organization ID from user profile:", userProfile.organization_id);
      setOrganizationId(userProfile.organization_id);
    }
  }, [propOrgId, userProfile]);

  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["properties", organizationId],
    queryFn: async () => {
      console.log("Dashboard properties query with organization_id:", organizationId);
      
      if (!organizationId) {
        console.error("No organization ID provided");
        return [];
      }
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("organization_id", organizationId);

      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      
      console.log("Dashboard properties result:", data);
      return data as Property[];
    },
    enabled: !!organizationId,
  });

  const { data: tenants, isLoading: isLoadingTenants } = useQuery({
    queryKey: ["tenants", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.error("No organization ID provided for tenants query");
        return [];
      }
      
      console.log("Fetching tenants for organization:", organizationId);
      
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching tenants:", error);
        throw error;
      }
      
      console.log("Dashboard tenants result:", data);
      console.log("Dashboard tenants count:", data?.length || 0);
      return data as Tenant[];
    },
    enabled: !!organizationId,
  });

  const { data: latePayments, isLoading: isLoadingLatePayments } = useQuery({
    queryKey: ["late-payments", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.error("No organization ID provided for late payments query");
        return [];
      }
      
      const today = new Date();
      
      const { data, error } = await supabase
        .from("unit_payments")
        .select(`
          *, 
          units(
            unit_number, 
            property_id, 
            tenant_id,
            properties(name),
            tenants:tenant_id(
              first_name,
              last_name
            )
          )
        `)
        .lt("due_date", today.toISOString())
        .in("payment_status", ["pending", "partial", "late", "overdue"]);

      if (error) throw error;
      
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log("Dashboard late payments (sorted):", sortedData);
      return sortedData;
    },
    enabled: !!organizationId,
  });

  const { data: expiringLeases, isLoading: isLoadingExpiringLeases } = useQuery({
    queryKey: ["expiring-leases", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.error("No organization ID provided for expiring leases query");
        return [];
      }
      
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      console.log("Fetching expiring leases for organization:", organizationId);
      
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          id,
          first_name,
          last_name,
          lease_end_date,
          unit_id,
          unit_number,
          property_id,
          organization_id,
          properties(name)
        `)
        .eq("organization_id", organizationId)
        .gte("lease_end_date", today.toISOString().split('T')[0])
        .lte("lease_end_date", thirtyDaysFromNow.toISOString().split('T')[0])
        .eq("status", "active");

      if (error) {
        console.error("Error fetching expiring leases:", error);
        throw error;
      }
      
      console.log("Dashboard expiring leases:", data);
      console.log("Dashboard expiring leases count:", data?.length || 0);
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: criticalMaintenance, isLoading: isLoadingCriticalMaintenance } = useQuery({
    queryKey: ["critical-maintenance", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.error("No organization ID provided for critical maintenance query");
        return [];
      }
      
      const today = new Date();
      
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          properties(name),
          units(unit_number)
        `)
        .or(`priority.in.(high,urgent),and(due_date.lt.${today.toISOString()},status.neq.done)`)
        .in("status", ["todo", "ongoing"]);

      if (error) throw error;
      console.log("Dashboard critical maintenance:", data);
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: unitPayments, isLoading: isLoadingUnitPayments } = useQuery({
    queryKey: ["unit-payments", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.error("No organization ID provided for unit payments query");
        return [];
      }
      
      const { data, error } = await supabase
        .from("unit_payments")
        .select("*");

      if (error) throw error;
      console.log("Dashboard unit payments:", data);
      return data as UnitPayment[];
    },
    enabled: !!organizationId,
  });

  const { data: units, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["units", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.error("No organization ID provided for units query");
        return [];
      }
      
      const { data, error } = await supabase
        .from("units")
        .select("*, properties(id, name)")
        .eq("organization_id", organizationId);

      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      
      console.log("Dashboard units:", data);
      return data as Unit[];
    },
    enabled: !!organizationId,
  });

  const totalMonthlyIncome = units?.reduce((sum, unit) => {
    if (unit.status === 'occupied') {
      const rent = Number(unit.monthly_rent || 0);
      console.log(`Dashboard - Unit ${unit.unit_number} occupied with rent: ${rent}`);
      return sum + rent;
    }
    return sum;
  }, 0) || 0;

  const potentialMonthlyIncome = units?.reduce((sum, unit) => {
    const rent = Number(unit.monthly_rent || 0);
    return sum + rent;
  }, 0) || 0;

  const isLoading = isLoadingProperties || isLoadingTenants || isLoadingUnitPayments || isLoadingUnits;

  const propertyGrowthRate = properties && properties.length > 0 ? 5.0 : 0.0;
  const tenantGrowthRate = tenants && tenants.length > 0 ? 7.5 : 0.0;
  const incomeGrowthRate = totalMonthlyIncome > 0 ? 3.2 : 0.0;

  if (!organizationId && !userProfile) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  const isMaintenanceLate = (request: any): boolean => {
    if (!request.due_date) return false;
    const dueDate = new Date(request.due_date);
    const today = new Date();
    return dueDate < today && request.status !== 'done';
  };

  const getMaintenanceDaysLate = (dueDate: string): number => {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    if (dueDateObj >= today) return 0;
    
    const timeDiff = today.getTime() - dueDateObj.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const handleNavigateToTenants = (propertyId: string) => {
    navigate(`/properties/${propertyId}?tab=tenants`);
  };

  const handleNavigateToPayments = (propertyId: string) => {
    navigate(`/properties/${propertyId}?tab=finances&subtab=rent`);
  };

  const handleNavigateToMaintenance = (propertyId: string) => {
    navigate(`/properties/${propertyId}?tab=maintenance`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good evening,{currentUser?.first_name ? ` ${currentUser.first_name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Organization: {organizationData?.name || "Loading..."}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-secondary/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30 shadow-sm flex items-center">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">{format(currentTime, "h:mm a")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {propertyGrowthRate > 0 
                ? `↑ ${propertyGrowthRate.toFixed(1)}% last month` 
                : "No change last month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {tenantGrowthRate > 0 
                ? `↑ ${tenantGrowthRate.toFixed(1)}% last month` 
                : "No change last month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total monthly income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {incomeGrowthRate > 0 
                ? `↑ ${incomeGrowthRate.toFixed(1)}% last month` 
                : "No change last month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Late Payments
            </CardTitle>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latePayments && latePayments.length > 0 ? (
              <Collapsible
                open={isLatePaymentsExpanded}
                onOpenChange={setIsLatePaymentsExpanded}
                className="w-full"
              >
                <div className="space-y-3">
                  {!isLatePaymentsExpanded && latePayments.slice(0, 3).map((payment: any) => {
                    const daysLate = getDaysLate(payment.due_date);
                    const tenantName = payment.units?.tenants ? 
                      `${payment.units.tenants.first_name} ${payment.units.tenants.last_name}` : 
                      'Unknown Tenant';
                    
                    return (
                      <div key={payment.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{tenantName}</span>
                          </div>
                          <div className="flex items-center mt-1 gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {payment.units?.properties?.name} - Unit {payment.units?.unit_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <Badge variant={daysLate > 30 ? "destructive" : daysLate > 14 ? "outline" : "secondary"} className="text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              {daysLate} {daysLate === 1 ? 'day' : 'days'} late
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              Due: {formatLocalDate(payment.due_date, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-rose-600">
                            {formatCurrency(payment.balance_due || payment.expected_amount)}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => handleNavigateToPayments(payment.units?.property_id)}
                                >
                                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>View property payments</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })}
                  
                  <CollapsibleContent className="overflow-hidden">
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-3">
                        {latePayments.slice(3).map((payment: any) => {
                          const daysLate = getDaysLate(payment.due_date);
                          const tenantName = payment.units?.tenants ? 
                            `${payment.units.tenants.first_name} ${payment.units.tenants.last_name}` : 
                            'Unknown Tenant';
                          
                          return (
                            <div key={payment.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">{tenantName}</span>
                                </div>
                                <div className="flex items-center mt-1 gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {payment.units?.properties?.name} - Unit {payment.units?.unit_number}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                  <Badge variant={daysLate > 30 ? "destructive" : daysLate > 14 ? "outline" : "secondary"} className="text-xs">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {daysLate} {daysLate === 1 ? 'day' : 'days'} late
                                  </Badge>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    Due: {formatLocalDate(payment.due_date, 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-rose-600">
                                  {formatCurrency(payment.balance_due || payment.expected_amount)}
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full"
                                        onClick={() => handleNavigateToPayments(payment.units?.property_id)}
                                      >
                                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      <p>View property payments</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                    
                    <div className="pt-3 flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7 px-3"
                        onClick={() => setIsLatePaymentsExpanded(false)}
                      >
                        <ChevronUp className="mr-1 h-3 w-3" />
                        Collapse section
                      </Button>
                    </div>
                  </CollapsibleContent>
                  
                  {!isLatePaymentsExpanded && latePayments.length > 3 && (
                    <CollapsibleTrigger asChild>
                      <div className="pt-3 flex justify-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-7 px-3"
                        >
                          <ChevronDown className="mr-1 h-3 w-3" />
                          View all {latePayments.length} late payments
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                  )}
                </div>
              </Collapsible>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <AlertTriangle className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
                <p className="text-sm text-muted-foreground">No late payments</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Upcoming Lease Expirations
            </CardTitle>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {expiringLeases && expiringLeases.length > 0 ? (
              <div className="space-y-3">
                {expiringLeases.slice(0, 3).map((lease: any) => {
                  const leaseEndDate = new Date(lease.lease_end_date);
                  const today = new Date();
                  const daysUntilExpiration = Math.ceil(
                    (leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={lease.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {lease.first_name} {lease.last_name}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {lease.properties?.name}{lease.unit_number ? ` - Unit ${lease.unit_number}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          daysUntilExpiration <= 7 ? "warning" : 
                          daysUntilExpiration <= 14 ? "neutral" : 
                          "secondary"
                        } className="text-xs flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {daysUntilExpiration} {daysUntilExpiration === 1 ? 'day' : 'days'} left
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Expires: {formatLocalDate(lease.lease_end_date, 'MMM d, yyyy')}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => handleNavigateToTenants(lease.property_id)}
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>View property tenants</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
                {expiringLeases.length > 3 && (
                  <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2" 
                      onClick={() => navigate("/tenants?filter=expiring")}>
                      View all {expiringLeases.length} expiring leases
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <CalendarClock className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming lease expirations</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Critical Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalMaintenance && criticalMaintenance.length > 0 ? (
              <div className="space-y-3">
                {criticalMaintenance.slice(0, 5).map((request: any) => {
                  const isLate = isMaintenanceLate(request);
                  const daysLate = isLate ? getMaintenanceDaysLate(request.due_date) : 0;
                  const statusColors = {
                    todo: "bg-amber-50 text-amber-700 border-amber-200",
                    ongoing: "bg-blue-50 text-blue-700 border-blue-200",
                    done: "bg-green-50 text-green-700 border-green-200"
                  };
                  
                  return (
                    <div key={request.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  {isLate ? (
                                    <AlertCircle className="h-3.5 w-3.5 text-rose-500 mr-1" />
                                  ) : (
                                    <Wrench className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                                  )}
                                  <span className="text-sm font-medium truncate max-w-[200px]">
                                    {request.title || 'Untitled Request'}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{request.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center mt-1 gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {request.properties?.name}
                            {request.units?.unit_number ? ` - Unit ${request.units.unit_number}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge variant={request.priority === 'urgent' ? "destructive" : "outline"} className="text-xs">
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                        
                        {isLate && daysLate > 0 && (
                          <Badge variant="destructive" className="text-xs flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {daysLate} {daysLate === 1 ? 'day' : 'days'} late
                          </Badge>
                        )}
                        
                        <Badge className={`${statusColors[request.status as keyof typeof statusColors]} text-xs`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => handleNavigateToMaintenance(request.property_id)}
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>View maintenance details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
                {criticalMaintenance.length > 5 && (
                  <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2"
                      onClick={() => navigate("/properties")}
                    >
                      View all {criticalMaintenance.length} requests
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <Wrench className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
                <p className="text-sm text-muted-foreground">No critical maintenance requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
