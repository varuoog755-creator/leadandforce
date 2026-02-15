import axios from 'axios';
import { auth } from './firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (err) {
        console.error('Failed to get auth token:', err);
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token expired or invalid - redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// ============ API Functions ============

// Analytics
export const fetchDashboardAnalytics = () => api.get('/analytics/dashboard');

// Social Accounts
export const fetchSocialAccounts = () => api.get('/social-accounts');
export const addSocialAccount = (data: {
    platform: string;
    username: string;
    password: string;
    proxyIp?: string;
    proxyPort?: number;
}) => api.post('/social-accounts', data);
export const deleteSocialAccount = (id: string) => api.delete(`/social-accounts/${id}`);
export const fetchAccountStats = (id: string) => api.get(`/social-accounts/${id}/stats`);
export const initLinkedInOAuth = () => api.get('/oauth/linkedin/init');

// Campaigns
export const fetchCampaigns = () => api.get('/campaigns');
export const createCampaign = (data: {
    name: string;
    socialAccountId: string;
    platform: string;
    actionType: string;
    targetAudienceUrl?: string;
    dailyLimit?: number;
    personalizationTemplate?: string;
}) => api.post('/campaigns', data);
export const updateCampaignStatus = (id: string, status: string) => api.patch(`/campaigns/${id}`, { status });
export const deleteCampaign = (id: string) => api.delete(`/campaigns/${id}`);

// Leads
export const fetchLeads = (campaignId: string) => api.get(`/leads/${campaignId}`);
export const fetchAllLeads = (params?: any) => api.get('/leads', { params });
export const updateLeadStatus = (id: string, status: string) => api.patch(`/leads/${id}`, { status });
export const exportLeads = (params?: any) => api.get('/leads/export', { params, responseType: 'blob' });

// Inbox
export const fetchInboxMessages = () => api.get('/inbox');
export const fetchInboxStats = () => api.get('/inbox/stats');
export const fetchInboxThread = (threadId: string) => api.get(`/inbox/thread/${threadId}`);
export const replyToMessage = (data: { threadId: string; socialAccountId: string; messageText: string }) =>
    api.post('/inbox/reply', data);
export const markMessageRead = (id: string) => api.patch(`/inbox/${id}/read`);
export const markThreadRead = (threadId: string) => api.patch(`/inbox/thread/${threadId}/read`);

// Action Logs
export const fetchActionLogs = (params?: any) => api.get('/action-logs', { params });
export const fetchCampaignLogs = (campaignId: string, params?: any) => api.get(`/action-logs/campaign/${campaignId}`, { params });

export default api;
