
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AwarenessMetricsProps {
  selfAwareness: number;
  coachabilityAwareness: number;
}

const AwarenessMetrics = ({ selfAwareness, coachabilityAwareness }: AwarenessMetricsProps) => {
  const getAwarenessColor = (value: number) => {
    if (value < 50) return "bg-red-500";
    if (value < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Self-Awareness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-gray-100">
              <div className="absolute text-3xl font-bold">
                {Math.round(selfAwareness)}%
              </div>
              <svg className="absolute top-0 left-0" width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={
                    selfAwareness < 50 
                      ? "#ef4444" 
                      : selfAwareness < 75 
                        ? "#eab308" 
                        : "#22c55e"
                  }
                  strokeWidth="16"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (selfAwareness / 100) * 440}
                  transform="rotate(-90, 80, 80)"
                />
              </svg>
            </div>
          </div>
          <p className="text-center text-muted-foreground">
            Your self-awareness score represents how closely your self-assessment
            aligns with how others perceive you.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coachability Awareness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-gray-100">
              <div className="absolute text-3xl font-bold">
                {Math.round(coachabilityAwareness)}%
              </div>
              <svg className="absolute top-0 left-0" width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={
                    coachabilityAwareness < 50 
                      ? "#ef4444" 
                      : coachabilityAwareness < 75 
                        ? "#eab308" 
                        : "#22c55e"
                  }
                  strokeWidth="16"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (coachabilityAwareness / 100) * 440}
                  transform="rotate(-90, 80, 80)"
                />
              </svg>
            </div>
          </div>
          <p className="text-center text-muted-foreground">
            Your coachability awareness score shows how accurately you assess your own
            receptiveness to feedback and growth.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AwarenessMetrics;
