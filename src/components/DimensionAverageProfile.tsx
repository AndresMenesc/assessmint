
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DimensionScore } from "@/types/assessment";

interface DimensionAverageProfileProps {
  scores: DimensionScore[];
  profileType: string;
}

const DimensionAverageProfile = ({ scores, profileType }: DimensionAverageProfileProps) => {
  // Filter out the Coachability dimension since it's not part of profile determination
  const dimensionScores = scores.filter(score => {
    const dimensionName = "dimension" in score ? score.dimension : (score as any).name;
    return dimensionName !== "Coachability";
  });

  // Helper function to format scores for display
  const formatScore = (score: number | undefined) => {
    if (score === undefined || score === null) return "N/A";
    return score.toFixed(1);
  };

  // Helper function to get the descriptive range based on dimension and score
  const getDescriptiveRange = (dimensionName: string, score: number | undefined): string => {
    if (score === undefined || score === null) return "N/A";
    
    // Default ranges for most dimensions
    if (dimensionName === "Adaptability") {
      if (score <= -10) return "High Flexibility (-28 to -10)";
      if (score >= 10) return "High Precision (10 to 28)";
      return "Balanced (-9 to 9)";
    } 
    else if (dimensionName === "Problem Resolution") {
      if (score <= -10) return "Avoidant (-28 to -10)";
      if (score >= 10) return "Direct (10 to 28)";
      return "Balanced (-9 to 9)";
    }
    // Standard range for Esteem, Trust, Business Drive
    else {
      if (score <= -10) return "Low (-28 to -10)";
      if (score >= 10) return "High (10 to 28)";
      return "Neutral (-9 to 9)";
    }
  };

  // Check if we have both individual and aggregate scores
  const hasIndividualScores = dimensionScores.length > 0 && 
    ('selfScore' in dimensionScores[0] || 'rater1Score' in dimensionScores[0] || 'rater2Score' in dimensionScores[0]);

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>Average Profile: {profileType}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Dimension</th>
                {hasIndividualScores ? (
                  <>
                    <th className="px-4 py-2 text-center font-medium">Self</th>
                    <th className="px-4 py-2 text-center font-medium">Rater 1</th>
                    <th className="px-4 py-2 text-center font-medium">Rater 2</th>
                    <th className="px-4 py-2 text-center font-medium">Average</th>
                  </>
                ) : (
                  <th className="px-4 py-2 text-center font-medium">Score</th>
                )}
                <th className="px-4 py-2 text-center font-medium">Range Category</th>
              </tr>
            </thead>
            <tbody>
              {dimensionScores.map((score, index) => {
                const dimensionName = "dimension" in score ? score.dimension : (score as any).name;
                const isIndividual = !('selfScore' in score);

                // Calculate average if we have individual scores
                let averageScore: number | undefined;
                if (hasIndividualScores && !isIndividual) {
                  const scores = [
                    (score as any).selfScore, 
                    (score as any).rater1Score, 
                    (score as any).rater2Score
                  ].filter(s => s !== undefined && s !== null && s !== 0);
                  
                  averageScore = scores.length === 0 ? undefined : 
                    scores.reduce((sum, val) => sum + val, 0) / scores.length;
                } else {
                  averageScore = isIndividual ? (score as any).score : undefined;
                }

                return (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                  >
                    <td className="px-4 py-2 font-medium">
                      {dimensionName}
                    </td>
                    
                    {hasIndividualScores && !isIndividual ? (
                      <>
                        <td className="px-4 py-2 text-center">
                          {formatScore((score as any).selfScore)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {formatScore((score as any).rater1Score)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {formatScore((score as any).rater2Score)}
                        </td>
                        <td className="px-4 py-2 text-center font-medium">
                          {formatScore(averageScore)}
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-2 text-center">
                        {formatScore(isIndividual ? (score as any).score : undefined)}
                      </td>
                    )}
                    
                    <td className="px-4 py-2 text-center">
                      {getDescriptiveRange(dimensionName, averageScore)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Alert className="mt-6">
          <AlertTitle>About This Profile</AlertTitle>
          <AlertDescription>
            <p className="mt-2">
              This profile is determined by analyzing the average scores across all dimensions from all raters.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong>Esteem, Trust, Business Drive:</strong> Low (-28 to -10), Neutral (-9 to 9), High (10 to 28)</li>
              <li><strong>Adaptability:</strong> High Flexibility (-28 to -10), Balanced (-9 to 9), High Precision (10 to 28)</li>
              <li><strong>Problem Resolution:</strong> Avoidant (-28 to -10), Balanced (-9 to 9), Direct (10 to 28)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DimensionAverageProfile;
