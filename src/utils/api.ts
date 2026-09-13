const API_BASE = 'https://learning-platform-1euu.onrender.com/api/v1/student';

export interface ApiQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    imageUrl?: string;
  }[];
  correctAnswer: string;
  points: number;
  timeLimit: number;
  order: number;
  hint: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
}

export interface ApiGameResponse {
  success: boolean;
  data: {
    lessonId: number;
    lessonName: string;
    questions: ApiQuestion[];
  };
}

export interface ApiSessionStartResponse {
  success: boolean;
  data: {
    id: string; // The sessionId
  };
}

export interface ApiSubmitAnswer {
  questionId: number;
  selectedAnswer: string; // usually the text of the selected option
  timeTaken: number;
}

export interface ApiCompleteResponse {
  success: boolean;
  data: {
    score: number;
    percentage: number;
    stars: number;
    coins: number;
    experience: number;
    session: {
      id: string;
      status: string;
    };
    reward: any;
    isNewReward: boolean;
  };
}

export class GameAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  async getQuestions(lessonId: string): Promise<ApiGameResponse> {
    const res = await fetch(`${API_BASE}/games/2/questions?lessonId=${lessonId}`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  }

  async startSession(lessonId: string): Promise<ApiSessionStartResponse> {
    // According to the prompt, we POST to create the session
    const res = await fetch(`${API_BASE}/games/2/sessions?lessonId=${lessonId}`, {
      method: 'POST',
      headers: this.headers,
    });
    if (!res.ok) throw new Error('Failed to start session');
    return res.json();
  }

  async submitAnswers(sessionId: string, answers: ApiSubmitAnswer[]): Promise<any> {
    const res = await fetch(`${API_BASE}/games/sessions/${sessionId}/submit-answers`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(answers),
    });
    if (!res.ok) throw new Error('Failed to submit answers');
    return res.json();
  }

  async completeSession(sessionId: string): Promise<ApiCompleteResponse> {
    const res = await fetch(`${API_BASE}/games/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: this.headers,
    });
    if (!res.ok) throw new Error('Failed to complete session');
    return res.json();
  }
}
