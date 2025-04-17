import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { UsersSettings } from "@/components/settings/users/UsersSettings";
import { MyProfileSettings } from "@/components/settings/MyProfileSettings";
import { Dashboard } from "@/components/Dashboard";
import { Properties } from "@/components/Properties";
import { PropertyDetails } from "@/pages/PropertyDetails";
import { Tenants } from "@/components/tenants/Tenants";
import { DashboardContent } from "@/components/DashboardContent";
import { Forms } from "@/components/forms/Forms";
import FormBuilder from "@/pages/FormBuilder";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import TenantDetails from "@/pages/TenantDetails";
import { SessionContext, SessionContextValue } from "@/components/SessionContext";
import { Session } from "@supabase/supabase-js";
import LeaseCreation from "./pages/LeaseCreation";
import { OrganizationSettings } from "@/components/settings/organization/OrganizationSettings";

const themeScript = `
  let isDark;
  try {
    isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
  } catch (e) {}
`;

const script = document.createElement('script');
script.innerHTML = themeScript;
document.head.appendChild(script);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignInForm />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpForm />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardContent organizationId="" />} />
        <Route path="dashboard" element={<DashboardContent organizationId="" />} />
        <Route path="properties/*" element={<Properties />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenants/:id" element={<TenantDetails />} />
        <Route path="forms" element={<Forms />} />
        <Route path="forms/builder/:id?" element={<FormBuilder />} />
        <Route
          path="settings/profile"
          element={
            <SettingsLayout activeSection="profile">
              <MyProfileSettings />
            </SettingsLayout>
          }
        />
        <Route
          path="settings/users"
          element={
            <SettingsLayout activeSection="users">
              <UsersSettings />
            </SettingsLayout>
          }
        />
        <Route
          path="settings/organization"
          element={
            <SettingsLayout activeSection="organization">
              <OrganizationSettings />
            </SettingsLayout>
          }
        />
        <Route path="/tenants/:tenantId/lease" element={<LeaseCreation />} />
      </Route>
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<{ user: any } | undefined>(undefined);
  const { toast } = useToast();
  const [initialThemeLoaded, setInitialThemeLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUserData({
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email,
            user_metadata: {
              first_name: currentSession.user.user_metadata.first_name,
              last_name: currentSession.user.user_metadata.last_name,
            }
          }
        });
        console.log("Session initialized with user:", currentSession.user.email);
        
        if (!initialThemeLoaded) {
          fetchUserTheme(currentSession.user.id);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUserData({
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email,
            user_metadata: {
              first_name: currentSession.user.user_metadata.first_name,
              last_name: currentSession.user.user_metadata.last_name,
            }
          }
        });
        console.log("Session updated with user:", currentSession.user.email);
        
        if (!initialThemeLoaded) {
          fetchUserTheme(currentSession.user.id);
        }
      } else {
        setUserData(undefined);
        console.log("Session cleared");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialThemeLoaded]);

  const fetchUserTheme = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user theme:", error);
        return;
      }
      
      if (data?.theme) {
        console.log("Setting initial theme to:", data.theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(data.theme);
        setInitialThemeLoaded(true);
      }
    } catch (err) {
      console.error("Failed to fetch user theme:", err);
    }
  };

  useEffect(() => {
    if (!session && window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
      const checkExistingToken = async () => {
        try {
          const existingToken = localStorage.getItem('supabase.auth.token');
          if (existingToken) {
            const { error } = await supabase.auth.getUser();
            if (error) {
              console.error("Auth error:", error);
              toast({
                title: "Session expired",
                description: "Your session has expired. Please sign in again.",
                variant: "destructive",
              });
            }
          }
        } catch (e) {
          console.error("Error checking auth state:", e);
        }
      };
      
      checkExistingToken();
    }
  }, [session, toast]);

  const sessionContextValue: SessionContextValue = {
    session,
    data: userData,
  };

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-background antialiased">
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
            </BrowserRouter>
          </QueryClientProvider>
        </div>
      </ThemeProvider>
    </SessionContext.Provider>
  );
}
