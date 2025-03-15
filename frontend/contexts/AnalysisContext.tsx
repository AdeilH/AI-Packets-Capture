'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our analysis data
interface AnalysisData {
  summary: any;
  anomalies: any[];
  llm_analysis: any;
  // Add other fields as needed
}

// Define the context shape
interface AnalysisContextType {
  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context
const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Provider component
export const AnalysisProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AnalysisContext.Provider value={{
      analysisData,
      setAnalysisData,
      isLoading,
      setIsLoading,
      error,
      setError
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Custom hook to use the analysis context
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}; 