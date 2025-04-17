import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DimensionScore } from "@/types/assessment";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DimensionAverageProfileProps {
  scores: DimensionScore[];
  profileType: string;
}

const DimensionAverageProfile = ({ scores, profileType }: DimensionAverageProfileProps) => {
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const dimensionScores = scores.filter(score => {
    const dimensionName = "dimension" in score ? score.dimension : (score as any).name;
    return dimensionName !== "Coachability";
  });

  const formatScore = (score: number | undefined) => {
    if (score === undefined || score === null) return "N/A";
    return score.toFixed(1);
  };

  const getDescriptiveRange = (dimensionName: string, score: number | undefined): string => {
    if (score === undefined || score === null) return "N/A";
    
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
    else {
      if (score <= -10) return "Low (-28 to -10)";
      if (score >= 10) return "High (10 to 28)";
      return "Neutral (-9 to 9)";
    }
  };

  const getDimensionCategory = (dimensionName: string, score: number | undefined): string => {
    if (score === undefined || score === null) return "N/A";
    
    if (dimensionName === "Adaptability") {
      if (score <= -10) return "High Flexibility";
      if (score >= 10) return "High Precision";
      return "Balanced";
    } 
    else if (dimensionName === "Problem Resolution") {
      if (score <= -10) return "Avoidant";
      if (score >= 10) return "Direct";
      return "Balanced";
    }
    else {
      if (score <= -10) return "Low";
      if (score >= 10) return "High";
      return "Neutral";
    }
  };

  const hasIndividualScores = dimensionScores.length > 0 && 
    ('selfScore' in dimensionScores[0] || 'rater1Score' in dimensionScores[0] || 'rater2Score' in dimensionScores[0]);

  const profileDescriptions: Record<string, { 
    dimensions: { [key: string]: string }, 
    description: string 
  }> = {
    "The Trusting Driven Flexible": {
      dimensions: {
        "Esteem": "Neutral",
        "Trust": "High",
        "Business Drive": "High",
        "Adaptability": "High Flexibility",
        "Problem Resolution": "Direct"
      },
      description: "Shows balanced self-confidence without excessive pride or insecurity. Highly trusting of others, readily delegates, and values diverse input. Actively pursues growth opportunities and business development. Adapts quickly to change and focuses on big-picture thinking. Addresses problems immediately and takes ownership of difficult situations."
    },
    "The Confident Cautious Precise": {
      dimensions: {
        "Esteem": "High",
        "Trust": "Low",
        "Business Drive": "Neutral",
        "Adaptability": "High Precision",
        "Problem Resolution": "Direct"
      },
      description: "Confident in abilities and comfortable asserting expertise. Skeptical of information and others' motives, preferring to verify independently. Balances active promotion with focus on quality work. Values structure, details, and methodical approaches. Addresses problems immediately and takes ownership of difficult situations."
    },
    "The Modest Trusting Reserved": {
      dimensions: {
        "Esteem": "Low",
        "Trust": "High",
        "Business Drive": "Low",
        "Adaptability": "Balanced",
        "Problem Resolution": "Avoidant"
      },
      description: "Tends to downplay achievements and may second-guess decisions. Highly trusting of others, readily delegates, and values diverse input. Prefers organic growth and letting work quality speak for itself. Shows flexibility while still maintaining attention to important details. May delay addressing problems or redirect attention from difficulties."
    },
    "The Complete Neutral": {
      dimensions: {
        "Esteem": "Neutral",
        "Trust": "Neutral",
        "Business Drive": "Neutral",
        "Adaptability": "Balanced",
        "Problem Resolution": "Balanced"
      },
      description: "Shows balanced self-confidence without excessive pride or insecurity. Maintains healthy skepticism while still being open to others' input. Balances active promotion with focus on quality work. Shows flexibility while still maintaining attention to important details. Balances direct problem-solving with relationship preservation."
    },
    "The Modest Cautious Precise": {
      dimensions: {
        "Esteem": "Low",
        "Trust": "Low",
        "Business Drive": "Neutral",
        "Adaptability": "High Precision",
        "Problem Resolution": "Direct"
      },
      description: "Tends to downplay achievements and may second-guess decisions. Skeptical of information and others' motives, preferring to verify independently. Balances active promotion with focus on quality work. Values structure, details, and methodical approaches. Addresses problems immediately and takes ownership of difficult situations."
    },
    "The Confident Trusting Reserved": {
      dimensions: {
        "Esteem": "High",
        "Trust": "High",
        "Business Drive": "Low",
        "Adaptability": "High Flexibility",
        "Problem Resolution": "Balanced"
      },
      description: "Confident in abilities and comfortable asserting expertise. Highly trusting of others, readily delegates, and values diverse input. Prefers organic growth and letting work quality speak for itself. Adapts quickly to change and focuses on big-picture thinking. Balances direct problem-solving with relationship preservation."
    },
    "The Confident Trusting Direct": {
      dimensions: {
        "Esteem": "High",
        "Trust": "High",
        "Business Drive": "High",
        "Adaptability": "Balanced",
        "Problem Resolution": "Direct"
      },
      description: "Highly confident in abilities while being trusting of others. Actively pursues growth opportunities with strong social connections. Balances structure and flexibility as needed. Addresses problems head-on while maintaining positive relationships."
    },
    "The Modest Precise Balanced": {
      dimensions: {
        "Esteem": "Low",
        "Trust": "Neutral",
        "Business Drive": "Neutral",
        "Adaptability": "High Precision",
        "Problem Resolution": "Balanced"
      },
      description: "Tends to downplay personal achievements while focusing on accurate, detail-oriented work. Maintains balanced trust and business approach. Values systems and procedures, but addresses problems with a measured approach that considers both urgency and relationships."
    },
    "The Cautious Flexible Avoider": {
      dimensions: {
        "Esteem": "Neutral",
        "Trust": "Low",
        "Business Drive": "Neutral",
        "Adaptability": "High Flexibility",
        "Problem Resolution": "Avoidant"
      },
      description: "Balanced self-view paired with skepticism of others. Adapts quickly to changing circumstances but prefers to work around problems rather than confront them directly. Verifies information independently while maintaining operational flexibility."
    },
    "The Modest Driven Direct": {
      dimensions: {
        "Esteem": "Low",
        "Trust": "Neutral",
        "Business Drive": "High",
        "Adaptability": "Balanced",
        "Problem Resolution": "Direct"
      },
      description: "Despite self-doubt, actively pursues business growth and confronts problems immediately. While uncertain about personal abilities, shows remarkable determination in professional contexts and doesn't shy away from difficult conversations."
    },
    "The Confident Reserved Precise": {
      dimensions: {
        "Esteem": "High",
        "Trust": "Neutral",
        "Business Drive": "Low",
        "Adaptability": "High Precision",
        "Problem Resolution": "Balanced"
      },
      description: "Self-assured but prefers organic growth to aggressive business development. Focuses on exceptional quality and systematic approaches. Confident in expertise but lets work quality speak for itself rather than actively promoting achievements."
    },
    "The Low Trust Balanced Profile": {
      dimensions: {
        "Esteem": "Neutral",
        "Trust": "Low",
        "Business Drive": "Neutral",
        "Adaptability": "Balanced",
        "Problem Resolution": "Balanced"
      },
      description: "Maintains healthy skepticism in all interactions while showing moderate balance across other dimensions. Verifies information through multiple sources but otherwise approaches work with flexibility and measured responses to problems."
    },
    "The Highly Flexible Reserved": {
      dimensions: {
        "Esteem": "Neutral",
        "Trust": "Neutral",
        "Business Drive": "Low",
        "Adaptability": "High Flexibility",
        "Problem Resolution": "Balanced"
      },
      description: "Adapts readily to change and embraces new approaches while preferring conservative business growth. Comfortable with ambiguity and changing directions quickly, but doesn't actively pursue expansion or promotion opportunities."
    },
    "The Triply High Direct": {
      dimensions: {
        "Esteem": "High",
        "Trust": "High",
        "Business Drive": "High",
        "Adaptability": "High Precision",
        "Problem Resolution": "Direct"
      },
      description: "The ultimate confident achiever with strong trust in others. Combines ambitious business drive with highly structured approach and direct problem-solving. Sets high standards while maintaining positive relationships and actively pursuing growth."
    },
    "The Triply Low Avoider": {
      dimensions: {
        "Esteem": "Low",
        "Trust": "Low",
        "Business Drive": "Low",
        "Adaptability": "High Flexibility",
        "Problem Resolution": "Avoidant"
      },
      description: "Downplays abilities while maintaining skepticism of others. Takes a cautious approach to business growth with high adaptability but avoids confronting problems directly. May struggle with confidence in decision-making and conflict situations."
    },
    "The Mixed Extreme": {
      dimensions: {
        "Esteem": "High",
        "Trust": "Low",
        "Business Drive": "High",
        "Adaptability": "High Flexibility",
        "Problem Resolution": "Avoidant"
      },
      description: "A complex profile with high self-confidence and business drive but low trust in others. Highly adaptable yet avoids direct confrontation. This combination might create internal tensions as the person pushes for growth while being reluctant to address emerging problems."
    },
    "Profile Not Found": {
      dimensions: {},
      description: "Your unique combination of dimension scores doesn't match any predefined profile patterns. This could indicate a distinctive working style that blends different approaches. Consider reviewing your individual dimension scores for more specific insights."
    }
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>Average Profile: {profileType || "Profile Not Found"}</span>
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

        <div className="mt-6">
          <div 
            className="flex items-center justify-between cursor-pointer bg-muted/30 p-3 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => setShowProfileDetails(!showProfileDetails)}
          >
            <h3 className="font-semibold text-lg">Profile Details</h3>
            {showProfileDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {showProfileDetails && (
            <div className="mt-4 p-4 border rounded-md bg-background">
              <h4 className="text-lg font-medium mb-4">
                {profileType || "Profile Not Found"}
              </h4>
              
              {profileType && profileDescriptions[profileType] ? (
                <>
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Dimension Profile:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(profileDescriptions[profileType].dimensions).map(([dim, value]) => (
                        <div key={dim} className="flex justify-between">
                          <span className="font-medium">{dim}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <h5 className="font-medium mb-2">Description:</h5>
                    <p className="text-muted-foreground">
                      {profileDescriptions[profileType].description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="mb-2">
                  <p className="text-muted-foreground">
                    {profileDescriptions["Profile Not Found"].description}
                  </p>
                </div>
              )}
            </div>
          )}
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
