
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

const ProfileCard = ({ profileType, debugInfo }: ProfileCardProps) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const profiles: Record<string, { summary: string; traits: string[] }> = {
    "The Balanced Achiever": {
      summary: "Balanced, Proactive, Transparent",
      traits: [
        "Balances confidence with appropriate humility",
        "Actively pursues practice growth with collaborative approach", 
        "Adapts to changes while maintaining core standards",
        "Directly addresses issues as they arise without delay",
        "Takes ownership of mistakes and works toward solutions"
      ]
    },
    "The Supportive Driver": {
      summary: "Diligent, Collaborative, Forthright",
      traits: [
        "Pursues results without seeking personal recognition",
        "Builds strong team relationships based on trust",
        "Addresses problems directly but with team consideration", 
        "Drives business development with collaborative approach",
        "Handles difficult conversations with tact but directness"
      ]
    },
    "The Process Improver": {
      summary: "Methodical, Inclusive, Systematic",
      traits: [
        "Creates reliable systems with collaborative input",
        "Addresses systemic issues rather than symptoms",
        "Methodically analyzes problems before implementing solutions",
        "Builds consensus while maintaining progress momentum", 
        "Documents issues and solutions thoroughly for future reference"
      ]
    },
    "The Technical Authority": {
      summary: "Expert, Precise, Straightforward",
      traits: [
        "Confidently addresses technical and medical problems",
        "Maintains high standards with direct feedback",
        "Confronts issues promptly with evidence-based approaches",
        "Independently verifies information before acting",
        "Communicates difficult information clearly and directly"
      ]
    },
    "The Harmonizing Adaptor": {
      summary: "Flexible, Diplomatic, Accommodating",
      traits: [
        "Adapts readily to changing practice needs",
        "Addresses problems with diplomacy and tact", 
        "Balances direct resolution with relationship preservation",
        "Collaborates to find consensus-based solutions",
        "Adjusts approach based on situation and stakeholders"
      ]
    },
    "The Analytical Resolver": {
      summary: "Thorough, Cautious, Deliberate",
      traits: [
        "Methodically analyzes problems before addressing them",
        "Directly confronts issues but only after thorough research",
        "Maintains detailed documentation of issues and resolutions", 
        "Prefers evidence-based approaches to problem-solving",
        "Communicates findings and concerns with precision"
      ]
    },
    "The Growth Catalyst": {
      summary: "Ambitious, Action-Oriented, Straightforward",
      traits: [
        "Aggressively pursues growth opportunities",
        "Addresses problems immediately without hesitation", 
        "Initiates difficult conversations when necessary for progress",
        "Adapts quickly to changing circumstances",
        "Takes ownership of challenges and drives toward solutions"
      ]
    },
    "The Diplomatic Stabilizer": {
      summary: "Cautious, Harmonious, Gradual",
      traits: [
        "Builds strong relationships with team and clients",
        "Addresses issues gradually with focus on maintaining harmony", 
        "May temporarily minimize problems to preserve relationships",
        "Takes time to consider all perspectives before addressing issues",
        "Prefers private conversations to public confrontation"
      ]
    },
    "The Confident Avoider": {
      summary: "Confident, Optimistic, Deflecting",
      traits: [
        "Projects confidence while minimizing problems",
        "Reframes challenges as temporary inconveniences",
        "Focuses on positive aspects rather than addressing difficulties",
        "Redirects attention from sensitive or problematic issues", 
        "May delay addressing personnel or performance problems"
      ]
    },
    "The Direct Implementer": {
      summary: "Efficient, Practical, Confrontational",
      traits: [
        "Addresses problems immediately and directly",
        "Implements solutions systematically and thoroughly", 
        "Confronts difficult situations without hesitation",
        "Communicates directly with minimal concern for feelings",
        "Prioritizes resolution over relationship preservation"
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
            <h4 className="font-medium mb-1">Raw Dimension Scores:</h4>
            <ul className="space-y-1">
              <li>Esteem: {debugInfo.esteemScore}</li>
              <li>Trust: {debugInfo.trustScore}</li>
              <li>Business Drive: {debugInfo.driverScore}</li>
              <li>Adaptability: {debugInfo.adaptabilityScore}</li>
              <li>Problem Resolution: {debugInfo.problemResolutionScore}</li>
              {debugInfo.coachabilityScore && (
                <li>Coachability: {debugInfo.coachabilityScore}</li>
              )}
            </ul>
            <p className="mt-2 text-gray-500">
              Verify these scores against profile ranges in the documentation
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
