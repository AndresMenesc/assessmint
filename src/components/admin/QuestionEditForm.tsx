
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Question, Section, SubSection } from "@/types/assessment";

interface QuestionEditFormProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QuestionEditForm = ({ question, onSave, onCancel }: QuestionEditFormProps) => {
  const [editedQuestion, setEditedQuestion] = useState<Question>({...question});
  
  const handleChange = (field: keyof Question, value: any) => {
    setEditedQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="id">Question ID</Label>
        <Input
          id="id"
          value={editedQuestion.id}
          onChange={(e) => handleChange('id', e.target.value)}
          placeholder="Enter a unique ID"
        />
        <p className="text-sm text-muted-foreground">
          E.g., E1A1, T2B3, etc. Must be unique.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="text">Question Text</Label>
        <Textarea
          id="text"
          value={editedQuestion.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Enter question text"
          className="min-h-24"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Select 
            value={editedQuestion.section} 
            onValueChange={(value) => handleChange('section', value)}
          >
            <SelectTrigger id="section">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Section).map((section) => (
                <SelectItem key={section} value={section}>
                  {section.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subSection">Subsection</Label>
          <Select 
            value={editedQuestion.subSection} 
            onValueChange={(value) => handleChange('subSection', value)}
          >
            <SelectTrigger id="subSection">
              <SelectValue placeholder="Select subsection" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SubSection).map((subSection) => (
                <SelectItem key={subSection} value={subSection}>
                  {subSection.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isReversed"
            checked={editedQuestion.isReversed}
            onCheckedChange={(checked) => handleChange('isReversed', checked)}
          />
          <Label htmlFor="isReversed">Reversed Scoring</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="negativeScore"
            checked={editedQuestion.negativeScore}
            onCheckedChange={(checked) => handleChange('negativeScore', checked)}
          />
          <Label htmlFor="negativeScore">Negative Score</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedQuestion)}>
          Save Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditForm;
