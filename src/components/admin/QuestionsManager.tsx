import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { questions } from "@/data/questions";
import { Question, Section, SubSection } from "@/types/assessment";
import QuestionEditForm from "./QuestionEditForm";

const QuestionsManager = () => {
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState<string>("ALL");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const filteredQuestions = localQuestions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === "ALL" || q.section === filterSection;
    return matchesSearch && matchesSection;
  });
  
  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditing(true);
  };
  
  const handleSaveQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = localQuestions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setLocalQuestions(updatedQuestions);
    setIsEditing(false);
    setSelectedQuestion(null);
  };
  
  const handleAddNewQuestion = () => {
    const newId = `NEW${Math.floor(Math.random() * 1000)}`;
    const newQuestion: Question = {
      id: newId,
      text: "New question text",
      section: Section.ESTEEM,
      subSection: SubSection.INSECURE,
      isReversed: false,
      negativeScore: false
    };
    
    setSelectedQuestion(newQuestion);
    setIsEditing(true);
  };
  
  const handleSaveNewQuestion = (newQuestion: Question) => {
    setLocalQuestions([...localQuestions, newQuestion]);
    setIsEditing(false);
    setSelectedQuestion(null);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = localQuestions.filter(q => q.id !== questionId);
      setLocalQuestions(updatedQuestions);
    }
  };
  
  const exportToJson = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(localQuestions, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "questions.json";
    link.click();
  };

  return (
    <>
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedQuestion?.id?.startsWith('NEW') ? 'Add New Question' : 'Edit Question'}</CardTitle>
            <CardDescription>Modify the question details</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionEditForm 
              question={selectedQuestion!} 
              onSave={selectedQuestion?.id?.startsWith('NEW') ? handleSaveNewQuestion : handleSaveQuestion} 
              onCancel={() => {
                setIsEditing(false);
                setSelectedQuestion(null);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Assessment Questions</CardTitle>
                <CardDescription>View and manage all questions in the assessment</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNewQuestion} className="whitespace-nowrap">
                  Add New Question
                </Button>
                <Button onClick={exportToJson} variant="outline" className="whitespace-nowrap">
                  Export Questions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select 
                    value={filterSection} 
                    onValueChange={setFilterSection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Sections</SelectItem>
                      {Object.values(Section).map((section) => (
                        <SelectItem key={section} value={section}>
                          {section.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead className="w-[400px]">Question Text</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Subsection</TableHead>
                      <TableHead>Reversed</TableHead>
                      <TableHead>Negative</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.id}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {question.text}
                        </TableCell>
                        <TableCell>{question.section}</TableCell>
                        <TableCell>{question.subSection.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <Checkbox checked={question.isReversed} disabled />
                        </TableCell>
                        <TableCell>
                          <Checkbox checked={question.negativeScore} disabled />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default QuestionsManager;
