
import { ReactNode } from "react";
import { Settings, Users, Shield, Link2, CreditCard, BarChart3, FolderUp, BookOpen, AppWindow, KeyRound, UserCircle, Clock, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SettingsLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const navigation = [
  { name: "My Profile", href: "/settings/profile", icon: UserCircle, enabled: true },
  { name: "Users", href: "/settings/users", icon: Users, enabled: true },
  { name: "Organization", href: "/settings/organization", icon: Building, enabled: true },
  { name: "General", href: "/settings/general", icon: Settings, enabled: false },
  { name: "Customization", href: "/settings/customization", icon: AppWindow, enabled: false },
  { name: "Security", href: "/settings/security", icon: Shield, enabled: false },
  { name: "Connections", href: "/settings/connections", icon: Link2, enabled: false },
  { name: "Billing", href: "/settings/billing", icon: CreditCard, enabled: false },
  { name: "Usage Stats", href: "/settings/usage", icon: BarChart3, enabled: false },
  { name: "Tidy Up", href: "/settings/tidy-up", icon: FolderUp, enabled: false },
  { name: "Content Directory", href: "/settings/content", icon: BookOpen, enabled: false },
  { name: "Permissions", href: "/settings/permissions", icon: KeyRound, enabled: false },
];

export function SettingsLayout({ children, activeSection }: SettingsLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Administration</h1>
      </div>

      <div className="flex gap-4">
        {/* Sidebar Navigation */}
        <div className="w-52 shrink-0">
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = activeSection === item.name.toLowerCase();
              return (
                <div
                  key={item.name}
                  className="flex items-center"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 px-2 py-2 h-auto font-normal",
                      isActive && "bg-accent text-accent-foreground",
                      !item.enabled && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => item.enabled && navigate(item.href)}
                    disabled={!item.enabled}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                  {!item.enabled && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 bg-muted text-muted-foreground flex items-center gap-1 text-xs px-1.5 py-0"
                    >
                      <Clock className="h-2.5 w-2.5" />
                      Soon
                    </Badge>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-card rounded-lg border p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
