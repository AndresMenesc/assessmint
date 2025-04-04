
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAssessment } from "@/contexts/AssessmentContext";
import { RaterType } from "@/types/assessment";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  code: z.string().min(3, {
    message: "Assessment code must be at least 3 characters.",
  }).optional(),
});

export interface RaterFormProps {
  onSubmit?: () => void;
  isSelfRater?: boolean;
  assessmentCode?: string;
  subjectEmail?: string;
}

const RaterForm = ({ onSubmit, isSelfRater = false, assessmentCode, subjectEmail }: RaterFormProps) => {
  const { addRater, currentRater } = useAssessment();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      code: assessmentCode || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isSelfRater) {
        // Navigate to start page with name, email, and code as state
        navigate("/start", { 
          state: { 
            name: values.name, 
            email: values.email,
            code: values.code
          } 
        });
      } else if (assessmentCode) {
        // Navigate to assessment page as a rater
        navigate("/assessment", { 
          state: { 
            name: values.name, 
            email: values.email, 
            raterType: "rater",
            code: assessmentCode
          } 
        });
      } else {
        // Add a new rater to existing assessment
        addRater(
          values.email,
          values.name,
          currentRater === RaterType.SELF ? RaterType.RATER1 : RaterType.RATER2
        );
        
        // Call onSubmit if provided (don't check return value of addRater)
        if (onSubmit) {
          onSubmit();
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      // Error messages will be shown by toast in the respective functions
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {subjectEmail && (
          <div className="mb-4 text-sm text-muted-foreground">
            You are rating: <span className="font-medium">{subjectEmail}</span>
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isSelfRater && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assessment Code</FormLabel>
                <FormControl>
                  <Input placeholder="Create or enter existing code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full">
          {isSelfRater ? "Start Assessment" : assessmentCode ? "Start Rating" : "Add Rater"}
        </Button>
      </form>
    </Form>
  );
};

export default RaterForm;
