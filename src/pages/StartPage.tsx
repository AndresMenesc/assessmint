
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAssessment } from "@/contexts/AssessmentContext";

const StartPage = () => {
  const { logout, userEmail, userName, userCode } = useAuth();
  const { initializeAssessment } = useAssessment();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const [isLoading, setIsLoading] = useState(false);

  // If name, email, and code were passed through location state, pre-populate the form
  const prefilledData = {
    name: state?.name || userName || "",
    email: state?.email || userEmail || "",
    code: state?.code || userCode || "",
  };

  // Redirect if no state was passed and no user is logged in
  useEffect(() => {
    if ((!state?.name || !state?.email || !state?.code) && (!userName || !userEmail || !userCode)) {
      navigate("/login");
    }
  }, [state, navigate, userName, userEmail, userCode]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStartAssessment = async () => {
    setIsLoading(true);
    try {
      // Initialize assessment with the code
      await initializeAssessment(prefilledData.email, prefilledData.name, prefilledData.code);
      
      // Then navigate to assessment page
      navigate("/assessment", { 
        state: { 
          name: prefilledData.name, 
          email: prefilledData.email, 
          code: prefilledData.code,
          raterType: "self" 
        } 
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      // Error is already shown by toast in assessmentOperations.ts
      // Navigate back to login if there's an error with the assessment
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto py-6 px-4 flex justify-between items-center">
        <Link to="/login" className="inline-block">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Start Your Assessment</CardTitle>
            <CardDescription>
              Click the button below to begin your self-assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              This assessment consists of 84 questions and should take approximately 
              15-20 minutes to complete. Your answers will be used to generate 
              insights about your leadership style.
            </p>
            
            <div className="bg-muted p-4 rounded-md mb-6">
              <div className="mb-2">
                <span className="font-medium">Name:</span> {prefilledData.name}
              </div>
              <div className="mb-2">
                <span className="font-medium">Email:</span> {prefilledData.email}
              </div>
              <div>
                <span className="font-medium">Assessment Code:</span> {prefilledData.code}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleStartAssessment}
              disabled={isLoading}
            >
              {isLoading ? "Starting..." : "Begin Assessment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StartPage;
