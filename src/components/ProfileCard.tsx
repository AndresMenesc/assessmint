
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface ProfileCardProps {
  profileType: string;
  debugInfo?: {
    esteemScore?: number;
    trustScore?: number;
    driverScore?: number;
    adaptabilityScore?: number;
    problemResolutionScore?: number;
    coachabilityScore?: number;
  };
}

// Helper function to categorize dimension scores
const categorizeDimensionScore = (
  dimension: string, 
  score: number
): string => {
  if (dimension === "Adaptability") {
    if (score <= -10) return "High Flexibility";
    if (score >= 10) return "High Precision";
    return "Balanced";
  } else if (dimension === "Problem Resolution") {
    if (score <= -10) return "Avoidant";
    if (score >= 10) return "Direct";
    return "Balanced";
  } else {
    // Default categorization for Esteem, Trust, and Business Drive
    if (score <= -10) return "Low";
    if (score >= 10) return "High";
    return "Neutral";
  }
};

const ProfileCard = ({ profileType, debugInfo }: ProfileCardProps) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const profiles: Record<string, { summary: string; traits: string[] }> = {
    "The Trusting Driven Flexible": {
      summary: "Balanced, Growth-Oriented, Adaptable",
      traits: [
        "Shows balanced self-confidence without excessive pride",
        "Highly trusting of others and values diverse input",
        "Actively pursues growth opportunities",
        "Adapts quickly to change with big-picture focus",
        "Addresses problems immediately and takes ownership"
      ]
    },
    "The Confident Cautious Precise": {
      summary: "Confident, Precise, Direct",
      traits: [
        "Confident in abilities and expertise",
        "Skeptical and independently verifies information",
        "Balances promotion with quality focus",
        "Values structure and methodical approaches",
        "Takes ownership of difficult situations"
      ]
    },
    "The Modest Trusting Reserved": {
      summary: "Modest, Trusting, Cautious",
      traits: [
        "Tends to downplay achievements",
        "Highly trusting and values diverse input",
        "Prefers organic growth approaches",
        "Balances flexibility with attention to detail",
        "May delay addressing difficult situations"
      ]
    },
    "The Complete Neutral": {
      summary: "Balanced, Measured, Adaptable",
      traits: [
        "Shows balanced self-confidence",
        "Maintains healthy skepticism while being open",
        "Balances promotion with quality focus",
        "Flexible while maintaining attention to detail",
        "Balances problem-solving with relationships"
      ]
    },
    "The Modest Cautious Precise": {
      summary: "Detail-Oriented, Cautious, Direct",
      traits: [
        "May second-guess decisions",
        "Skeptical and independently verifies",
        "Focuses on quality work",
        "Values structure and methodology",
        "Addresses problems immediately"
      ]
    },
    "The Confident Trusting Reserved": {
      summary: "Confident, Collaborative, Flexible",
      traits: [
        "Confident and comfortable with expertise",
        "Highly trusting and delegates readily",
        "Prefers organic growth approaches",
        "Adapts quickly to change",
        "Balances directness with relationships"
      ]
    },
    "The Confident Trusting Direct": {
      summary: "Confident, Social, Direct",
      traits: [
        "Highly confident in abilities",
        "Trusting and builds strong connections",
        "Actively pursues growth",
        "Balances structure with flexibility",
        "Addresses problems while maintaining relationships"
      ]
    },
    "The Modest Precise Balanced": {
      summary: "Detail-Oriented, Measured, Balanced",
      traits: [
        "Downplays personal achievements",
        "Maintains balanced trust approach",
        "Values systems and procedures",
        "Detail-oriented and precise",
        "Considers both urgency and relationships"
      ]
    },
    "The Cautious Flexible Avoider": {
      summary: "Adaptable, Skeptical, Indirect",
      traits: [
        "Balanced self-view with skepticism",
        "Adapts quickly to change",
        "Works around rather than through problems",
        "Maintains operational flexibility",
        "Independently verifies information"
      ]
    },
    "The Modest Driven Direct": {
      summary: "Determined, Direct, Growth-Oriented",
      traits: [
        "Shows determination despite self-doubt",
        "Pursues business growth actively",
        "Confronts problems immediately",
        "Balanced in adaptability",
        "Engages in difficult conversations"
      ]
    },
    "The Confident Reserved Precise": {
      summary: "Self-Assured, Systematic, Quality-Focused",
      traits: [
        "Self-assured in abilities",
        "Prefers organic growth",
        "Focuses on exceptional quality",
        "Values systematic approaches",
        "Lets work quality speak for itself"
      ]
    },
    "The Low Trust Balanced Profile": {
      summary: "Skeptical, Measured, Balanced",
      traits: [
        "Maintains healthy skepticism",
        "Verifies information thoroughly",
        "Balanced in most approaches",
        "Flexible when needed",
        "Measured response to problems"
      ]
    },
    "The Highly Flexible Reserved": {
      summary: "Adaptable, Conservative, Balanced",
      traits: [
        "Adapts readily to change",
        "Comfortable with ambiguity",
        "Conservative in growth approach",
        "Embraces new directions",
        "Balanced in problem resolution"
      ]
    },
    "The Triply High Direct": {
      summary: "Confident, Ambitious, Structured",
      traits: [
        "Ultimate confident achiever",
        "Strong trust in others",
        "Ambitious business drive",
        "Highly structured approach",
        "Direct problem-solver"
      ]
    },
    "The Triply Low Avoider": {
      summary: "Cautious, Adaptive, Indirect",
      traits: [
        "Downplays abilities",
        "Skeptical of others",
        "Cautious in growth",
        "Highly adaptable",
        "Avoids direct confrontation"
      ]
    },
    "The Mixed Extreme": {
      summary: "Complex, Dynamic, Growth-Focused",
      traits: [
        "High self-confidence",
        "Low trust in others",
        "Strong business drive",
        "Highly adaptable",
        "Avoids confrontation"
      ]
    },
    "No Profile Defined": {
      summary: "Profile analysis inconclusive",
      traits: [
        "Unique combination of characteristics",
        "May represent an emerging pattern",
        "Consider reviewing individual dimension scores",
        "May benefit from additional assessment",
        "Consult with assessment administrator"
      ]
    }
  };

  const fallbackProfile = {
    summary: "Profile information not available",
    traits: ["Detailed information not available for this profile"]
  };

  const profile = profiles[profileType] || fallbackProfile;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Your Profile: {profileType}</span>
          {debugInfo && (
            <button 
              onClick={() => setShowDebug(!showDebug)} 
              className="text-xs text-gray-500 underline"
            >
              {showDebug ? "Hide Scores" : "Show Scores"}
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="inline-block bg-orbit-blue text-white px-4 py-1 rounded-full text-sm font-medium">
            {profile.summary}
          </span>
        </div>
        
        {debugInfo && showDebug && (
          <div className="mb-4 p-3 border rounded-md text-xs">
            <h4 className="font-medium mb-1">Average Dimension Scores:</h4>
            <ul className="space-y-1">
              {debugInfo.esteemScore !== undefined && (
                <li>Esteem: {debugInfo.esteemScore.toFixed(1)} ({categorizeDimensionScore("Esteem", debugInfo.esteemScore)})</li>
              )}
              {debugInfo.trustScore !== undefined && (
                <li>Trust: {debugInfo.trustScore.toFixed(1)} ({categorizeDimensionScore("Trust", debugInfo.trustScore)})</li>
              )}
              {debugInfo.driverScore !== undefined && (
                <li>Business Drive: {debugInfo.driverScore.toFixed(1)} ({categorizeDimensionScore("Business Drive", debugInfo.driverScore)})</li>
              )}
              {debugInfo.adaptabilityScore !== undefined && (
                <li>Adaptability: {debugInfo.adaptabilityScore.toFixed(1)} ({categorizeDimensionScore("Adaptability", debugInfo.adaptabilityScore)})</li>
              )}
              {debugInfo.problemResolutionScore !== undefined && (
                <li>Problem Resolution: {debugInfo.problemResolutionScore.toFixed(1)} ({categorizeDimensionScore("Problem Resolution", debugInfo.problemResolutionScore)})</li>
              )}
              {debugInfo.coachabilityScore && (
                <li>Coachability: {debugInfo.coachabilityScore.toFixed(1)}</li>
              )}
            </ul>
            <p className="mt-2 text-gray-500">
              Scores represent the average across all raters
            </p>
          </div>
        )}
        
        <h3 className="font-semibold mb-2">Typical Behaviors:</h3>
        <ul className="list-disc list-inside space-y-1 pl-2">
          {profile.traits.map((trait, index) => (
            <li key={index} className="text-muted-foreground">{trait}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
