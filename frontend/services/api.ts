// Centralized API service for all backend requests

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchAnalysisData = async (fileData: FormData) => {
  try {
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: fileData,
      // Don't set Content-Type header - browser will set it with proper boundary for FormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch analysis data:', error);
    throw error;
  }
};

export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/api/status`);
    return response.ok;
  } catch (error) {
    console.error('Backend status check failed:', error);
    return false;
  }
};

export const requestLLMAnalysis = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/api/analyze-llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch LLM analysis:', error);
    throw error;
  }
};

export const fetchSampleAnalysis = async () => {
  try {
    const response = await fetch(`${API_URL}/api/sample-analysis`);
    
    if (!response.ok) {
      throw new Error(`API Error (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sample analysis:', error);
    throw error;
  }
}; 