import React, { useEffect, useState } from "react";
import { Assessment, RaterType } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IndividualResponsesProps {
  assessment: Assessment;
}

interface ResponseData {
  question_id: string;
  text: string;
  section: string;
  sub_section: string;
  score: number;
  is_reversed?: boolean;
  negative_score?: boolean;
}

const IndividualResponses: React.FC<IndividualResponsesProps> = ({ assessment }) => {
  const [selfResponses, setSelfResponses] = useState<ResponseData[]>([]);
  const [rater1Responses, setRater1Responses] = useState<ResponseData[]>([]);
  const [rater2Responses, setRater2Responses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("self");
  
  useEffect(() => {
    const fetchIndividualResponses = async () => {
      if (!assessment || !assessment.id) {
        console.log("Invalid assessment provided to IndividualResponses");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        console.log("Individual responses - assessment:", assessment);
        
        // Fetch all raters directly from assessment_responses
        const { data: ratersData, error: ratersError } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', assessment.id);
        
        if (ratersError) {
          console.error("Error fetching raters from assessment_responses:", ratersError);
          return;
        }
        
        const selfRater = ratersData.find(r => r.rater_type === 'self');
        const rater1 = ratersData.find(r => r.rater_type === 'rater1');
        const rater2 = ratersData.find(r => r.rater_type === 'rater2');
        
        console.log("Individual responses - raters from assessment_responses:", { selfRater, rater1, rater2 });
        
        // Fetch all questions for reference
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*');
        
        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
          return;
        }
        
        // Helper function to format responses using assessment_responses data
        const formatResponses = (rater: any): ResponseData[] => {
          if (!rater || !rater.responses) return [];
          
          const responses = rater.responses;
          console.log(`Found ${responses.length} responses for rater ${rater.rater_type}`);
          
          // Join responses with questions data
          return responses.map((response: any) => {
            const question = questionsData.find(q => q.id === response.questionId);
            
            return {
              question_id: response.questionId,
              text: question?.text || 'Question text not found',
              section: question?.section || 'Unknown section',
              sub_section: question?.sub_section || 'Unknown subsection',
              score: response.score,
              is_reversed: question?.is_reversed || false,
              negative_score: question?.negative_score || false
            };
          });
        };
        
        // Format responses for each rater
        const selfFormattedResponses = formatResponses(selfRater);
        const rater1FormattedResponses = formatResponses(rater1);
        const rater2FormattedResponses = formatResponses(rater2);
        
        setSelfResponses(selfFormattedResponses);
        setRater1Responses(rater1FormattedResponses);
        setRater2Responses(rater2FormattedResponses);
      } catch (error) {
        console.error("Error fetching individual responses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIndividualResponses();
  }, [assessment]);
  
  // Helper function to get section name for display
  const getSectionDisplayName = (section: string): string => {
    const sectionMap: { [key: string]: string } = {
      'ESTEEM': 'Esteem',
      'TRUST': 'Trust',
      'DRIVER': 'Business Drive',
      'ADAPTABILITY': 'Adaptability',
      'PROBLEM_RESOLUTION': 'Problem Resolution',
      'COACHABILITY': 'Coachability'
    };
    
    return sectionMap[section] || section;
  };
  
  // Helper function to get sub-section name for display
  const getSubSectionDisplayName = (subSection: string): string => {
    const subSectionMap: { [key: string]: string } = {
      'INSECURE': 'Insecure',
      'PRIDE': 'Pride',
      'TRUSTING': 'Trusting',
      'CAUTIOUS': 'Cautious',
      'RESERVED': 'Reserved',
      'HUSTLE': 'Hustle',
      'PRECISE': 'Precise',
      'FLEXIBLE': 'Flexible',
      'DIRECT': 'Direct',
      'AVOIDANT': 'Avoidant',
      'COACHABILITY': 'Coachability'
    };
    
    return subSectionMap[subSection] || subSection;
  };
  
  // Helper function to render responses table for a specific rater
  const renderResponsesTable = (responses: ResponseData[]) => {
    // Group responses by section
    const groupedResponses: { [key: string]: ResponseData[] } = {};
    
    responses.forEach(response => {
      if (!groupedResponses[response.section]) {
        groupedResponses[response.section] = [];
      }
      groupedResponses[response.section].push(response);
    });
    
    return (
      <div className="space-y-8">
        {Object.keys(groupedResponses).map(section => (
          <div key={section} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 font-semibold">
              {getSectionDisplayName(section)}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-7/12">Question</TableHead>
                  <TableHead className="w-2/12">Sub-Section</TableHead>
                  <TableHead className="w-1/12 text-center">Score</TableHead>
                  <TableHead className="w-2/12">Attributes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedResponses[section].map(response => (
                  <TableRow key={response.question_id}>
                    <TableCell className="font-medium">{response.text}</TableCell>
                    <TableCell>{getSubSectionDisplayName(response.sub_section)}</TableCell>
                    <TableCell className="text-center font-mono">{response.score}</TableCell>
                    <TableCell>
                      {response.is_reversed && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">
                          Reversed
                        </span>
                      )}
                      {response.negative_score && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Negative
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading individual responses...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Individual Responses</h3>
      
      <Tabs defaultValue="self" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="self">Self Assessment ({selfResponses.length})</TabsTrigger>
          <TabsTrigger value="rater1">Rater 1 ({rater1Responses.length})</TabsTrigger>
          <TabsTrigger value="rater2">Rater 2 ({rater2Responses.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="self" className="mt-4">
          {selfResponses.length > 0 ? (
            renderResponsesTable(selfResponses)
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">No responses found for self assessment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rater1" className="mt-4">
          {rater1Responses.length > 0 ? (
            renderResponsesTable(rater1Responses)
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">No responses found for Rater 1.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rater2" className="mt-4">
          {rater2Responses.length > 0 ? (
            renderResponsesTable(rater2Responses)
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">No responses found for Rater 2.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndividualResponses;
