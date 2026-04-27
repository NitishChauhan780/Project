import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    try {
      const savedUser = localStorage.getItem("mindbridge_user");
      if (savedUser && savedUser !== "undefined") {
        const { token } = JSON.parse(savedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error("Error parsing auth token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const userAPI = {
  getAll: () => api.get("/users"),
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export const moodAPI = {
  getAll: (userId) => api.get(`/mood/${userId}`),
  create: (data) => api.post("/mood", data),
  getStreak: (userId) => api.get(`/mood/streak/${userId}`),
};

export const quizAPI = {
  getAll: (userId) => api.get(`/quiz/${userId}`),
  submit: (data) => api.post("/quiz/submit", data),
};

export const journalAPI = {
  getAll: (userId) => api.get(`/journal/${userId}`),
  create: (data) => api.post("/journal", data),
};

export const appointmentAPI = {
  getAll: () => api.get("/appointments"),
  getByStudent: (studentId) => api.get(`/appointments/student/${studentId}`),
  getByCounsellor: (counsellorId) =>
    api.get(`/appointments/counsellor/${counsellorId}`),
  getCounsellors: () => api.get("/appointments/counsellors"),
  getAvailability: (counsellorId, date) =>
    api.get(`/appointments/availability/${counsellorId}/${date}`),
  create: (data) => api.post("/appointments", data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  rate: (id, data) => api.post(`/appointments/${id}/rate`, data),
};

export const forumAPI = {
  getPosts: (params) => api.get("/forum/posts", { params }),
  createPost: (data) => api.post("/forum/posts", data),
  reply: (postId, data) => api.post(`/forum/reply/${postId}`, data),
  upvote: (postId) => api.put(`/forum/upvote/${postId}`),
  reportPost: (postId, data) => api.post(`/forum/report/${postId}`, data),
};

export const resourceAPI = {
  getAll: (params) => api.get("/resources", { params }),
  getById: (id) => api.get(`/resources/${id}`),
};

export const aiAPI = {
  chat: (message, history, userContext) =>
    api.post("/ai/chat", {
      message,
      conversationHistory: history,
      userContext,
    }),
};

export const adminAPI = {
  getStats: (params) => api.get("/admin/stats", { params }),
};

export const adminUsersAPI = {
  getAll: () => api.get("/admin/users"),
  create: (data) => api.post("/admin/users", data),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deactivate: (id) => api.put(`/admin/users/${id}/deactivate`),
  activate: (id) => api.put(`/admin/users/${id}/activate`),
};

export const adminResourcesAPI = {
  getAll: () => api.get("/admin/resources"),
  create: (data) => api.post("/admin/resources", data),
  update: (id, data) => api.put(`/admin/resources/${id}`, data),
  delete: (id) => api.delete(`/admin/resources/${id}`),
};

export const adminModerationAPI = {
  getPosts: (params) => api.get("/admin/moderation/posts", { params }),
  deletePost: (id, data) =>
    api.delete(`/admin/moderation/posts/${id}`, { data }),
  pinPost: (id, data) => api.put(`/admin/moderation/posts/${id}/pin`, data),
  unpinPost: (id, data) => api.put(`/admin/moderation/posts/${id}/unpin`, data),
  markSafe: (id, data) =>
    api.put(`/admin/moderation/posts/${id}/mark-safe`, data),
  getLogs: () => api.get("/admin/moderation/logs"),
};

export const adminAlertsAPI = {
  getAtRisk: () => api.get("/admin/alerts/at-risk"),
};

export const adminCounsellorsAPI = {
  getAll: () => api.get("/admin/counsellors"),
};

export const announcementsAPI = {
  getAll: (params) => api.get("/announcements", { params }),
  create: (data) => api.post("/announcements", data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const notificationAPI = {
  getAll: (userId, params = {}) =>
    api.get(`/notifications/${userId}`, { params }),
  getUnreadCount: (userId) => api.get(`/notifications/${userId}/unread-count`),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/${userId}/read-all`),
  create: (data) => api.post("/notifications", data),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  clearRead: (userId) => api.delete(`/notifications/${userId}/clear-read`),
};

export const sleepAPI = {
  getAll: (userId, days = 30) =>
    api.get(`/sleep/${userId}`, { params: { days } }),
  create: (data) => api.post("/sleep", data),
  getStats: (userId) => api.get(`/sleep/${userId}/stats`),
  getCorrelation: (userId) => api.get(`/sleep/${userId}/correlation`),
  delete: (entryId) => api.delete(`/sleep/${entryId}`),
};

export const availabilityAPI = {
  get: (counsellorId) => api.get(`/availability/${counsellorId}`),
  update: (counsellorId, data) =>
    api.put(`/availability/${counsellorId}`, data),
  getAvailableSlots: (counsellorId, date) =>
    api.get(`/availability/${counsellorId}/available-slots/${date}`),
};

export const messageAPI = {
  getConversation: (appointmentId) =>
    api.get(`/messages/conversation/${appointmentId}`),
  getConversations: (userId) => api.get(`/messages/conversations/${userId}`),
  getUnread: (userId, role) =>
    api.get(`/messages/user/${userId}`, { params: { role } }),
  send: (data) => api.post("/messages", data),
  markRead: (messageId) => api.put(`/messages/${messageId}/read`),
  markConversationRead: (appointmentId, userId) =>
    api.put(`/messages/conversation/${appointmentId}/read/${userId}`),
};

export const chatHistoryAPI = {
  get: (userId, limit = 50) =>
    api.get(`/chat-history/${userId}`, { params: { limit } }),
  add: (userId, role, content) =>
    api.post(`/chat-history/${userId}`, { role, content }),
  clear: (userId) => api.delete(`/chat-history/${userId}`),
};

export default api;
