
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssessmentProvider } from "./contexts/AssessmentContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { importQuestionsToDb } from "./utils/importQuestionsToDb";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import LoginPage from "./pages/LoginPage";
import AssessmentPage from "./pages/AssessmentPage";
import CompletionPage from "./pages/CompletionPage";
import ResultsPage from "./pages/ResultsPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import StartPage from "./pages/StartPage";
import RaterStartPage from "./pages/RaterStartPage";

const queryClient = new QueryClient();

// The DatabaseInitializer component handles database setup
const DatabaseInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Create the database tables and initialize data
    const setupDatabase = async () => {
      try {
        // Check if the questions table exists
        const { error: tableCheckError } = await supabase
          .from('questions')
          .select('id')
          .limit(1);
        
        if (tableCheckError && tableCheckError.code === '42P01') { // Table doesn't exist error
          console.log("Questions table doesn't exist. Tables need to be created.");
          toast.error("Database tables need to be set up. Please contact an administrator.");
        } else {
          console.log("Database tables exist, proceeding with import...");
          // Tables exist, just import questions
          importQuestionsToDb();
        }
      } catch (error) {
        console.error("Error setting up database:", error);
        toast.error("Error setting up database. Using fallback mode.");
      }
    };
    
    setupDatabase();
  }, []);

  return <>{children}</>;
};

// The AppRoutes component handles the routing
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Assessment related routes */}
      <Route path="/start" element={
        <ProtectedRoute requiredRole={null}>
          <StartPage />
        </ProtectedRoute>
      } />
      <Route path="/rate" element={
        <ProtectedRoute requiredRole={null}>
          <RaterStartPage />
        </ProtectedRoute>
      } />
      <Route path="/assessment" element={
        <ProtectedRoute requiredRole="rater">
          <AssessmentPage />
        </ProtectedRoute>
      } />
      <Route path="/completion" element={<CompletionPage />} />
      
      {/* Admin routes with protection */}
      <Route path="/results" element={
        <ProtectedRoute requiredRole="admin">
          <ResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="super_admin">
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// The App component structure ensures that the providers are properly ordered
// Moving TooltipProvider inside each route where tooltips are used, not at the app level
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AssessmentProvider>
          <DatabaseInitializer>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </DatabaseInitializer>
        </AssessmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
