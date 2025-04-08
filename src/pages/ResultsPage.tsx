import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, DownloadIcon, ExternalLink, FileIcon, Loader2, RefreshCw, Trash2, UserIcon } from "lucide-react";
import Logo from "@/components/Logo";

interface Assessment {
  id: string;
  code: string;
  self_rater_name: string;
  self_rater_email: string;
  created_at: string;
  completed: boolean;
  num_raters: number;
  has_results: boolean;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const { userRole, logout, deleteReport } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: false });

        if (assessmentError) throw assessmentError;

        const assessmentsWithRaters = await Promise.all(
          assessmentData.map(async (assessment) => {
            const { count: raterCount, error: raterError } = await supabase
              .from('assessment_responses')
              .select('id', { count: 'exact', head: true })
              .eq('assessment_id', assessment.id);
            
            if (raterError) throw raterError;
            
            const { data: resultsData, error: resultsError } = await supabase
              .from('results')
              .select('id')
              .eq('assessment_id', assessment.id);
            
            if (resultsError) throw resultsError;
            
            return {
              ...assessment,
              num_raters: raterCount || 0,
              has_results: resultsData && resultsData.length > 0
            };
          })
        );

        setAssessments(assessmentsWithRaters);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        toast.error("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [refreshKey]);

  const handleDeleteReport = async (id: string) => {
    setDeleteInProgress(id);
    try {
      const success = await deleteReport(id);
      if (success) {
        setAssessments(prev => prev.filter(assessment => assessment.id !== id));
        toast.success("Report deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setDeleteInProgress(null);
    }
  };

  const handleViewResults = (assessment: Assessment) => {
    navigate(`/results/${assessment.id}`, { 
      state: { 
        assessmentId: assessment.id,
        assessmentCode: assessment.code,
        selfRaterName: assessment.self_rater_name
      } 
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo />
          </div>
          <div className="flex flex-wrap gap-2">
            {userRole === "super_admin" && (
              <Button variant="default" onClick={() => navigate("/admin")}>
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-gray-600 mt-2">
            View and analyze assessment results for all participants.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assessment Reports</CardTitle>
                <CardDescription>List of all completed and in-progress assessments</CardDescription>
              </div>
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading assessments...</span>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <FileIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No assessments found</h3>
                <p className="text-gray-500 mt-1">No one has completed an assessment yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Raters</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.code}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{assessment.self_rater_name}</span>
                            <span className="text-sm text-gray-500">{assessment.self_rater_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {assessment.completed ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{assessment.num_raters}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewResults(assessment)}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. It will permanently delete the assessment report
                                  for {assessment.self_rater_name} and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteReport(assessment.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  disabled={deleteInProgress === assessment.id}
                                >
                                  {deleteInProgress === assessment.id ? 
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : 
                                    'Delete'
                                  }
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
