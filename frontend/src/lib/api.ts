import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request interceptor — attach auth token ──────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token =
    Cookies.get('access_token') ||
    (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — token refresh + redirect ─────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken =
        Cookies.get('refresh_token') ||
        (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token: newRefresh } = response.data;
          storeTokens(access_token, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          if (typeof window !== 'undefined') window.location.href = '/auth/login';
        }
      } else {
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export function storeTokens(access: string, refresh: string) {
  // No `secure: true` — breaks on localhost HTTP
  Cookies.set('access_token', access, { expires: 1, sameSite: 'strict' });
  Cookies.set('refresh_token', refresh, { expires: 30, sameSite: 'strict' });
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  refresh: (refresh_token: string) =>
    apiClient.post('/auth/refresh', { refresh_token }),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (data: { full_name?: string; bio?: string; avatar_url?: string }) =>
    apiClient.patch('/auth/me', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout'),
};

// ─── Videos API ───────────────────────────────────────────────────────────────
// Backend routes:
//   POST /videos/analyze        ← submit URL for instant analysis
//   GET  /videos/               ← list user's videos
//   GET  /videos/{id}           ← single video + full analysis
//   DELETE /videos/{id}         ← delete video
//   GET  /videos/dashboard-stats
export const videosApi = {
  /** Submit a URL for instant AI analysis (was called "ingest" in old api.ts) */
  analyze: (url: string) => apiClient.post('/videos/analyze', { url }),

  /** Legacy alias so existing imports of videosApi.ingest still work */
  ingest: (url: string) => apiClient.post('/videos/analyze', { url }),

  list: (params?: { page?: number; page_size?: number; platform?: string }) =>
    apiClient.get('/videos/', { params }),

  get: (id: string) => apiClient.get(`/videos/${id}`),

  delete: (id: string) => apiClient.delete(`/videos/${id}`),

  /** Re-analyze: delete old analysis then re-submit same URL */
  reanalyze: async (id: string) => {
    const videoRes = await apiClient.get(`/videos/${id}`);
    const url: string = videoRes.data?.video?.original_url ?? '';
    await apiClient.delete(`/videos/${id}`);
    return apiClient.post('/videos/analyze', { url });
  },

  dashboardStats: () => apiClient.get('/videos/dashboard-stats'),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
// Backend routes:
//   POST /chat/sessions               ← create session
//   GET  /chat/sessions               ← list sessions
//   GET  /chat/sessions/{id}          ← get session with messages
//   DELETE /chat/sessions/{id}        ← delete session
//   POST /chat/send                   ← send message (returns full JSON, no SSE)
//   GET  /chat/sessions/{id}/messages ← get messages
export const chatApi = {
  createSession: (data: { title?: string; video_ids?: string[] }) =>
    apiClient.post('/chat/sessions', data),

  listSessions: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/chat/sessions', { params }),

  getSession: (id: string) => apiClient.get(`/chat/sessions/${id}`),

  deleteSession: (id: string) => apiClient.delete(`/chat/sessions/${id}`),

  /**
   * Send a message — uses the simple POST /chat/send endpoint.
   * Returns { success, session_id, session_title, message: { role, content, ... } }
   */
  sendMessage: (data: { content: string; session_id?: string | null; video_ids?: string[] }) =>
    apiClient.post('/chat/send', data),

  /** Legacy: old code called chatApi.sendMessage(sessionId, { content }) */
  sendMessageLegacy: (sessionId: string, data: { content: string; video_ids?: string[] }) =>
    apiClient.post('/chat/send', { ...data, session_id: sessionId }),

  getMessages: (sessionId: string) =>
    apiClient.get(`/chat/sessions/${sessionId}/messages`),
};

// ─── Comparison API ───────────────────────────────────────────────────────────
// Backend route: POST /comparison/   body: { video_ids: string[] }
export const comparisonApi = {
  compare: (video_ids: string[]) =>
    apiClient.post('/comparison/', { video_ids }),

  /** List user's analyzed videos for the selector */
  myVideos: () => apiClient.get('/comparison/my-videos'),
};

// ─── Agents API ───────────────────────────────────────────────────────────────
// Backend routes:
//   GET  /agents/              ← list agents
//   POST /agents/{id}/run      ← run one agent, body: { video_id? }
//   POST /agents/run-all       ← run all agents, body: { video_id? }
export const agentsApi = {
  list: () => apiClient.get('/agents/'),

  run: (agentId: string, videoId?: string) =>
    apiClient.post(`/agents/${agentId}/run`, { video_id: videoId }),

  runAll: (videoId?: string) =>
    apiClient.post('/agents/run-all', { video_id: videoId }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
// Backend route: GET /dashboard/  (returns flat stats object)
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/'),
};
