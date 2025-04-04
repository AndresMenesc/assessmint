
import { Assessment } from "@/types/assessment";

/**
 * Saves an assessment to local storage
 */
export const saveAssessmentToLocalStorage = (assessment: Assessment): void => {
  if (!assessment) return;
  
  try {
    localStorage.setItem("orbit_assessment", JSON.stringify(assessment));
    
    // Also update the assessments array
    const savedAssessments = localStorage.getItem("orbit_assessments");
    if (savedAssessments) {
      try {
        const parsed = JSON.parse(savedAssessments);
        const existingIndex = parsed.findIndex((a: any) => a.id === assessment.id);
        
        if (existingIndex >= 0) {
          parsed[existingIndex] = assessment;
        } else {
          parsed.push(assessment);
        }
        
        localStorage.setItem("orbit_assessments", JSON.stringify(parsed));
      } catch (error) {
        console.error("Error updating assessments array:", error);
      }
    }
  } catch (error) {
    console.error("Error saving assessment to local storage:", error);
  }
};

/**
 * Loads an assessment from local storage by code
 */
export const loadAssessmentFromLocalStorage = (code: string): Assessment | null => {
  try {
    const savedAssessment = localStorage.getItem("orbit_assessment");
    if (savedAssessment) {
      const parsed = JSON.parse(savedAssessment);
      if (parsed.code === code) {
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt)
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading assessment from local storage:", error);
    localStorage.removeItem("orbit_assessment");
    return null;
  }
};

/**
 * Initializes the assessment storage
 */
export const initializeAssessmentStorage = (): void => {
  if (!localStorage.getItem("orbit_assessments")) {
    localStorage.setItem("orbit_assessments", JSON.stringify([]));
  }
};

/**
 * Clears an assessment from local storage
 */
export const clearAssessmentFromLocalStorage = (): void => {
  localStorage.removeItem("orbit_assessment");
};
