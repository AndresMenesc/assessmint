
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn, UserIcon, Mail, Lock, User, Hash, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  code: z.string().min(3, {
    message: "Assessment code must be at least 3 characters."
  }),
  userType: z.enum(["self", "rater"]),
});

const adminFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const resetPasswordFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, codeLogin, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      code: "",
      userType: "self",
    },
  });

  const adminForm = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const userType = userForm.watch("userType");

  const onUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true);
    try {
      const isSelf = values.userType === "self";
      const result = await codeLogin(values.email, values.name, values.code, isSelf);

      if (result.success) {
        if (isSelf && result.isNewAssessment) {
          // Self-assessment with new assessment
          navigate("/start", {
            state: {
              name: values.name,
              email: values.email,
              code: values.code
            }
          });
        } else if (isSelf && !result.isNewAssessment) {
          // Self-assessment with existing assessment
          navigate("/assessment", {
            state: {
              name: values.name,
              email: values.email,
              code: values.code,
              raterType: "self"
            }
          });
        } else {
          // Rater assessment - ensure we navigate to assessment page
          navigate("/assessment", {
            state: {
              name: values.name,
              email: values.email,
              code: values.code,
              raterType: "rater"
            }
          });
        }
        toast.success("Login successful");
      } else {
        if (isSelf) {
          toast.error("Error creating assessment. Please try again.");
        } else {
          toast.error("Invalid assessment code or the assessment doesn't exist.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const onAdminSubmit = async (values: z.infer<typeof adminFormSchema>) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast.success("Login successful!");

        // Explicitly check user role and navigate to appropriate page
        if (userRole === "super_admin") {
          navigate("/admin", { replace: true });
        } else if (userRole === "admin") {
          navigate("/results", { replace: true });
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: z.infer<typeof resetPasswordFormSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setIsResetEmailSent(true);
        toast.success("Password reset link sent to your email");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
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
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <LogIn className="h-6 w-6" />
              ORBIT Assessment
            </CardTitle>
            <CardDescription>
              Owner Readiness & Behavioral Insight Tool
            </CardDescription>
          </CardHeader>

          <Tabs
            defaultValue="user"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "user" | "admin")}
            className="w-full"
          >
            <div className="px-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="user">Assessment</TabsTrigger>
                <TabsTrigger value="admin">Admin Access</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="user" className="mt-0">
              <CardContent>
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                    <FormField
                      control={userForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <Label>Assessment Type</Label>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="self" id="self" />
                                <Label htmlFor="self" className="font-normal cursor-pointer">
                                  Self Assessment (I'm assessing myself)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="rater" id="rater" />
                                <Label htmlFor="rater" className="font-normal cursor-pointer">
                                  Rating Another Person
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="name">Your Name</Label>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="name"
                                className="pl-10"
                                placeholder="Enter your full name"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="email">Your Email</Label>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                className="pl-10"
                                placeholder="Enter your email address"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="code">Assessment Code</Label>
                          <FormControl>
                            <div className="relative">
                              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="code"
                                className="pl-10"
                                placeholder={userType === "self" ? "Create or enter existing code" : "Enter assessment code"}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground mt-1">
                            {userType === "self"
                              ? "Create a new code or enter an existing one to continue your assessment."
                              : "Enter the code provided by the person you're rating."}
                          </p>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="mr-2">Processing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          {userType === "self" ? "Begin Self Assessment" : "Continue to Rating"}
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
              <CardContent>
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <FormField
                      control={adminForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="admin-email">Email</Label>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="admin-email"
                                type="email"
                                className="pl-10"
                                placeholder="Admin email address"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="admin-password">Password</Label>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="admin-password"
                                type="password"
                                className="pl-10"
                                placeholder="Admin password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="mr-2">Logging in...</span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <LogIn className="mr-2 h-4 w-4" />
                          Admin Login
                        </span>
                      )}
                    </Button>

                    <div className="text-center mt-4">
                      <Button 
                        variant="link" 
                        onClick={() => setIsResetDialogOpen(true)}
                        type="button"
                        className="text-sm"
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Forgot Password?
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isResetEmailSent ? "Email Sent" : "Reset Password"}</DialogTitle>
            <DialogDescription>
              {isResetEmailSent 
                ? "Check your email for a reset password link. Follow the instructions to create a new password." 
                : "Enter your email address and we'll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>
          
          {!isResetEmailSent ? (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="reset-email">Email</Label>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="reset-email"
                            type="email"
                            className="pl-10"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="sm:justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsResetDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <DialogFooter className="sm:justify-end">
              <Button 
                type="button" 
                onClick={() => {
                  setIsResetDialogOpen(false);
                  setIsResetEmailSent(false);
                  resetPasswordForm.reset();
                }}
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
