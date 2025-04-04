
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionsManager from "@/components/admin/QuestionsManager";
import { Button } from "@/components/ui/button";
import { LogOut, Users, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ScoringRules from "@/components/admin/ScoringRules";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminPage = () => {
  const { logout, userEmail, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {userRole === "super_admin" ? "Super Admin" : "Admin"}: {userEmail}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> 
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assessment Admin Panel</h1>
          <p className="text-gray-600">Manage questions, scoring rules, and view results</p>
        </div>

        <Tabs defaultValue="questions" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="scoring">Scoring Rules</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 flex flex-col">
            <TabsContent value="questions" className="flex-1 flex flex-col h-full">
              <div className="flex-1 relative h-full min-h-[400px]">
                <ScrollArea className="absolute inset-0">
                  <div className="pr-4 space-y-4">
                    <QuestionsManager />
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="scoring" className="flex-1 flex flex-col h-full">
              <div className="flex-1 relative h-full min-h-[400px]">
                <ScrollArea className="absolute inset-0">
                  <div className="pr-4">
                    <ScoringRules />
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="flex-1 flex flex-col h-full">
              <div className="flex-1 relative h-full min-h-[400px]">
                <ScrollArea className="absolute inset-0">
                  <div className="pr-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>View and export assessment results</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                          <Users className="h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-xl font-semibold mb-2">View Assessment Results</h3>
                          <p className="text-muted-foreground text-center max-w-md mb-6">
                            Access the detailed assessment results for all completed assessments.
                            {userRole === "super_admin" && (
                              <span className="block mt-2 text-sm font-medium text-primary">
                                As a Super Admin, you can view individual question responses for all assessments.
                              </span>
                            )}
                          </p>
                          <Button onClick={() => navigate("/results")}>
                            <FileText className="h-4 w-4 mr-2" />
                            Go to Results Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
