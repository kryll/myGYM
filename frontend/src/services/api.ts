import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Tenant,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  Exercise,
  TrainingPlan,
  UserPlanEnrollment,
  WorkoutSession,
  BodyMeasurement,
  Challenge,
  UserChallenge,
  Goal,
  Notification,
  AIConversation,
  DeviceConnection,
  DashboardStats,
  ExerciseFilters,
  PlanFilters,
} from '@/types';

// ============================================================
// Axios Instance
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token + tenant header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { tokens, tenant } = useAuthStore.getState();

    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    if (tenant?.slug) {
      config.headers['X-Tenant-Slug'] = tenant.slug;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - refresh token on 401
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const { tokens, refreshTokens, logout } = useAuthStore.getState();

      if (!tokens?.refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await refreshTokens();
        refreshQueue.forEach(({ resolve }) => resolve(newTokens.accessToken));
        refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================
// Auth Services
// ============================================================

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tenant: Tenant; tokens: AuthTokens }>> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (registerData: RegisterData): Promise<ApiResponse<{ user: User; tenant: Tenant; tokens: AuthTokens }>> => {
    const { data } = await api.post('/auth/register', registerData);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  updateProfile: async (updates: Partial<User>): Promise<ApiResponse<User>> => {
    const { data } = await api.put('/auth/profile', updates);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },
};

// ============================================================
// Dashboard Services
// ============================================================

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  getRecentWorkouts: async (limit = 5): Promise<ApiResponse<WorkoutSession[]>> => {
    const { data } = await api.get(`/dashboard/recent-workouts?limit=${limit}`);
    return data;
  },

  getAITip: async (): Promise<ApiResponse<{ tip: string; category: string }>> => {
    const { data } = await api.get('/dashboard/ai-tip');
    return data;
  },
};

// ============================================================
// Exercise Services
// ============================================================

export const exerciseService = {
  getAll: async (filters?: ExerciseFilters, page = 1, limit = 20): Promise<PaginatedResponse<Exercise>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const { data } = await api.get(`/exercises?${params}`);
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Exercise>> => {
    const { data } = await api.get(`/exercises/${id}`);
    return data;
  },

  create: async (exercise: Partial<Exercise>): Promise<ApiResponse<Exercise>> => {
    const { data } = await api.post('/exercises', exercise);
    return data;
  },

  update: async (id: string, exercise: Partial<Exercise>): Promise<ApiResponse<Exercise>> => {
    const { data } = await api.put(`/exercises/${id}`, exercise);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/exercises/${id}`);
    return data;
  },
};

// ============================================================
// Training Plan Services
// ============================================================

export const planService = {
  getAll: async (filters?: PlanFilters, page = 1, limit = 20): Promise<PaginatedResponse<TrainingPlan>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const { data } = await api.get(`/plans?${params}`);
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<TrainingPlan>> => {
    const { data } = await api.get(`/plans/${id}`);
    return data;
  },

  enroll: async (planId: string): Promise<ApiResponse<UserPlanEnrollment>> => {
    const { data } = await api.post(`/plans/${planId}/enroll`);
    return data;
  },

  unenroll: async (planId: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/plans/${planId}/enroll`);
    return data;
  },

  getEnrollment: async (): Promise<ApiResponse<UserPlanEnrollment | null>> => {
    const { data } = await api.get('/plans/enrollment/active');
    return data;
  },

  getUserPlans: async (): Promise<ApiResponse<UserPlanEnrollment[]>> => {
    const { data } = await api.get('/plans/user/all');
    return data;
  },
};

// ============================================================
// Workout Session Services
// ============================================================

export const workoutService = {
  startSession: async (sessionData: Partial<WorkoutSession>): Promise<ApiResponse<WorkoutSession>> => {
    const { data } = await api.post('/workouts/sessions', sessionData);
    return data;
  },

  getSession: async (id: string): Promise<ApiResponse<WorkoutSession>> => {
    const { data } = await api.get(`/workouts/sessions/${id}`);
    return data;
  },

  updateSession: async (id: string, updates: Partial<WorkoutSession>): Promise<ApiResponse<WorkoutSession>> => {
    const { data } = await api.put(`/workouts/sessions/${id}`, updates);
    return data;
  },

  completeSession: async (id: string, finalData: Partial<WorkoutSession>): Promise<ApiResponse<WorkoutSession>> => {
    const { data } = await api.post(`/workouts/sessions/${id}/complete`, finalData);
    return data;
  },

  getUserSessions: async (page = 1, limit = 20): Promise<PaginatedResponse<WorkoutSession>> => {
    const { data } = await api.get(`/workouts/sessions?page=${page}&limit=${limit}`);
    return data;
  },

  logSet: async (sessionId: string, exerciseId: string, setData: object): Promise<ApiResponse<WorkoutSession>> => {
    const { data } = await api.post(`/workouts/sessions/${sessionId}/exercises/${exerciseId}/sets`, setData);
    return data;
  },
};

// ============================================================
// Measurements Services
// ============================================================

