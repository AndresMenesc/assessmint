
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="flex justify-between mb-2 text-sm text-muted-foreground">
        <span>Question {current} of {total}</span>
        <span>{percentage}% Complete</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default ProgressBar;
