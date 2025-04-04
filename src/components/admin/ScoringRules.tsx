
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { Section, SubSection } from "@/types/assessment";

const ScoringRules = () => {
  const [activeTab, setActiveTab] = useState("dimensions");
  
  // Mock data for dimension weights
  const [dimensionWeights, setDimensionWeights] = useState({
    [Section.ESTEEM]: 1.0,
    [Section.TRUST]: 1.0,
    [Section.DRIVER]: 1.0,
    [Section.ADAPTABILITY]: 1.0,
    [Section.PROBLEM_RESOLUTION]: 1.0,
    [Section.COACHABILITY]: 1.0
  });
  
  // Mock data for profile thresholds
  const [profileThresholds, setProfileThresholds] = useState({
    lowThreshold: 50,
    highThreshold: 75
  });
  
  const handleWeightChange = (dimension: Section, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 2) {
      setDimensionWeights({
        ...dimensionWeights,
        [dimension]: numValue
      });
    }
  };
  
  const handleThresholdChange = (threshold: 'lowThreshold' | 'highThreshold', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setProfileThresholds({
        ...profileThresholds,
        [threshold]: numValue
      });
    }
  };
  
  const handleSave = () => {
    // In a real implementation, this would save to a database or localStorage
    localStorage.setItem('dimensionWeights', JSON.stringify(dimensionWeights));
    localStorage.setItem('profileThresholds', JSON.stringify(profileThresholds));
    toast.success("Scoring rules saved successfully");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Rules Configuration</CardTitle>
        <CardDescription>
          Configure weights and thresholds for assessment scoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dimensions">Dimension Weights</TabsTrigger>
            <TabsTrigger value="profiles">Profile Thresholds</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dimensions">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set the weight for each dimension. Values must be between 0 and 2, 
                where 1 is the default weight.
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(dimensionWeights).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min={0} 
                          max={2} 
                          step={0.1}
                          value={value}
                          onChange={(e) => handleWeightChange(key as Section, e.target.value)}
                          className="w-24" 
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getDimensionDescription(key as Section)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="profiles">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set the thresholds for profile classification. Values must be between 0 and 100.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowThreshold">Low Threshold</Label>
                  <Input 
                    id="lowThreshold"
                    type="number" 
                    min={0} 
                    max={100}
                    value={profileThresholds.lowThreshold}
                    onChange={(e) => handleThresholdChange('lowThreshold', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Scores below this value will be classified as "Low"
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="highThreshold">High Threshold</Label>
                  <Input 
                    id="highThreshold"
                    type="number" 
                    min={0} 
                    max={100}
                    value={profileThresholds.highThreshold}
                    onChange={(e) => handleThresholdChange('highThreshold', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Scores above this value will be classified as "High"
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Profile Classification</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Low: 0-{profileThresholds.lowThreshold}</li>
                    <li>Medium: {profileThresholds.lowThreshold+1}-{profileThresholds.highThreshold-1}</li>
                    <li>High: {profileThresholds.highThreshold}-100</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get dimension descriptions
const getDimensionDescription = (dimension: Section): string => {
  const descriptions: Record<Section, string> = {
    [Section.ESTEEM]: "Self-confidence and personal worth assessment",
    [Section.TRUST]: "Tendency to trust or be cautious with others",
    [Section.DRIVER]: "Motivation and ambition in business contexts",
    [Section.ADAPTABILITY]: "Flexibility and adaptability to change",
    [Section.PROBLEM_RESOLUTION]: "Approach to solving problems and conflicts",
    [Section.COACHABILITY]: "Receptiveness to feedback and coaching"
  };
  
  return descriptions[dimension] || "No description available";
};

export default ScoringRules;
