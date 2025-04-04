
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Assessment, AssessmentResponse, RaterType } from "@/types/assessment";
import { toast } from "sonner";
import { getShuffledQuestions } from "@/data/questions";
import { loadAssessmentFromLocalStorage, saveAssessmentToLocalStorage, initializeAssessmentStorage, clearAssessmentFromLocalStorage } from "@/utils/assessmentStorage";
import { initializeAssessment, initializeRaterAssessment, addRater as addRaterToAssessment, updateResponse as updateAssessmentResponse, completeAssessment as markAssessmentComplete } from "@/utils/assessmentOperations";
import { calculateAllResults } from "@/utils/scoreCalculations";
import { fetchAssessmentByCode } from "@/utils/assessmentDbUtils";

interface AssessmentContextProps {
  assessment: Assessment | null;
  currentRater: RaterType;
  responses: AssessmentResponse[];
  questions: any[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  setCurrentRater: (rater: RaterType) => void;
  initializeAssessment: (email: string, name: string, code: string) => Promise<void>;
  initializeRaterAssessment: (raterEmail: string, raterName: string, code: string) => Promise<void>;
  updateResponse: (questionId: string, score: number) => void;
  completeAssessment: () => void;
  addRater: (email: string, name: string, raterType: RaterType) => void;
  getResults: (assessmentData?: Assessment) => any;
  resetAssessment: () => void;
  loading: boolean;
}

const AssessmentContext = createContext<AssessmentContextProps | undefined>(undefined);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};

interface AssessmentProviderProps {
  children: ReactNode;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  userCode: string | null;
  userType: string | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  codeLogin: (email: string, name: string, code: string, isSelf: boolean) => Promise<{ success: boolean; isNewAssessment?: boolean }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    const storedCode = localStorage.getItem("userCode");
    const storedType = localStorage.getItem("userType");
    const storedRole = localStorage.getItem("userRole");

    if (storedAuth === "true") {
      setIsAuthenticated(true);
      setUserEmail(storedEmail);
      setUserName(storedName);
      setUserCode(storedCode);
      setUserType(storedType);
      setUserRole(storedRole);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin authentication
    if (email === "super@orbit.com" && password === "super123") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "Super Admin");
      localStorage.setItem("userRole", "super_admin");
      
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserName("Super Admin");
      setUserRole("super_admin");
      return true;
    } else if (email === "admin@orbit.com" && password === "admin123") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "Admin User");
      localStorage.setItem("userRole", "admin");
      
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserName("Admin User");
      setUserRole("admin");
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userCode");
    localStorage.removeItem("userType");
    localStorage.removeItem("userRole");
    localStorage.removeItem("raterType");
    
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName(null);
    setUserCode(null);
    setUserType(null);
    setUserRole(null);
  };

  // Handle code-based login for assessment users and raters
  const codeLogin = async (
    email: string,
    name: string,
    code: string,
    isSelf: boolean
  ): Promise<{ success: boolean; isNewAssessment?: boolean }> => {
    try {
      if (isSelf) {
        // Self-rater login
        const assessment = await initializeAssessment(email, name, code);
        
        if (assessment) {
          // Set user data in local storage
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userCode", code);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", name);
          localStorage.setItem("userType", "self");
          localStorage.setItem("userRole", "rater"); // All assessment users are 'rater' role
          localStorage.setItem("raterType", RaterType.SELF);
          
          // Update state
          setIsAuthenticated(true);
          setUserCode(code);
          setUserEmail(email);
          setUserName(name); 
          setUserType("self");
          setUserRole("rater"); // Ensure self-assessment users have 'rater' role, not admin
          
          // Check if this is a new assessment or an existing one
          const isNew = assessment.raters.find(r => r.raterType === RaterType.SELF)?.responses.length === 0;
          
          return { success: true, isNewAssessment: isNew };
        } else {
          return { success: false };
        }
      } else {
        // External rater login
        const result = await initializeRaterAssessment(email, name, code);
        
        if (result) {
          // Set user data in local storage
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userCode", code);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", name);
          localStorage.setItem("userType", "rater");
          localStorage.setItem("userRole", "rater"); // External raters have 'rater' role
          localStorage.setItem("raterType", result.raterType);
          
          // Update state
          setIsAuthenticated(true);
          setUserCode(code);
          setUserEmail(email);
          setUserName(name);
          setUserType("rater");
          setUserRole("rater");
          
          return { success: true };
        } else {
          return { success: false };
        }
      }
    } catch (error) {
      console.error("Error in codeLogin:", error);
      return { success: false };
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    userName,
    userCode,
    userType,
    userRole,
    login,
    logout,
    codeLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
