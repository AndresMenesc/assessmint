
import React, { useState, useEffect } from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import DimensionChart from '@/components/DimensionChart';
import CoachabilityChart from '@/components/CoachabilityChart';
import AwarenessMetrics from '@/components/AwarenessMetrics';
import DimensionAverageProfile from '@/components/DimensionAverageProfile';
import { calculateAllResults } from '@/utils/calculateAllResults';

const ResultsPage = () => {
  const { assessment, setAssessment } = useAssessment();
  const { code, assessmentId } = useParams<{ code?: string; assessmentId?: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<{
    dimensionScores: any[];
    selfAwareness: number;
    coachabilityAwareness: number;
    profileType: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (code && assessmentId && assessment) {
          // We already have the assessment in context, so use that
          const calculatedResults = calculateAllResults(assessment.raters);
          if (calculatedResults) {
            setResults(calculatedResults);
          }
        } else {
          console.log("No assessment found or missing parameters, navigating to home page");
          navigate('/');
        }
      } catch (error) {
        console.error("Error calculating results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code, assessmentId, assessment, navigate, setAssessment]);

  if (!results || !results.dimensionScores) {
    return (
      <div className="container mx-auto py-6 max-w-5xl">
        {isLoading ? (
          <p>Loading results...</p>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    );
  }

  const downloadPdf = () => {
    // Import types properly to avoid TypeScript errors
    import('jspdf').then((jsPDFModule) => {
      const jsPDF = jsPDFModule.default;
      import('html2canvas').then((html2canvasModule) => {
        const html2canvas = html2canvasModule.default;
        const content = document.querySelector('.container');
        if (content) {
          html2canvas(content as HTMLElement).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save("assessment-results.pdf");
          });
        }
      });
    });
  };

  // Filter out Coachability for dimension chart
  const dimensionScores = results.dimensionScores.filter(score => 
    score.dimension !== 'Coachability' && score.dimension !== undefined
  );

  // Get coachability scores
  const coachabilityScore = results.dimensionScores.find(score => 
    score.dimension === 'Coachability' || (score as any).name === 'Coachability'
  );

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Assessment Results</h1>
        
        <Tabs defaultValue="dimensions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="coachability">Coachability</TabsTrigger>
            <TabsTrigger value="awareness">Awareness</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dimensions" className="space-y-4">
            <DimensionChart scores={dimensionScores} />
            
            <DimensionAverageProfile 
              scores={dimensionScores} 
              profileType={results.profileType} 
            />
          </TabsContent>
          
          <TabsContent value="coachability">
            {coachabilityScore && (
              <CoachabilityChart scores={[coachabilityScore]} />
            )}
          </TabsContent>
          
          <TabsContent value="awareness">
            <AwarenessMetrics 
              selfAwareness={results.selfAwareness} 
              coachabilityAwareness={results.coachabilityAwareness} 
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button onClick={downloadPdf}>Download Results as PDF</Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ResultsPage;
