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
    rater1?: {
      esteemScore?: number;
      trustScore?: number;
      driverScore?: number;
      adaptabilityScore?: number;
      problemResolutionScore?: number;
    };
    rater2?: {
      esteemScore?: number;
      trustScore?: number;
      driverScore?: number;
      adaptabilityScore?: number;
      problemResolutionScore?: number;
    };
  };
}

const ProfileCard = ({ profileType, debugInfo }: ProfileCardProps) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const calculateAverage = (...scores: (number | undefined)[]) => {
    const validScores = scores.filter(score => typeof score === 'number') as number[];
    return validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
      : 0;
  };
  
  const categorizeScore = (score: number, dimension: string): string => {
    if (dimension === 'Adaptability') {
      if (score >= 10) return 'High Precision';
      if (score <= -10) return 'High Flexibility';
      return 'Balanced';
    } 
    else if (dimension === 'Problem Resolution') {
      if (score >= 10) return 'Direct';
      if (score <= -10) return 'Avoidant';
      return 'Balanced';
    }
    else {
      if (score >= 10) return 'High';
      if (score <= -10) return 'Low';
      return 'Neutral';
    }
  };
  
  const averageScores = debugInfo ? {
    esteem: calculateAverage(
      debugInfo.esteemScore, 
      debugInfo.rater1?.esteemScore, 
      debugInfo.rater2?.esteemScore
    ),
    trust: calculateAverage(
      debugInfo.trustScore, 
      debugInfo.rater1?.trustScore, 
      debugInfo.rater2?.trustScore
    ),
    driver: calculateAverage(
      debugInfo.driverScore, 
      debugInfo.rater1?.driverScore, 
      debugInfo.rater2?.driverScore
    ),
    adaptability: calculateAverage(
      debugInfo.adaptabilityScore, 
      debugInfo.rater1?.adaptabilityScore, 
      debugInfo.rater2?.adaptabilityScore
    ),
    problemResolution: calculateAverage(
      debugInfo.problemResolutionScore, 
      debugInfo.rater1?.problemResolutionScore, 
      debugInfo.rater2?.problemResolutionScore
    )
  } : null;
  
  const profileBasedOnAverages = averageScores ? determineProfileType(
    averageScores.esteem,
    averageScores.trust,
    averageScores.driver,
    averageScores.adaptability,
    averageScores.problemResolution
  ) : profileType;
  
  function determineProfileType(
    esteemScore: number,
    trustScore: number,
    driverScore: number,
    adaptabilityScore: number,
    problemResolutionScore: number
  ): string {
    const categorizeScore = (score: number): 'Low' | 'Neutral' | 'High' => {
      if (score <= -10) return 'Low';
      if (score >= 10) return 'High';
      return 'Neutral';
    };

    const categorizeAdaptability = (score: number): 'High Flexibility' | 'Balanced' | 'High Precision' => {
      if (score <= -10) return 'High Flexibility';
      if (score >= 10) return 'High Precision';
      return 'Balanced';
    };

    const categorizeProblemResolution = (score: number): 'Avoidant' | 'Balanced' | 'Direct' => {
      if (score <= -10) return 'Avoidant';
      if (score >= 10) return 'Direct';
      return 'Balanced';
    };

    const esteem = categorizeScore(esteemScore);
    const trust = categorizeScore(trustScore);
    const drive = categorizeScore(driverScore);
    const adaptability = categorizeAdaptability(adaptabilityScore);
    const problemResolution = categorizeProblemResolution(problemResolutionScore);

    if (esteem === 'Neutral' && trust === 'High' && drive === 'High' && 
        adaptability === 'High Flexibility' && problemResolution === 'Direct') {
      return 'The Trusting Driven Flexible';
    }

    if (esteem === 'High' && trust === 'Low' && drive === 'Neutral' && 
        adaptability === 'High Precision' && problemResolution === 'Direct') {
      return 'The Confident Cautious Precise';
    }

    if (esteem === 'Low' && trust === 'High' && drive === 'Low' && 
        adaptability === 'Balanced' && problemResolution === 'Avoidant') {
      return 'The Modest Trusting Reserved';
    }

    if (esteem === 'Neutral' && trust === 'Neutral' && drive === 'Neutral' && 
        adaptability === 'Balanced' && problemResolution === 'Balanced') {
      return 'The Complete Neutral';
    }

    if (esteem === 'Low' && trust === 'Low' && drive === 'Neutral' && 
        adaptability === 'High Precision' && problemResolution === 'Direct') {
      return 'The Modest Cautious Precise';
    }

    if (esteem === 'High' && trust === 'High' && drive === 'Low' && 
        adaptability === 'High Flexibility' && problemResolution === 'Balanced') {
      return 'The Confident Trusting Reserved';
    }

    if (esteem === 'High' && trust === 'High' && drive === 'High' && 
        adaptability === 'Balanced' && problemResolution === 'Direct') {
      return 'The Confident Trusting Direct';
    }

    if (esteem === 'Low' && trust === 'Neutral' && drive === 'Neutral' && 
        adaptability === 'High Precision' && problemResolution === 'Balanced') {
      return 'The Modest Precise Balanced';
    }

    if (esteem === 'Neutral' && trust === 'Low' && drive === 'Neutral' && 
        adaptability === 'High Flexibility' && problemResolution === 'Avoidant') {
      return 'The Cautious Flexible Avoider';
    }

    if (esteem === 'Low' && trust === 'Neutral' && drive === 'High' && 
        adaptability === 'Balanced' && problemResolution === 'Direct') {
      return 'The Modest Driven Direct';
    }

    if (esteem === 'High' && trust === 'Neutral' && drive === 'Low' && 
        adaptability === 'High Precision' && problemResolution === 'Balanced') {
      return 'The Confident Reserved Precise';
    }

    if (esteem === 'Neutral' && trust === 'Low' && drive === 'Neutral' && 
        adaptability === 'Balanced' && problemResolution === 'Balanced') {
      return 'The Low Trust Balanced Profile';
    }

    if (esteem === 'Neutral' && trust === 'Neutral' && drive === 'Low' && 
        adaptability === 'High Flexibility' && problemResolution === 'Balanced') {
      return 'The Highly Flexible Reserved';
    }

    if (esteem === 'High' && trust === 'High' && drive === 'High' && 
        adaptability === 'High Precision' && problemResolution === 'Direct') {
      return 'The Triply High Direct';
    }

    if (esteem === 'Low' && trust === 'Low' && drive === 'Low' && 
        adaptability === 'High Flexibility' && problemResolution === 'Avoidant') {
      return 'The Triply Low Avoider';
    }

    if (esteem === 'High' && trust === 'Low' && drive === 'High' && 
        adaptability === 'High Flexibility' && problemResolution === 'Avoidant') {
      return 'The Mixed Extreme';
    }

    return 'Profile Not Found';
  }
  
  const profiles: Record<string, { summary: string; traits: string[] }> = {
    "The Trusting Driven Flexible": {
      summary: "Balanced, Growth-Oriented, Adaptable",
      traits: [
        "Shows balanced self-confidence without excessive pride or insecurity",
        "Highly trusting of others, readily delegates, and values diverse input",
        "Actively pursues growth opportunities and business development",
        "Adapts quickly to change and focuses on big-picture thinking",
        "Addresses problems immediately and takes ownership of difficult situations"
      ]
    },
    "The Confident Cautious Precise": {
      summary: "Confident, Precise, Direct",
      traits: [
        "Confident in abilities and comfortable asserting expertise",
        "Skeptical of information and others' motives, preferring to verify independently",
        "Balances active promotion with focus on quality work",
        "Values structure, details, and methodical approaches",
        "Addresses problems immediately and takes ownership of difficult situations"
      ]
    },
    "The Modest Trusting Reserved": {
      summary: "Modest, Trusting, Cautious",
      traits: [
        "Tends to downplay achievements and may second-guess decisions",
        "Highly trusting of others, readily delegates, and values diverse input",
        "Prefers organic growth and letting work quality speak for itself",
        "Shows flexibility while still maintaining attention to important details",
        "May delay addressing problems or redirect attention from difficulties"
      ]
    },
    "The Complete Neutral": {
      summary: "Balanced, Measured, Adaptable",
      traits: [
        "Shows balanced self-confidence without excessive pride or insecurity",
        "Maintains healthy skepticism while still being open to others' input",
        "Balances active promotion with focus on quality work",
        "Shows flexibility while still maintaining attention to important details",
        "Balances direct problem-solving with relationship preservation"
      ]
    },
    "The Modest Cautious Precise": {
      summary: "Detail-Oriented, Cautious, Direct",
      traits: [
        "Tends to downplay achievements and may second-guess decisions",
        "Skeptical of information and others' motives, preferring to verify independently",
        "Balances active promotion with focus on quality work",
        "Values structure, details, and methodical approaches",
        "Addresses problems immediately and takes ownership of difficult situations"
      ]
    },
    "The Confident Trusting Reserved": {
      summary: "Confident, Collaborative, Flexible",
      traits: [
        "Confident in abilities and comfortable asserting expertise",
        "Highly trusting of others, readily delegates, and values diverse input",
        "Prefers organic growth and letting work quality speak for itself",
        "Adapts quickly to change and focuses on big-picture thinking",
        "Balances direct problem-solving with relationship preservation"
      ]
    },
    "The Confident Trusting Direct": {
      summary: "Confident, Social, Direct",
      traits: [
        "Highly confident in abilities while being trusting of others",
        "Actively pursues growth opportunities with strong social connections",
        "Balances structure and flexibility as needed",
        "Addresses problems head-on while maintaining positive relationships"
      ]
    },
    "The Modest Precise Balanced": {
      summary: "Detail-Oriented, Measured, Balanced",
      traits: [
        "Tends to downplay personal achievements while focusing on accurate, detail-oriented work",
        "Maintains balanced trust and business approach",
        "Values systems and procedures",
        "Detail-oriented and precise",
        "Addresses problems with a measured approach that considers both urgency and relationships"
      ]
    },
    "The Cautious Flexible Avoider": {
      summary: "Adaptable, Skeptical, Indirect",
      traits: [
        "Balanced self-view paired with skepticism of others",
        "Adapts quickly to changing circumstances",
        "Prefers to work around problems rather than confront them directly",
        "Maintains operational flexibility",
        "Verifies information independently"
      ]
    },
    "The Modest Driven Direct": {
      summary: "Determined, Direct, Growth-Oriented",
      traits: [
        "Despite self-doubt, actively pursues business growth",
        "Confronts problems immediately",
        "Shows remarkable determination in professional contexts",
        "Balanced in adaptability",
        "Doesn't shy away from difficult conversations"
      ]
    },
    "The Confident Reserved Precise": {
      summary: "Self-Assured, Systematic, Quality-Focused",
      traits: [
        "Self-assured in abilities",
        "Prefers organic growth to aggressive business development",
        "Focuses on exceptional quality",
        "Values systematic approaches",
        "Lets work quality speak for itself rather than actively promoting achievements"
      ]
    },
    "The Low Trust Balanced Profile": {
      summary: "Skeptical, Measured, Balanced",
      traits: [
        "Maintains healthy skepticism in all interactions",
        "Verifies information through multiple sources",
        "Shows moderate balance across other dimensions",
        "Approaches work with flexibility",
        "Uses measured responses to problems"
      ]
    },
    "The Highly Flexible Reserved": {
      summary: "Adaptable, Conservative, Balanced",
      traits: [
        "Adapts readily to change and embraces new approaches",
        "Prefers conservative business growth",
        "Comfortable with ambiguity",
        "Changes directions quickly",
        "Doesn't actively pursue expansion or promotion opportunities"
      ]
    },
    "The Triply High Direct": {
      summary: "Confident, Ambitious, Structured",
      traits: [
        "The ultimate confident achiever with strong trust in others",
        "Combines ambitious business drive with highly structured approach",
        "Direct problem-solving",
        "Sets high standards while maintaining positive relationships",
        "Actively pursues growth"
      ]
    },
    "The Triply Low Avoider": {
      summary: "Cautious, Adaptive, Indirect",
      traits: [
        "Downplays abilities while maintaining skepticism of others",
        "Takes a cautious approach to business growth",
        "High adaptability but avoids confronting problems directly",
        "May struggle with confidence in decision-making",
        "Difficulty with conflict situations"
      ]
    },
    "The Mixed Extreme": {
      summary: "Complex, Dynamic, Growth-Focused",
      traits: [
        "High self-confidence and business drive but low trust in others",
        "Highly adaptable yet avoids direct confrontation",
        "This combination might create internal tensions",
        "Pushes for growth while being reluctant to address emerging problems",
        "Complex profile with potentially conflicting tendencies"
      ]
    },
    "Profile Not Found": {
      summary: "Profile information not available",
      traits: ["Detailed information not available for this profile"]
    }
  };

  const fallbackProfile = {
    summary: "Profile information not available",
    traits: ["Detailed information not available for this profile"]
  };

  const profile = profiles[profileBasedOnAverages] || {
    summary: "",
    traits: []
  };

  const formatScore = (score: number | undefined): string => {
    if (score === undefined || score === null) return 'N/A';
    return score.toFixed(1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Your Profile: {profileBasedOnAverages}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="inline-block bg-orbit-blue text-white px-4 py-1 rounded-full text-sm font-medium">
            {profile.summary}
          </span>
        </div>
        
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
