
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import RaterForm from "@/components/RaterForm";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const RaterStartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const subjectEmail = state?.subjectEmail;

  if (!subjectEmail) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto py-6 px-4 flex justify-between items-center">
        <Link to="/login" className="inline-block">
          <Logo />
        </Link>
        <Button variant="outline" onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Rate Someone Else</CardTitle>
            <CardDescription>
              You are about to provide a rating assessment for {subjectEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              This assessment consists of 84 questions and should take approximately 
              15-20 minutes to complete. Your answers will provide valuable feedback for the 
              person you are rating.
            </p>
            
            <RaterForm subjectEmail={subjectEmail} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RaterStartPage;