export const measurementService = {
  getAll: async (page = 1, limit = 50): Promise<PaginatedResponse<BodyMeasurement>> => {
    const { data } = await api.get(`/measurements?page=${page}&limit=${limit}`);
    return data;
  },

  getLatest: async (): Promise<ApiResponse<BodyMeasurement | null>> => {
    const { data } = await api.get('/measurements/latest');
    return data;
  },

  create: async (measurement: Partial<BodyMeasurement>): Promise<ApiResponse<BodyMeasurement>> => {
    const { data } = await api.post('/measurements', measurement);
    return data;
  },

  update: async (id: string, measurement: Partial<BodyMeasurement>): Promise<ApiResponse<BodyMeasurement>> => {
    const { data } = await api.put(`/measurements/${id}`, measurement);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/measurements/${id}`);
    return data;
  },
};

// ============================================================
// Challenge Services
// ============================================================

export const challengeService = {
  getAll: async (): Promise<ApiResponse<Challenge[]>> => {
    const { data } = await api.get('/challenges');
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Challenge>> => {
    const { data } = await api.get(`/challenges/${id}`);
    return data;
  },

  getUserChallenges: async (): Promise<ApiResponse<UserChallenge[]>> => {
    const { data } = await api.get('/challenges/user/active');
    return data;
  },

  join: async (challengeId: string): Promise<ApiResponse<UserChallenge>> => {
    const { data } = await api.post(`/challenges/${challengeId}/join`);
    return data;
  },

  leave: async (challengeId: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/challenges/${challengeId}/join`);
    return data;
  },

  getLeaderboard: async (challengeId: string): Promise<ApiResponse<UserChallenge[]>> => {
    const { data } = await api.get(`/challenges/${challengeId}/leaderboard`);
    return data;
  },
};

// ============================================================
// Goals Services
// ============================================================

export const goalService = {
  getAll: async (): Promise<ApiResponse<Goal[]>> => {
    const { data } = await api.get('/goals');
    return data;
  },

  create: async (goal: Partial<Goal>): Promise<ApiResponse<Goal>> => {
    const { data } = await api.post('/goals', goal);
    return data;
  },

  update: async (id: string, goal: Partial<Goal>): Promise<ApiResponse<Goal>> => {
    const { data } = await api.put(`/goals/${id}`, goal);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/goals/${id}`);
    return data;
  },

  achieve: async (id: string): Promise<ApiResponse<Goal>> => {
    const { data } = await api.post(`/goals/${id}/achieve`);
    return data;
  },
};

// ============================================================
// Notification Services
// ============================================================

export const notificationService = {
  getAll: async (page = 1, limit = 20): Promise<PaginatedResponse<Notification>> => {
    const { data } = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },
};

// ============================================================
// AI Services
// ============================================================

export const aiService = {
  getConversations: async (): Promise<ApiResponse<AIConversation[]>> => {
    const { data } = await api.get('/ai/conversations');
    return data;
  },

  getConversation: async (id: string): Promise<ApiResponse<AIConversation>> => {
    const { data } = await api.get(`/ai/conversations/${id}`);
    return data;
  },

  createConversation: async (): Promise<ApiResponse<AIConversation>> => {
    const { data } = await api.post('/ai/conversations');
    return data;
  },

  sendMessage: async (conversationId: string, message: string): Promise<ApiResponse<{ messageId: string }>> => {
    const { data } = await api.post(`/ai/conversations/${conversationId}/messages`, { content: message });
    return data;
  },

  generatePlan: async (preferences: object): Promise<ApiResponse<TrainingPlan>> => {
    const { data } = await api.post('/ai/generate-plan', preferences);
    return data;
  },

  analyzeProgress: async (): Promise<ApiResponse<{ analysis: string; recommendations: string[] }>> => {
    const { data } = await api.get('/ai/analyze-progress');
    return data;
  },

  streamChat: (conversationId: string, message: string): EventSource => {
    const { tokens, tenant } = useAuthStore.getState();
    const params = new URLSearchParams({
      message,
      token: tokens?.accessToken || '',
      tenantSlug: tenant?.slug || '',
    });
    return new EventSource(`${BASE_URL}/ai/conversations/${conversationId}/stream?${params}`);
  },
};

// ============================================================
// Device Services
// ============================================================

export const deviceService = {
  getAll: async (): Promise<ApiResponse<DeviceConnection[]>> => {
    const { data } = await api.get('/devices');
    return data;
  },

  register: async (device: Partial<DeviceConnection>): Promise<ApiResponse<DeviceConnection>> => {
    const { data } = await api.post('/devices', device);
    return data;
  },

  update: async (id: string, updates: Partial<DeviceConnection>): Promise<ApiResponse<DeviceConnection>> => {
    const { data } = await api.put(`/devices/${id}`, updates);
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/devices/${id}`);
    return data;
  },

  syncData: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post(`/devices/${id}/sync`);
    return data;
  },
};

// ============================================================
// Tenant Services (Admin)
// ============================================================

export const tenantService = {
  getCurrent: async (): Promise<ApiResponse<Tenant>> => {
    const { data } = await api.get('/tenants/current');
    return data;
  },

  update: async (updates: Partial<Tenant>): Promise<ApiResponse<Tenant>> => {
    const { data } = await api.put('/tenants/current', updates);
    return data;
  },

  getMembers: async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get(`/tenants/current/members?page=${page}&limit=${limit}`);
    return data;
  },

  inviteMember: async (email: string, role: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/tenants/current/members/invite', { email, role });
    return data;
  },

  removeMember: async (userId: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/tenants/current/members/${userId}`);
    return data;
  },

  getStats: async (): Promise<ApiResponse<object>> => {
    const { data } = await api.get('/tenants/current/stats');
    return data;
  },
};

export default api;
