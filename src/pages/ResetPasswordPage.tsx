
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

const passwordResetSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const getTokenFromUrl = () => {
      // Extract token from URL parameters
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      // Check for token in query params
      const queryToken = searchParams.get('token');
      
      // Check for token in hash (for Supabase auth redirects)
      const accessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      
      if (queryToken) {
        console.log("Found token in query params:", queryToken);
        setToken(queryToken);
        return true;
      } else if ((hashType === 'recovery' || hashType === 'signup') && accessToken) {
        console.log("Found token in hash:", accessToken);
        setToken(accessToken);
        // Clean URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
      }
      
      return false;
    };
    
    const tokenFound = getTokenFromUrl();
    if (!tokenFound) {
      setError("No reset token found. Please request a new password reset link.");
    }
  }, [location]);

  const onSubmit = async (data: PasswordResetFormValues) => {
    if (!token) {
      setError("No reset token found. Please request a new password reset link.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Set session with the recovery token
      const { error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        toast.error("Error resetting password. Please try again.");
        setError("Error resetting password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (updateError) {
        console.error("Error updating password:", updateError);
        toast.error(updateError.message || "Error resetting password. Please try again.");
        setError(updateError.message || "Error resetting password. Please try again.");
      } else {
        toast.success("Password has been updated successfully.");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center">
          <Logo />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : (
                "Enter your new password below."
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!error && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="password"
                              className="pl-10"
                              placeholder="Enter your new password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="password"
                              className="pl-10"
                              placeholder="Confirm your new password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating Password..." : "Reset Password"}
                    </Button>
                  </div>

                  <div className="text-center pt-4">
                    <Button 
                      variant="link" 
                      className="text-sm" 
                      onClick={() => navigate("/login")}
                    >
                      Return to Login
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            {error && (
              <div className="pt-4 text-center">
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/login")}
                >
                  Return to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
