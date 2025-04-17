import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const signUpSchema = z.object({
  organizationName: z.string().min(1, "Organization or account name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      organizationName: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleAuthError = (error: Error) => {
    console.error('Signup error:', error);
    
    switch (error.message) {
      case "User already registered":
        toast({
          title: "Error",
          description: "This email is already registered",
          variant: "destructive",
        });
        break;
      default:
        toast({
          title: "Error",
          description: "An error occurred during sign up",
          variant: "destructive",
        });
    }
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting signup form with data:', data); // Debug log
      
      // Check if user already exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email.trim().toLowerCase());
        
      if (userCheckError) {
        console.error('Error checking existing user:', userCheckError);
      } else if (existingUser && existingUser.length > 0) {
        toast({
          title: "Error",
          description: "This email is already registered",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Step 1: Sign up the user
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            organization_name: data.organizationName.trim(),
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
            phone_number: data.phoneNumber.trim(),
          },
        },
      });

      if (error) {
        console.error('Signup error details:', error); // Debug log
        handleAuthError(error);
        return;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user");
      }
      
      // Step 2: Explicitly verify organization and profile were created
      const userId = authData.user.id;
      console.log('User created with ID:', userId);
      
      // Check if profile was created by the trigger
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, organization_id')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.log('Profile not found, creating manually...');
        
        // Create organization manually
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert([{ name: data.organizationName.trim() }])
          .select('id')
          .single();
          
        if (orgError) {
          console.error('Error creating organization:', orgError);
          throw new Error('Failed to create organization');
        }
        
        const organizationId = orgData.id;
        console.log('Created organization with ID:', organizationId);
        
        // Create profile manually
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            phone_number: data.phoneNumber.trim(),
            organization_id: organizationId,
            is_superadmin: true,
            status: 'active'
          }]);
          
        if (insertProfileError) {
          console.error('Error creating profile:', insertProfileError);
          throw new Error('Failed to create profile');
        }
        
        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: userId,
            role: 'super_admin'
          }]);
          
        if (roleError) {
          console.error('Error creating user role:', roleError);
          throw new Error('Failed to create user role');
        }
      } else {
        console.log('Profile already created:', profileData);
        
        // If profile exists but doesn't have an organization_id, update it
        if (!profileData.organization_id) {
          console.log('Profile missing organization_id, creating organization...');
          
          // Create organization
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert([{ name: data.organizationName.trim() }])
            .select('id')
            .single();
            
          if (orgError) {
            console.error('Error creating organization:', orgError);
            throw new Error('Failed to create organization');
          }
          
          // Update profile with organization_id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ organization_id: orgData.id, is_superadmin: true })
            .eq('id', userId);
            
          if (updateError) {
            console.error('Error updating profile:', updateError);
            throw new Error('Failed to update profile with organization ID');
          }
          
          // Create user role if it doesn't exist
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .single();
            
          if (!existingRole) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert([{
                user_id: userId,
                role: 'super_admin'
              }]);
              
            if (roleError) {
              console.error('Error creating user role:', roleError);
              throw new Error('Failed to create user role');
            }
          }
        }
      }

      console.log('Signup successful'); // Debug log
      toast({
        title: "Success!",
        description: "Your account has been created. Welcome to Lotus!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Unexpected signup error:', error); // Debug log
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-black"
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
        `}
      </style>

      <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 overflow-hidden">
            <img 
              src="/lovable-uploads/e60d0680-20a8-4a92-b52e-e52eb71f1343.png" 
              alt="Lotus Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-playfair font-bold text-primary tracking-wide">
            Lotus
          </h1>
          <p className="text-accent text-sm mt-1">Create your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Organization or account name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your organization or account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};
