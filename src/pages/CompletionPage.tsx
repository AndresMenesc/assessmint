
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import RaterForm from "@/components/RaterForm";
import { useAssessment } from "@/contexts/AssessmentContext";
import { RaterType } from "@/types/assessment";
import { useEffect, useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CompletionPage = () => {
  const { assessment, setCurrentRater, currentRater } = useAssessment();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [addingRater1, setAddingRater1] = useState(false);
  const [addingRater2, setAddingRater2] = useState(false);
  
  // Check if raters exist
  const hasRater1 = assessment?.raters.some(r => r.raterType === RaterType.RATER1);
  const hasRater2 = assessment?.raters.some(r => r.raterType === RaterType.RATER2);
  
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
  
  const handleAddRater1 = () => {
    setCurrentRater(RaterType.RATER1);
    setAddingRater1(true);
  };
  
  const handleAddRater2 = () => {
    setCurrentRater(RaterType.RATER2);
    setAddingRater2(true);
  };
  
  const handleRaterAdded = () => {
    setAddingRater1(false);
    setAddingRater2(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  if (!assessment) {
    return null; // Will redirect due to the useEffect
  }
  
  // Check if user is self-rater or external rater
  const isSelfRater = currentRater === RaterType.SELF;
  const isRater1 = currentRater === RaterType.RATER1;
  const isRater2 = currentRater === RaterType.RATER2;
  
  // External rater completion view
  if (isRater1 || isRater2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <Button variant="outline" onClick={handleLogout}>
              Home
            </Button>
          </div>
        </div>
        
        <div className="flex-1 container max-w-2xl mx-auto py-6 px-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assessment Complete!</CardTitle>
              <CardDescription>
                Thank you for completing your assessment for {assessment.selfRaterName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-2 flex items-center">
                  <Check className="mr-2 h-5 w-5" />
                  Your responses have been recorded
                </h3>
                <p className="text-green-700 text-sm">
                  The person you rated will receive the results once all assessments have been completed.
                </p>
              </div>
              
              <p className="text-center text-muted-foreground mt-6">
                You may now close this window or return to the home page.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleLogout}
              >
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Self-rater view (with ability to add other raters)
  const allRatersAdded = hasRater1 && hasRater2;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Logo />
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      <div className="flex-1 container max-w-2xl mx-auto py-6 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Self-Assessment Complete!</CardTitle>
            <CardDescription>
              Thank you for completing your self-assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              To get the most accurate insights, we need feedback from two other people 
              who work with you. These could be colleagues, team members, or supervisors.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-2 flex items-center">
                <Check className="mr-2 h-5 w-5" />
                Your responses have been recorded
              </h3>
              <p className="text-green-700 text-sm">
                You've completed {assessment.raters.find(r => r.raterType === RaterType.SELF)?.responses.length || 0} 
                out of 84 questions.
              </p>
              <p className="text-green-700 text-sm mt-2">
                Your comprehensive results will be available once all raters have completed their assessments.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Next Steps:</h3>
              
              {addingRater1 ? (
                <div>
                  <h4 className="font-medium mb-2">Add First Rater</h4>
                  <RaterForm onSubmit={handleRaterAdded} />
                </div>
              ) : hasRater1 ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-orbit-blue text-white flex items-center justify-center mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">First Rater Added</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.raters.find(r => r.raterType === RaterType.RATER1)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={handleAddRater1}
                >
                  <span>Add First Rater</span>
                  <UserPlus className="h-5 w-5" />
                </Button>
              )}
              
              {addingRater2 ? (
                <div>
                  <h4 className="font-medium mb-2">Add Second Rater</h4>
                  <RaterForm onSubmit={handleRaterAdded} />
                </div>
              ) : hasRater2 ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-orbit-blue text-white flex items-center justify-center mr-3">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Second Rater Added</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.raters.find(r => r.raterType === RaterType.RATER2)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={handleAddRater2}
                  disabled={!hasRater1}
                >
                  <span>Add Second Rater</span>
                  <UserPlus className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Note: You will be automatically logged out in a few seconds. You can always log back in using your code.
              </p>
            </div>
          </CardContent>
          {allRatersAdded && (
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate("/results")}
              >
                View Preliminary Results
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CompletionPage;
