
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationState {
  name?: string;
  email?: string;
  code?: string;
  raterType?: "self" | "rater";
}

const AssessmentPage = () => {
  const { 
    assessment,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    responses,
    completeAssessment,
    initializeAssessment,
    initializeRaterAssessment,
    loading: assessmentLoading,
    currentRater
  } = useAssessment();
  
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { userRole, userEmail, userName, userCode, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Check if user is admin - admins can't take assessments
  useEffect(() => {
    if (userRole === "super_admin" || userRole === "admin") {
      navigate(userRole === "super_admin" ? "/admin" : "/results");
      toast.error("Admins can only view assessment results");
      return;
    }
  }, [userRole, navigate]);
  
  // Initialize assessment with state from login page or from auth context
  useEffect(() => {
    const setupAssessment = async () => {
      // Reset question index to start from the first question
      setCurrentQuestionIndex(0);
      
      const effectiveEmail = state?.email || userEmail;
      const effectiveName = state?.name || userName;
      const effectiveCode = state?.code || userCode;
      
      if (effectiveEmail && effectiveName && effectiveCode) {
        console.log("Assessment state:", { email: effectiveEmail, name: effectiveName, code: effectiveCode });
        
        // Check if it's a self assessment or a rater assessment
        if ((state?.raterType === "self") || (!state?.raterType && userRole === "rater")) {
          console.log("Initializing self assessment for:", effectiveEmail, effectiveName);
          try {
            await initializeAssessment(effectiveEmail, effectiveName, effectiveCode);
            toast.success("Self assessment initialized successfully");
          } catch (error) {
            console.error("Error initializing self assessment:", error);
            toast.error("Error initializing assessment");
            navigate("/login");
          }
        } else if ((state?.raterType === "rater") || userRole === "rater") {
          console.log("Initializing rater assessment");
          // Initialize as a rater for someone else
          try {
            await initializeRaterAssessment(effectiveEmail, effectiveName, effectiveCode);
            toast.success("Rater assessment initialized successfully");
          } catch (error) {
            console.error("Error initializing rater assessment:", error);
            toast.error("Error initializing assessment");
            navigate("/login");
          }
        } else {
          console.log("Invalid state - redirecting to login");
          // Invalid state, redirect to login
          navigate("/login");
          toast.error("Invalid assessment information provided");
        }
      } else if (!assessment) {
        console.log("No state or assessment - redirecting to login");
        // No state passed and no active assessment, redirect to login
        navigate("/login");
        toast.error("Please start a new assessment");
      }
      setIsInitializing(false);
    };
    
    setupAssessment();
  }, []);
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    } else {
      // All questions answered, check if all questions have responses
      const currentRaterResponses = assessment?.raters.find(r => r.raterType === currentRater)?.responses || [];
      const unansweredQuestions = questions.filter(q => 
        !currentRaterResponses.some(r => r.questionId === q.id)
      );
      
      if (unansweredQuestions.length > 0) {
        toast.error(`Please answer all questions (${unansweredQuestions.length} unanswered)`);
        // Navigate to the first unanswered question
        const firstUnanswered = questions.findIndex(q => q.id === unansweredQuestions[0].id);
        if (firstUnanswered !== -1) {
          setCurrentQuestionIndex(firstUnanswered);
        }
      } else {
        // All questions answered, complete the assessment
        completeAssessment();
        navigate("/completion");
      }
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const totalQuestions = questions.length;
  
  // If user is admin, they shouldn't be here
  if (userRole === "super_admin" || userRole === "admin") {
    return null; // Will redirect due to the useEffect
  }
  
  if (isInitializing || assessmentLoading || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center items-center">
        <Card className="p-8">
          <p>Loading assessment...</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground mr-2">
              <span className="font-medium">Code:</span> {assessment.code}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto py-6 px-4">
        <ProgressBar 
          current={currentQuestionIndex + 1} 
          total={totalQuestions} 
        />
        
        <ScrollArea className="h-full">
          {questions.length > 0 && (
            <div className="flex justify-center">
              <QuestionCard 
                question={questions[currentQuestionIndex]} 
                onNext={handleNext}
                onBack={handleBack}
                isFirstQuestion={currentQuestionIndex === 0}
              />
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default AssessmentPage;
