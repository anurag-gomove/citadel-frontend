
import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Home, Users, Settings, HelpCircle, LogOut, Bell, Search, Heart, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

type ActiveSection = "dashboard" | "properties" | "tenants" | "forms" | "settings" | "help" | "";

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isActive: boolean;
  isComingSoon?: boolean;
}

export const Dashboard = () => {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();

  const getActiveSection = (): ActiveSection => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/properties")) return "properties";
    if (path.startsWith("/tenants")) return "tenants";
    if (path.startsWith("/forms")) return "forms";
    if (path.startsWith("/settings")) return "settings";
    if (path.startsWith("/help")) return "help";
    if (path === "/") return "dashboard";
    return "";
  };

  const activeSection = getActiveSection();

  const handleLogoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);

      // Clear any cached data first
      queryClient.clear();

      // Force clear local storage
      localStorage.clear();

      // Force clear session
      const {
        error: sessionError
      } = await supabase.auth.setSession({
        access_token: '',
        refresh_token: ''
      });
      if (sessionError) console.error('Session clear error:', sessionError);

      // Sign out from Supabase
      const {
        error
      } = await supabase.auth.signOut({
        scope: 'local'
      });
      if (error) throw error;

      // Force page reload and redirect
      window.location.replace('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive"
      });
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate("/plans");
  };

  const handleHelpClick = () => {
    window.open("https://www.youtube.com/watch?v=BBJa32lCaaY", "_blank");
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const NavButton = ({
    icon: Icon,
    label,
    onClick,
    isActive,
    isComingSoon = false
  }: NavButtonProps) => {
    const button = (
      <button 
        onClick={e => {
          e.preventDefault();
          if (!isComingSoon) {
            onClick(e);
          }
        }} 
        type="button" 
        className={`flex items-center ${sidebarExpanded ? "justify-start" : "justify-center"} gap-3 w-full p-3 rounded-lg transition-colors relative ${
          isActive && !isComingSoon
            ? "bg-primary text-primary-foreground" 
            : isComingSoon 
              ? "text-muted-foreground/50 hover:bg-accent/30 cursor-not-allowed" 
              : "text-muted-foreground hover:bg-accent"
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${isComingSoon ? "opacity-50" : ""}`} />
        {sidebarExpanded && (
          <>
            <span className="truncate">{label}</span>
            {isComingSoon && (
              <Badge variant="outline" className="ml-auto text-xs border-yellow-500 text-yellow-500">
                Coming Soon
              </Badge>
            )}
          </>
        )}
      </button>
    );

    return sidebarExpanded ? (
      button
    ) : (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {label} {isComingSoon && <span className="text-yellow-500 ml-1">(Coming Soon)</span>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
        <div className={`${sidebarExpanded ? "w-52" : "w-14"} bg-card border-r border-border transition-all duration-200 ease-in-out flex flex-col relative`}>
          <div className="flex items-center gap-3 mb-8 p-4">
            <Home className="h-5 w-5 shrink-0 text-foreground" />
            {sidebarExpanded && <span className="font-bold text-xl text-foreground">Lotus</span>}
          </div>

          <nav className="space-y-1 flex-1 px-2">
            <NavButton icon={LayoutDashboard} label="Dashboard" onClick={() => navigate("/dashboard")} isActive={activeSection === "dashboard"} />
            <NavButton icon={Home} label="Properties" onClick={() => navigate("/properties")} isActive={activeSection === "properties"} />
            <NavButton icon={Users} label="Tenants" onClick={() => navigate("/tenants")} isActive={activeSection === "tenants"} />
            <NavButton icon={FileText} label="Forms" onClick={() => {}} isActive={false} isComingSoon={true} />
            <NavButton icon={Settings} label="Settings" onClick={() => navigate("/settings/profile")} isActive={activeSection === "settings"} />
          </nav>

          <div className="space-y-1 px-2">
            <NavButton icon={HelpCircle} label="Help Center" onClick={() => window.open("https://www.youtube.com/watch?v=BBJa32lCaaY", "_blank")} isActive={false} />
            <NavButton icon={LogOut} label="Log out" onClick={handleLogoutClick} isActive={false} />
          </div>

          {sidebarExpanded && <div className="mt-6 p-4 bg-accent rounded-xl mx-2 mb-4">
              <h3 className="font-semibold text-foreground">Upgrade to Premium</h3>
              <p className="text-sm text-muted-foreground mt-1">Get 7 days free trial</p>
              <button onClick={() => navigate("/plans")} className="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Upgrade
              </button>
            </div>}

          <button onClick={toggleSidebar} className="absolute -right-3 top-6 p-1.5 bg-background border border-border rounded-full hover:bg-accent transition-colors z-50">
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4 text-foreground" /> : <ChevronRight className="h-4 w-4 text-foreground" />}
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-background">
          <div className="px-0">
            <Outlet />
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={open => setShowLogoutDialog(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} disabled={isLoggingOut} className="bg-destructive hover:bg-destructive/90">
              {isLoggingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
