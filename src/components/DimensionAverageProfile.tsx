
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
                <th className="px-4 py-2 text-center font-medium">Range</th>
              </tr>
            </thead>
            <tbody>
              {dimensionScores.map((score, index) => {
                const dimensionName = "dimension" in score ? score.dimension : (score as any).name;
                const isIndividual = !('selfScore' in score);

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
                          {
                            (() => {
                              // Calculate average from available scores
                              const scores = [
                                (score as any).selfScore, 
                                (score as any).rater1Score, 
                                (score as any).rater2Score
                              ].filter(s => s !== undefined && s !== null && s !== 0);
                              
                              if (scores.length === 0) return "N/A";
                              
                              const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
                              return formatScore(avg);
                            })()
                          }
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-2 text-center">
                        {formatScore(isIndividual ? (score as any).score : undefined)}
                      </td>
                    )}
                    
                    <td className="px-4 py-2 text-center text-muted-foreground text-sm">
                      {score.min} to {score.max}
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
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DimensionAverageProfile;
