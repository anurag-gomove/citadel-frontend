import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTheme } from "next-themes";

export const SignInForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthError = async (error: AuthError) => {
    console.error("Auth error:", error);
    
    if (error.message === "Invalid login credentials") {
      toast({
        title: "Error",
        description: "The email or password you entered is incorrect",
        variant: "destructive",
      });
      return;
    }

    if (error.message.includes("Invalid Refresh Token") || error.message.includes("not found")) {
      await supabase.auth.signOut();
      toast({
        title: "Session Expired",
        description: "Please sign in again",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Error",
      description: "An error occurred during sign in. Please try again.",
      variant: "destructive",
    });
  };

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
        console.log("Setting theme to:", data.theme);
        setTheme(data.theme);
      }
    } catch (err) {
      console.error("Failed to fetch user theme:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log("Attempting sign in with:", { email: formData.email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        await handleAuthError(error);
        return;
      }

      if (data?.user) {
        await fetchUserTheme(data.user.id);
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden antialiased transition-colors duration-200">
      <div 
        className="absolute inset-0 transition-colors duration-200"
        style={{
          background: `
            radial-gradient(circle at 30% 40%, #9b87f5 0%, transparent 40%),
            radial-gradient(circle at 80% 30%, #E65C2E 0%, transparent 40%),
            radial-gradient(circle at 50% 70%, #0FA0CE 0%, transparent 40%),
            radial-gradient(circle at 70% 50%, #6E59A5 0%, transparent 40%),
            radial-gradient(circle at 40% 60%, #33C3F0 0%, transparent 40%),
            radial-gradient(circle at 60% 30%, #1EAEDB 0%, transparent 40%),
            #0c0c0c
          `,
          backgroundBlendMode: 'screen',
          backgroundSize: '200% 200%',
          animation: 'moveGradient 20s ease-in-out infinite, pulseGradient 8s ease-in-out infinite',
        }}
      />
      
      <style>
        {`
          @keyframes moveGradient {
            0% {
              background-position: 15% 0%;
            }
            20% {
              background-position: 80% 30%;
            }
            40% {
              background-position: 30% 85%;
            }
            60% {
              background-position: 95% 60%;
            }
            80% {
              background-position: 45% 95%;
            }
            100% {
              background-position: 15% 0%;
            }
          }

          @keyframes pulseGradient {
            0% {
              opacity: 1;
              background-size: 200% 200%;
            }
            50% {
              opacity: 0.8;
              background-size: 220% 220%;
            }
            100% {
              opacity: 1;
              background-size: 200% 200%;
            }
          }

          ::selection {
            background-color: rgba(255, 255, 255, 0.1);
            color: #fff;
          }
        `}
      </style>

      <div className="bg-background/90 dark:bg-background/80 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md relative z-10 transition-colors duration-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/e60d0680-20a8-4a92-b52e-e52eb71f1343.png" 
              alt="Lotus Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-playfair font-bold text-foreground tracking-wide transition-colors duration-200">
            Lotus
          </h1>
          <p className="text-muted-foreground text-sm mt-1 transition-colors duration-200">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1 transition-colors duration-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md bg-background transition-colors duration-200 ${
                errors.email ? "border-destructive" : "border-input"
              }`}
              placeholder="john@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1 transition-colors duration-200">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1 transition-colors duration-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md bg-background transition-colors duration-200 pr-10 ${
                  errors.password ? "border-destructive" : "border-input"
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOffIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1 transition-colors duration-200">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-muted-foreground transition-colors duration-200">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
