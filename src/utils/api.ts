const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

let latestToken: string | null = null;

export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        let refreshRes = await fetch(`${API_BASE}/student/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: "{}"
        });

        if (!refreshRes.ok) {
            refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: "{}"
            });
        }

        if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData?.data?.accessToken || refreshData?.data?.token || refreshData?.accessToken || refreshData?.token;
            if (newToken) {
                console.log("Token refreshed successfully.");
                latestToken = newToken;

                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('token')) urlParams.set('token', newToken);
                if (urlParams.has('accesstoken')) urlParams.set('accesstoken', newToken);
                const newUrl = window.location.pathname + '?' + urlParams.toString();
                window.history.replaceState(null, '', newUrl);

                return newToken;
            }
        } else {
            console.error("Token refresh failed on both endpoints with status", refreshRes.status);
        }
    } catch (err) {
        console.error("Error during token refresh", err);
    }
    return null;
};

const apiFetch = async (url: string, options: RequestInit = {}, initialToken: string | null) => {
    if (!latestToken && initialToken) {
        latestToken = initialToken;
    }
    // If we have neither, try to refresh first
    if (!latestToken && !initialToken) {
        await refreshAccessToken();
    }

    const currentToken = latestToken || initialToken;
    const fetchOptions = { ...options };
    if (currentToken) {
        fetchOptions.headers = { ...(fetchOptions.headers || {}), Authorization: `Bearer ${currentToken}` };
    }

    let res = await fetch(url, fetchOptions);

    if (res.status === 401) {
        console.warn("401 Unauthorized encountered. Attempting to refresh token...");
        const newToken = await refreshAccessToken();
        if (newToken) {
            fetchOptions.headers = { ...(fetchOptions.headers || {}), Authorization: `Bearer ${newToken}` };
            res = await fetch(url, fetchOptions);
        }
    }
    
    return res;
};

export interface ApiQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    imageUrl?: string;
    audioUrl?: string | null;
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
      'Accept': 'application/json',
    };
  }

  async getQuestions(lessonId: string): Promise<ApiGameResponse> {
    const res = await apiFetch(`${API_BASE}/student/games/2/questions?lessonId=${lessonId}`, {
      headers: this.headers,
    }, this.token);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  }

  async startSession(lessonId: string): Promise<ApiSessionStartResponse> {
    const res = await apiFetch(`${API_BASE}/student/games/2/sessions?lessonId=${lessonId}`, {
      method: 'POST',
      headers: this.headers,
    }, this.token);
    if (!res.ok) throw new Error('Failed to start session');
    return res.json();
  }

  async submitAnswers(sessionId: string, answers: ApiSubmitAnswer[]): Promise<any> {
    const res = await apiFetch(`${API_BASE}/student/games/sessions/${sessionId}/submit-answers`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ answers }),
    }, this.token);
    if (!res.ok) throw new Error('Failed to submit answers');
    return res.json();
  }

  async completeSession(sessionId: string): Promise<ApiCompleteResponse> {
    const res = await apiFetch(`${API_BASE}/student/games/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: this.headers,
    }, this.token);
    if (!res.ok) throw new Error('Failed to complete session');
    return res.json();
  }
}
