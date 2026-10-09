const STUDENT_API_BASE = 'https://learning-platform-1euu.onrender.com/api/v1';
const USER_API_BASE = 'https://learning-platform-1euu.onrender.com/api/v1';
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://learning-platform-1euu.onrender.com'}/api/v1`;

export type AuthType = 'student' | 'user' | null;

export interface UserProfile {
  avatarUrl: string | null;
  accessoryUrl: string | null;
  profileImage?: string | null;
  name?: string | null;
  role?: string | null;
  authType?: AuthType;
}

let latestToken: string | null = null;
let currentAuthType: AuthType = null;
let cachedUserProfile: UserProfile | null = null;

// Mutex / in-flight refresh promise to completely prevent duplicate concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 4000;

// Mutex / in-flight profile promise
let userProfilePromise: Promise<UserProfile | null> | null = null;

// Subscribers
type ProfileSubscriber = (profile: UserProfile | null) => void;
const profileSubscribers = new Set<ProfileSubscriber>();

export const subscribeUserProfile = (sub: ProfileSubscriber) => {
  profileSubscribers.add(sub);
  if (cachedUserProfile) {
    sub(cachedUserProfile);
  }
  return () => {
    profileSubscribers.delete(sub);
  };
};

export const getUserProfile = (): UserProfile | null => {
  return cachedUserProfile;
};

const notifySubscribers = (profile: UserProfile | null) => {
  cachedUserProfile = profile;
  profileSubscribers.forEach((sub) => {
    try {
      sub(profile);
    } catch (err) {
      console.error('Error notifying profile subscriber:', err);
    }
  });
};

export const fetchUserProfile = async (
  token?: string | null,
  forcedAuthType?: AuthType
): Promise<UserProfile | null> => {
  const effectiveToken = token || latestToken;
  if (!effectiveToken) return null;

  if (userProfilePromise) {
    return userProfilePromise;
  }

  userProfilePromise = (async () => {
    try {
      const authTypeToUse = forcedAuthType || currentAuthType;

      // 1. If we know it was the student refresh endpoint
      if (authTypeToUse === 'student') {
        try {
          const res = await fetch(`${STUDENT_API_BASE}/auth/me/child`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${effectiveToken}`,
              'Accept': 'application/json'
            },
            credentials: 'include'
          });

          if (res.ok) {
            const json = await res.json();
            const child = json?.data?.child;
            const avatarUrl = child?.currentAvatar?.avatarUrl || child?.profileImage || null;
            const accessoryUrl = child?.currentAccessory?.accessoryUrl || null;
            const name = child?.firstName || child?.username || null;

            const profile: UserProfile = {
              avatarUrl,
              accessoryUrl,
              profileImage: child?.profileImage || null,
              name,
              role: child?.role || 'STUDENT',
              authType: 'student'
            };
            notifySubscribers(profile);
            return profile;
          }
        } catch (err) {
          console.error("Error fetching child profile:", err);
        }
      }

      // 2. If we know it was the non-student refresh endpoint
      if (authTypeToUse === 'user') {
        try {
          const res = await fetch(`${USER_API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${effectiveToken}`,
              'Accept': 'application/json'
            },
            credentials: 'include'
          });

          if (res.ok) {
            const json = await res.json();
            const user = json?.data?.user;
            const avatarUrl = user?.profileImage || null;
            const name = user?.firstName || null;

            const profile: UserProfile = {
              avatarUrl,
              accessoryUrl: null,
              profileImage: user?.profileImage || null,
              name,
              role: user?.role || 'USER',
              authType: 'user'
            };
            notifySubscribers(profile);
            return profile;
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }

      // 3. Fallback when authTypeToUse is not yet known (e.g. token came from URL)
      // Try student endpoint first
      try {
        const studentRes = await fetch(`${STUDENT_API_BASE}/auth/me/child`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (studentRes.ok) {
          const json = await studentRes.json();
          const child = json?.data?.child;
          currentAuthType = 'student';
          const avatarUrl = child?.currentAvatar?.avatarUrl || child?.profileImage || null;
          const accessoryUrl = child?.currentAccessory?.accessoryUrl || null;
          const name = child?.firstName || child?.username || null;

          const profile: UserProfile = {
            avatarUrl,
            accessoryUrl,
            profileImage: child?.profileImage || null,
            name,
            role: child?.role || 'STUDENT',
            authType: 'student'
          };
          notifySubscribers(profile);
          return profile;
        }
      } catch (err) {
        // try next
      }

      // Try non-student endpoint
      try {
        const userRes = await fetch(`${USER_API_BASE}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (userRes.ok) {
          const json = await userRes.json();
          const user = json?.data?.user;
          currentAuthType = 'user';
          const avatarUrl = user?.profileImage || null;
          const name = user?.firstName || null;

          const profile: UserProfile = {
            avatarUrl,
            accessoryUrl: null,
            profileImage: user?.profileImage || null,
            name,
            role: user?.role || 'USER',
            authType: 'user'
          };
          notifySubscribers(profile);
          return profile;
        }
      } catch (err) {
        // failed
      }

      return null;
    } finally {
      userProfilePromise = null;
    }
  })();

  return userProfilePromise;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  // If a refresh is already in-flight, return the same promise to prevent duplicate calls
  if (refreshPromise) {
    return refreshPromise;
  }

  // Guard against excessive calls within cooldown window
  if (latestToken && Date.now() - lastRefreshTime < REFRESH_COOLDOWN_MS) {
    return latestToken;
  }

  refreshPromise = (async () => {
    try {
      lastRefreshTime = Date.now();
      let newToken: string | null = null;
      let usedAuthType: AuthType = null;

      // 1. Try student refresh first
      try {
        const studentRes = await fetch(`${STUDENT_API_BASE}/student/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: "{}"
        });

        if (studentRes.ok) {
          const studentData = await studentRes.json();
          newToken = studentData?.data?.accessToken || studentData?.data?.token || studentData?.accessToken || studentData?.token || null;
          if (newToken) {
            usedAuthType = 'student';
            console.log("Student token refreshed successfully.");
          }
        }
      } catch (err) {
        console.warn("Student refresh failed, trying alternative:", err);
      }

      // 2. If student refresh failed, try non-student refresh
      if (!newToken) {
        try {
          let userRes = await fetch(`${USER_API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: "{}"
          });

          if (!userRes.ok) {
            // Also fallback to STUDENT_API_BASE/auth/refresh
            userRes = await fetch(`${STUDENT_API_BASE}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: "{}"
            });
          }

          if (userRes.ok) {
            const userData = await userRes.json();
            newToken = userData?.data?.accessToken || userData?.data?.token || userData?.accessToken || userData?.token || null;
            if (newToken) {
              usedAuthType = 'user';
              console.log("User token refreshed successfully.");
            }
          }
        } catch (err) {
          console.warn("User refresh failed:", err);
        }
      }

      if (newToken) {
        latestToken = newToken;
        currentAuthType = usedAuthType;

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('token')) urlParams.set('token', newToken);
        if (urlParams.has('accesstoken')) urlParams.set('accesstoken', newToken);
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState(null, '', newUrl);

        // Immediately fetch the profile according to the used refresh endpoint
        fetchUserProfile(newToken, usedAuthType).catch((e) => console.error(e));

        return newToken;
      } else {
        console.warn("Token refresh failed on all endpoints.");
        return null;
      }
    } catch (err) {
      console.error("Error during token refresh", err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const apiFetch = async (url: string, options: RequestInit = {}, initialToken: string | null) => {
  if (!latestToken && initialToken) {
    latestToken = initialToken;
  }
  // If we have neither, try to refresh first (deduplicated)
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
