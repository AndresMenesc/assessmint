
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Assessment, RaterType, Question, Section, SubSection } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface IndividualResponsesProps {
  assessment: Assessment;
}

const IndividualResponses = ({ assessment }: IndividualResponsesProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('id');
          
        if (error) {
          console.error("Error fetching questions:", error);
          throw error;
        }
        
        // Properly cast section and subSection to their enum types
        setQuestions(data.map(q => ({
          id: q.id,
          text: q.text,
          section: q.section as Section,
          subSection: q.sub_section as SubSection,
          isReversed: q.is_reversed,
          negativeScore: q.negative_score
        })));
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Find responses for each rater
  const selfRater = assessment?.raters.find(r => r.raterType === RaterType.SELF);
  const rater1 = assessment?.raters.find(r => r.raterType === RaterType.RATER1);
  const rater2 = assessment?.raters.find(r => r.raterType === RaterType.RATER2);

  console.log("Individual responses - assessment:", assessment);
  console.log("Individual responses - raters:", { selfRater, rater1, rater2 });

  // Filter questions based on search term
  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.subSection.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get response for a specific question and rater
  const getResponse = (questionId: string, raterType: RaterType) => {
    const rater = assessment?.raters.find(r => r.raterType === raterType);
    if (!rater) return "-";
    
    const response = rater.responses.find(r => r.questionId === questionId);
    if (!response) {
      console.log(`No response found for question ${questionId} from rater ${raterType}`);
      return "-";
    }
    
    return response.score.toString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }
  
  if (!assessment) {
    return <div className="text-center py-8">No assessment data available</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Question Responses</CardTitle>
        <CardDescription>
          View individual responses to each question across all raters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions by ID, text, or section"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <ScrollArea className="h-[500px]">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[400px]">Question</TableHead>
                    <TableHead className="w-[100px]">Section</TableHead>
                    <TableHead className="w-[80px] text-center">Self</TableHead>
                    <TableHead className="w-[80px] text-center">Rater 1</TableHead>
                    <TableHead className="w-[80px] text-center">Rater 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-mono text-xs">{question.id}</TableCell>
                      <TableCell>{question.text}</TableCell>
                      <TableCell>
                        <span className="text-xs whitespace-nowrap">
                          {question.section}
                          <br />
                          <span className="text-muted-foreground">
                            {question.subSection.replace(/_/g, ' ')}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {selfRater ? getResponse(question.id, RaterType.SELF) : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {rater1 ? getResponse(question.id, RaterType.RATER1) : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        {rater2 ? getResponse(question.id, RaterType.RATER2) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualResponses;
