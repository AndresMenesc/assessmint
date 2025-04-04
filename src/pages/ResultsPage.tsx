
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import AwarenessMetrics from "@/components/AwarenessMetrics";
import DimensionChart from "@/components/DimensionChart";
import CoachabilityChart from "@/components/CoachabilityChart";
import Logo from "@/components/Logo";
import ProfileCard from "@/components/ProfileCard";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAuth } from "@/contexts/AuthContext";
import { RaterType, Assessment, AssessmentResponse, DimensionScore } from "@/types/assessment";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, LogOut, Mail, Search, User, CalendarDays, FileBarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateAllResults } from "@/utils/calculateAllResults";
import IndividualResponses from "@/components/admin/IndividualResponses";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ResultsPage = () => {
  const { assessment, getResults } = useAssessment();
  const { logout, userEmail, userRole } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState<"aggregate" | "individual" | "responses">("aggregate");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  
  useEffect(() => {
    const fetchAssessments = async () => {
      if (userRole === "admin" || userRole === "super_admin") {
        setLoading(true);
        try {
          console.log("Fetching assessments for admin");
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            throw error;
          }
          
          if (data) {
            console.log("Fetched assessments data:", data);
            const assessmentsWithRaters = await Promise.all(
              data.map(async (a) => {
                const { data: ratersData, error: ratersError } = await supabase
                  .from('raters')
                  .select('*')
                  .eq('assessment_id', a.id);
                  
                if (ratersError) {
                  console.error("Error fetching raters:", ratersError);
                  return null;
                }
                
                console.log(`Fetched ${ratersData.length} raters for assessment ${a.id}`);
                
                const ratersWithResponses = await Promise.all(
                  ratersData.map(async (rater) => {
                    const { data: responsesData, error: responsesError } = await supabase
                      .from('responses')
                      .select('*')
                      .eq('rater_id', rater.id);
                      
                    if (responsesError) {
                      console.error("Error fetching responses:", responsesError);
                      return {
                        raterType: rater.rater_type as RaterType,
                        email: rater.email,
                        name: rater.name,
                        completed: rater.completed,
                        responses: []
                      };
                    }
                    
                    console.log(`Fetched ${responsesData.length} responses for rater ${rater.id}`);
                    
                    const typedResponses: AssessmentResponse[] = responsesData.map(r => ({
                      questionId: r.question_id,
                      score: r.score
                    }));
                    
                    return {
                      raterType: rater.rater_type as RaterType,
                      email: rater.email,
                      name: rater.name,
                      completed: rater.completed,
                      responses: typedResponses
                    };
                  })
                );
                
                const typedAssessment: Assessment = {
                  id: a.id,
                  selfRaterEmail: a.self_rater_email,
                  selfRaterName: a.self_rater_name,
                  code: a.code,
                  completed: a.completed,
                  createdAt: new Date(a.created_at),
                  updatedAt: new Date(a.updated_at),
                  raters: ratersWithResponses.filter(r => r !== null) as any
                };
                
                return typedAssessment;
              })
            );
            
            const validAssessments = assessmentsWithRaters.filter(a => a !== null) as Assessment[];
            console.log("Processed assessments with raters:", validAssessments);
            setAssessments(validAssessments);
            
            if (validAssessments.length > 0 && !selectedAssessment) {
              setSelectedAssessment(validAssessments[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching assessments:", error);
          toast.error("Failed to load assessments");
        } finally {
          setLoading(false);
        }
      } else if (!assessment) {
        navigate("/start");
      } else {
        setSelectedAssessment(assessment);
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, [assessment, userRole, navigate]);

  // Calculate and set results whenever selectedAssessment changes
  useEffect(() => {
    const calculateAndSetResults = async () => {
      if (!selectedAssessment) return;
      
      console.log("Calculating results for selected assessment:", selectedAssessment);
      try {
        const calculatedResults = await getResults(selectedAssessment);
        console.log("Calculated results:", calculatedResults);
        setResults(calculatedResults);
      } catch (error) {
        console.error("Error calculating results:", error);
        setResults(null);
      }
    };
    
    calculateAndSetResults();
  }, [selectedAssessment, getResults]);

  const filteredAssessments = assessments.filter(a => 
    a.selfRaterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.selfRaterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSingleRaterResults = async (assessment: Assessment, raterType: RaterType) => {
    if (!assessment) return null;
    
    const rater = assessment.raters.find(r => r.raterType === raterType);
    if (!rater) {
      // Try to fetch rater from database
      const { data: raterData, error: raterError } = await supabase
        .from('raters')
        .select('*')
        .eq('assessment_id', assessment.id)
        .eq('rater_type', raterType)
        .maybeSingle();
        
      if (raterError || !raterData) {
        console.error("Error fetching rater:", raterError);
        return null;
      }
      
      // Fetch responses for this rater
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('rater_id', raterData.id);
        
      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
        return null;
      }
      
      const typedResponses: AssessmentResponse[] = responsesData.map(r => ({
        questionId: r.question_id,
        score: r.score
      }));
      
      const fetchedRater = {
        raterType: raterData.rater_type as RaterType,
        email: raterData.email,
        name: raterData.name,
        completed: raterData.completed,
        responses: typedResponses
      };
      
      if (userRole !== "super_admin" && !fetchedRater.completed) return null;
      
      const calculatedResults = calculateAllResults([fetchedRater]);
      return calculatedResults?.dimensionScores || null;
    }
    
    if (userRole !== "super_admin" && !rater.completed) return null;
    
    const calculatedResults = calculateAllResults([rater]);
    return calculatedResults?.dimensionScores || null;
  };

  const getCompletionStatus = (assessment: Assessment) => {
    // Check if we have all raters in the assessment object
    const selfRater = assessment.raters.find(r => r.raterType === RaterType.SELF);
    const rater1 = assessment.raters.find(r => r.raterType === RaterType.RATER1);
    const rater2 = assessment.raters.find(r => r.raterType === RaterType.RATER2);
    
    // If we don't have all raters in the object, we need to check the database
    if (!selfRater || !rater1 || !rater2) {
      // For now, return what we know
      return { 
        selfComplete: selfRater?.completed || false, 
        rater1Complete: rater1?.completed || false, 
        rater2Complete: rater2?.completed || false, 
        allComplete: false
      };
    }
    
    const allComplete = selfRater.completed && rater1.completed && rater2.completed;
    
    return { 
      selfComplete: selfRater.completed, 
      rater1Complete: rater1.completed, 
      rater2Complete: rater2.completed, 
      allComplete
    };
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderRaterDetails = (assessment: Assessment, raterType: RaterType) => {
    const rater = assessment.raters.find(r => r.raterType === raterType);
    if (!rater) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-3 w-3 rounded-full ${rater.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span className="font-medium">{raterType === RaterType.SELF ? 'Self' : `Rater ${raterType === RaterType.RATER1 ? '1' : '2'}`}:</span>
        <span>{rater.name}</span>
        <span className="text-muted-foreground">({rater.email})</span>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          rater.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {rater.completed ? 'Completed' : 'Pending'}
        </span>
      </div>
    );
  };

  const renderIndividualResults = () => {
    if (!selectedAssessment) return null;
    
    const [selfResults, setSelfResults] = useState<DimensionScore[] | null>(null);
    const [rater1Results, setRater1Results] = useState<DimensionScore[] | null>(null);
    const [rater2Results, setRater2Results] = useState<DimensionScore[] | null>(null);
    
    useEffect(() => {
      const loadIndividualResults = async () => {
        const selfScores = await getSingleRaterResults(selectedAssessment, RaterType.SELF);
        const rater1Scores = await getSingleRaterResults(selectedAssessment, RaterType.RATER1);
        const rater2Scores = await getSingleRaterResults(selectedAssessment, RaterType.RATER2);
        
        setSelfResults(selfScores);
        setRater1Results(rater1Scores);
        setRater2Results(rater2Scores);
      };
      
      loadIndividualResults();
    }, [selectedAssessment]);
    
    const raters = selectedAssessment.raters;
    const selfRater = raters.find(r => r.raterType === RaterType.SELF);
    const rater1 = raters.find(r => r.raterType === RaterType.RATER1);
    const rater2 = raters.find(r => r.raterType === RaterType.RATER2);
    
    const isSuperAdmin = userRole === "super_admin";
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Individual Assessments</h3>
        
        {selfRater && (isSuperAdmin || selfRater.completed) && (
          <Card>
            <CardHeader>
              <CardTitle>Self Assessment - {selfRater.name}</CardTitle>
              <CardDescription>{selfRater.email}</CardDescription>
              {isSuperAdmin && !selfRater.completed && (
                <div className="mt-1 text-sm text-amber-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Assessment not completed
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selfResults ? (
                <>
                  <DimensionChart scores={selfResults} />
                  <CoachabilityChart scores={selfResults} />
                </>
              ) : (
                <div className="text-center py-8">Loading self assessment results...</div>
              )}
            </CardContent>
          </Card>
        )}
        
        {rater1 && (isSuperAdmin || rater1.completed) && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Rater 1 Assessment - {rater1.name}</CardTitle>
              <CardDescription>{rater1.email}</CardDescription>
              {isSuperAdmin && !rater1.completed && (
                <div className="mt-1 text-sm text-amber-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Assessment not completed
                </div>
              )}
            </CardHeader>
            <CardContent>
              {rater1Results ? (
                <DimensionChart scores={rater1Results} />
              ) : (
                <div className="text-center py-8">Loading rater 1 assessment results...</div>
              )}
            </CardContent>
          </Card>
        )}
        
        {rater2 && (isSuperAdmin || rater2.completed) && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Rater 2 Assessment - {rater2.name}</CardTitle>
              <CardDescription>{rater2.email}</CardDescription>
              {isSuperAdmin && !rater2.completed && (
                <div className="mt-1 text-sm text-amber-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Assessment not completed
                </div>
              )}
            </CardHeader>
            <CardContent>
              {rater2Results ? (
                <DimensionChart scores={rater2Results} />
              ) : (
                <div className="text-center py-8">Loading rater 2 assessment results...</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:inline">
              Logged in as {userEmail}
            </span>
            <Button variant="outline" onClick={() => userRole === "admin" || userRole === "super_admin" ? navigate("/admin") : navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Back</span>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {(userRole === "admin" || userRole === "super_admin") 
              ? "Assessment Results Dashboard" 
              : "Your Assessment Results"}
          </h1>
          
          {(userRole === "admin" || userRole === "super_admin") && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>All Assessments</CardTitle>
                <CardDescription>
                  View and analyze results from all assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assessments by name or email"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Table for displaying assessments */}
                <div className="border rounded-md">
                  <div className="max-h-[400px] overflow-hidden">
                    <ScrollArea className="h-[400px] w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAssessments.length > 0 ? (
                            filteredAssessments.map((a) => {
                              const { allComplete } = getCompletionStatus(a);
                              return (
                                <TableRow key={a.id}>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-2 text-slate-500" />
                                      {a.selfRaterName}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Mail className="h-4 w-4 mr-2 text-slate-500" />
                                      {a.selfRaterEmail}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      allComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {allComplete ? 'Complete' : 'In Progress'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
                                      {new Date(a.createdAt).toLocaleDateString()}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedAssessment(a)}
                                    >
                                      <FileBarChart className="h-4 w-4 mr-2" />
                                      View Results
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No assessments found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedAssessment && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {selectedAssessment.selfRaterName}'s Assessment
                  </div>
                </CardTitle>
                <CardDescription>
                  {selectedAssessment.selfRaterEmail} - Created on {new Date(selectedAssessment.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(userRole === "super_admin" || userRole === "admin") && (
                  <div className="space-y-2 mb-4">
                    {renderRaterDetails(selectedAssessment, RaterType.SELF)}
                    {renderRaterDetails(selectedAssessment, RaterType.RATER1)}
                    {renderRaterDetails(selectedAssessment, RaterType.RATER2)}
                  </div>
                )}
                
                {!getCompletionStatus(selectedAssessment).allComplete && userRole !== "super_admin" && (
                  <div className="mb-4 p-3 border rounded-md border-yellow-300 bg-yellow-50">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 font-medium">Preliminary Results</p>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      These are preliminary results based on completed assessments. 
                      Full insights will be available once all assessments are complete.
                    </p>
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Loading assessment results...</p>
                  </div>
                ) : (
                  (results && results.dimensionScores && results.dimensionScores.length > 0) || userRole === "super_admin" ? (
                    <>
                      {userRole === "super_admin" || userRole === "admin" ? (
                        <Tabs defaultValue="aggregate" className="mt-6" onValueChange={(value) => setActiveTab(value as "aggregate" | "individual" | "responses")}>
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="aggregate">Aggregate</TabsTrigger>
                            <TabsTrigger value="individual">Individual</TabsTrigger>
                            {userRole === "super_admin" && (
                              <TabsTrigger value="responses">Responses</TabsTrigger>
                            )}
                          </TabsList>
                          <TabsContent value="aggregate" className="mt-4">
                            {results && results.dimensionScores && results.dimensionScores.length > 0 ? (
                              <>
                                <DimensionChart scores={results.dimensionScores} />
                                <CoachabilityChart scores={results.dimensionScores} />
                                
                                {(results.selfAwareness > 0 || results.coachabilityAwareness > 0) && (
                                  <AwarenessMetrics 
                                    selfAwareness={results.selfAwareness} 
                                    coachabilityAwareness={results.coachabilityAwareness} 
                                  />
                                )}
                                
                                {results.profileType && (
                                  <ProfileCard profileType={results.profileType} />
                                )}
                              </>
                            ) : (
                              <div className="text-center py-12">
                                <p className="text-lg text-muted-foreground">
                                  No results available yet. Waiting for assessments to be completed.
                                </p>
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="individual" className="mt-4">
                            {renderIndividualResults()}
                          </TabsContent>
                          {userRole === "super_admin" && (
                            <TabsContent value="responses" className="mt-4">
                              <IndividualResponses assessment={selectedAssessment} />
                            </TabsContent>
                          )}
                        </Tabs>
                      ) : (
                        <div className="space-y-8">
                          <DimensionChart scores={results.dimensionScores} />
                          <CoachabilityChart scores={results.dimensionScores} />
                          
                          {(results.selfAwareness > 0 || results.coachabilityAwareness > 0) && (
                            <AwarenessMetrics 
                              selfAwareness={results.selfAwareness} 
                              coachabilityAwareness={results.coachabilityAwareness} 
                            />
                          )}
                          
                          {results.profileType && (
                            <ProfileCard profileType={results.profileType} />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">
                        No results available yet. Please complete the assessment.
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}
          
          {(!results || !results.dimensionScores || results.dimensionScores.length === 0) && !selectedAssessment && !(userRole === "admin" || userRole === "super_admin") && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No results available yet. Please complete the assessment.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/assessment")}
              >
                Continue Assessment
              </Button>
            </div>
          )}
          
          {selectedAssessment && (
            <div className="flex justify-center">
              {userRole === "admin" || userRole === "super_admin" ? (
                <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
                  Back to All Assessments
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
