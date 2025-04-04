
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo />
          <h1 className="text-3xl font-bold mt-6 mb-2">Leadership Assessment</h1>
          <p className="text-gray-600">
            Identify strengths and growth opportunities in your leadership style
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Complete the assessment or rate a colleague
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Choose an option below to begin the assessment process. No login required - just use your assessment code.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/login", { state: { mode: "self" } })}
            >
              Take Self Assessment
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/rate")}
            >
              Rate a Colleague
            </Button>
            <Button
              className="w-full mt-4"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
