
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAssessment } from "@/contexts/AssessmentContext";
import { Question } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useState, useEffect, KeyboardEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuestionCardProps {
  question: Question;
  onNext: () => void;
  onBack?: () => void;
  isFirstQuestion: boolean;
}

const QuestionCard = ({ question, onNext, onBack, isFirstQuestion }: QuestionCardProps) => {
  const { responses, updateResponse } = useAssessment();
  const isMobile = useIsMobile();
  
  // Find existing response for this question
  const existingResponse = responses.find(r => r.questionId === question.id);
  const [selectedScore, setSelectedScore] = useState<number | null>(
    existingResponse ? existingResponse.score : null
  );
  
  // Reset selected score when the question changes
  useEffect(() => {
    const response = responses.find(r => r.questionId === question.id);
    setSelectedScore(response ? response.score : null);
  }, [question.id, responses]);

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
    updateResponse(question.id, score);
  };

  const handleNext = () => {
    if (selectedScore !== null) {
      onNext();
    } else {
      toast.error("Please select an answer before continuing");
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  // Handle keyboard events for accessibility - Modified to prevent auto-advancing with Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Only allow numbers 1-5 to select answers
    if (e.key >= "1" && e.key <= "5") {
      const score = parseInt(e.key);
      handleScoreSelect(score);
      e.preventDefault(); // Prevent any default behavior
    } 
    // Allow Backspace for back navigation, but don't auto-advance
    else if (e.key === "Backspace" && onBack && !isFirstQuestion) {
      handleBack();
      e.preventDefault();
    }
    // Prevent Enter from automatically advancing
    else if (e.key === "Enter") {
      e.preventDefault(); // Stop the Enter key from triggering next
      // Don't auto-advance, user must click the Next button
    }
  };

  return (
    <Card className="w-full max-w-3xl" tabIndex={0} onKeyDown={handleKeyDown}>
      <CardHeader className="text-center">
        <p className="text-muted-foreground text-sm">
          Please rate on a scale of 1-5:
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-xl mb-8 text-center">{question.text}</p>
        
        <div className="flex justify-between mb-8">
          <div className="text-sm text-left">Strongly Disagree</div>
          <div className="text-sm text-right">Strongly Agree</div>
        </div>
        
        <div className="flex justify-between space-x-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <Button
              key={score}
              variant={selectedScore === score ? "default" : "outline"}
              className={cn(
                "flex-1 h-14 text-lg",
                selectedScore === score ? "bg-orbit-blue hover:bg-orbit-darkBlue" : ""
              )}
              onClick={() => handleScoreSelect(score)}
            >
              {score}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={handleBack}
          disabled={isFirstQuestion}
          variant="outline"
          className="px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedScore === null}
          className="px-6"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
