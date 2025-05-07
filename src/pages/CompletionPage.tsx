
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { useAssessment } from "@/contexts/AssessmentContext";
import { RaterType } from "@/types/assessment";
import { useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CompletionPage = () => {
  const { assessment, currentRater } = useAssessment();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Auto logout self-rater after a delay
  useEffect(() => {
    if (currentRater === RaterType.SELF) {
      const timer = setTimeout(() => {
        logout();
        navigate("/login");
      }, 30000); // Auto logout after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [currentRater, logout, navigate]);
  
  // Redirect if no assessment is initialized
  useEffect(() => {
    if (!assessment) {
      navigate("/start");
    }
  }, [assessment, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  if (!assessment) {
    return null; // Will redirect due to the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Logo />
          <Button variant="outline" onClick={handleLogout}>
            {currentRater === RaterType.SELF ? "Logout" : "Home"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 container max-w-2xl mx-auto py-6 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assessment Complete!</CardTitle>
            <CardDescription>
              {currentRater === RaterType.SELF ? 
                "Thank you for completing your self-assessment." :
                `Thank you for completing your assessment for ${assessment.selfRaterName}.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-2 flex items-center">
                <Check className="mr-2 h-5 w-5" />
                Your responses have been recorded
              </h3>
              <p className="text-green-700 text-sm">
                {currentRater === RaterType.SELF ?
                  "Your comprehensive results will be available once all raters have completed their assessments." :
                  "The person you rated will receive the results once all assessments have been completed."
                }
              </p>
            </div>
            
            {currentRater === RaterType.SELF && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  Note: You will be automatically logged out in a few seconds. You can always log back in using your code.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleLogout}
            >
              {currentRater === RaterType.SELF ? "Logout" : "Return to Home"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CompletionPage;
