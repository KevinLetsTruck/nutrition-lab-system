// Client-side API helper for assessment endpoints

const API_BASE = '/api/assessment';

export interface AssessmentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AssessmentAPIClient {
  /**
   * Start a new assessment for a client
   */
  async startAssessment(clientId: string): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    });
    return response.json();
  }

  /**
   * Get the next question for an assessment
   */
  async getNextQuestion(assessmentId: string): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/${assessmentId}/next-question`);
    return response.json();
  }

  /**
   * Submit a response to a question
   */
  async submitResponse(
    assessmentId: string,
    questionId: string,
    value: any,
    text?: string,
    confidence?: number
  ): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/${assessmentId}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, value, text, confidence })
    });
    return response.json();
  }

  /**
   * Pause an assessment
   */
  async pauseAssessment(assessmentId: string): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/${assessmentId}/pause`, {
      method: 'POST'
    });
    return response.json();
  }

  /**
   * Resume a paused assessment
   */
  async resumeAssessment(assessmentId: string): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/${assessmentId}/resume`, {
      method: 'POST'
    });
    return response.json();
  }

  /**
   * Get assessment progress
   */
  async getProgress(assessmentId: string): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/${assessmentId}/progress`);
    return response.json();
  }

  /**
   * Get assessment analysis (after completion)
   */
  async getAnalysis(assessmentId: string): Promise<AssessmentResponse> {
    const response = await fetch(`${API_BASE}/${assessmentId}/analysis`);
    return response.json();
  }
}

export const assessmentAPI = new AssessmentAPIClient();
