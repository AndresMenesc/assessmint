
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAssessment } from "@/contexts/AssessmentContext";
import { Check, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { assessment, resetAssessment } = useAssessment();
  const { logout, userRole, userEmail } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <Logo className="mb-6 md:mb-0" />
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Logged in as {userEmail}
            </span>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate("/about")}>
                About
              </Button>
              {(userRole === "admin" || userRole === "super_admin") && (
                <Button variant="default" onClick={() => navigate("/admin")}>
                  Admin Panel
                </Button>
              )}
              {(userRole === "admin" || userRole === "super_admin") && (
                <Button variant="default" onClick={() => navigate("/results")}>
                  View Results
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> 
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-orbit-blue">Owner Readiness &</span>
              <br />
              <span className="text-orbit-teal">Behavioral Insight Tool</span>
            </h1>
            
            <p className="text-lg text-slate-700 mb-8">
              Discover your leadership style and gain insights into your strengths and 
              growth opportunities across 5 key dimensions with feedback from your team.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="bg-white text-orbit-blue border-orbit-blue">
                84 Questions
              </Badge>
              <Badge variant="outline" className="bg-white text-orbit-blue border-orbit-blue">
                Multi-Rater Feedback
              </Badge>
              <Badge variant="outline" className="bg-white text-orbit-blue border-orbit-blue">
                Detailed Insights
              </Badge>
              <Badge variant="outline" className="bg-white text-orbit-blue border-orbit-blue">
                Leadership Profile
              </Badge>
            </div>
            
            {assessment ? (
              <div className="space-y-4">
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={() => navigate("/assessment")}
                >
                  Continue Assessment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto" 
                  onClick={resetAssessment}
                >
                  Start New Assessment
                </Button>
              </div>
            ) : (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto" 
                onClick={() => navigate("/start")}
              >
                Begin Your Assessment
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>5 Key Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Esteem</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Trust</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Business Drive</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Adaptability</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Problem Resolution</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Complete your self-assessment</li>
                  <li>Invite two others to provide feedback</li>
                  <li>Review comprehensive insights</li>
                  <li>Identify your leadership profile</li>
                  <li>Discover growth opportunities</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
