"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const config_1 = require("./config");
class ApiService {
    static instance;
    config;
    authToken = null;
    constructor(context) {
        this.config = config_1.ConfigManager.getInstance(context);
        this.loadAuthToken();
    }
    static getInstance(context) {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService(context);
        }
        return ApiService.instance;
    }
    loadAuthToken() {
        const context = this.config['context'];
        this.authToken = context.globalState.get('codeflow.authToken') || null;
    }
    saveAuthToken(token) {
        const context = this.config['context'];
        if (token) {
            context.globalState.update('codeflow.authToken', token);
        }
        else {
            context.globalState.update('codeflow.authToken', undefined);
        }
    }
    setAuthToken(token) {
        this.authToken = token;
        this.saveAuthToken(token);
    }
    clearAuthToken() {
        this.authToken = null;
        this.saveAuthToken(null);
    }
    async request(endpoint, options = {}) {
        const { baseUrl, timeout } = this.config.getConfig().api;
        const url = `${baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            clearTimeout(timeoutId);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async syncData(data) {
        return this.request('/sync', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getData(startDate, endDate) {
        return this.request(`/data?startDate=${startDate}&endDate=${endDate}`);
    }
    async getTeamInsights(teamId) {
        return this.request(`/teams/${teamId}/insights`);
    }
    async createTeam(name) {
        return this.request('/teams', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }
    async inviteToTeam(teamId, email) {
        return this.request(`/teams/${teamId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
    async getSubscriptionPlans() {
        return this.request('/subscriptions/plans');
    }
    async createSubscription(planId, paymentMethodId) {
        return this.request('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ planId, paymentMethodId })
        });
    }
    async getPaymentMethods() {
        return this.request('/payment-methods');
    }
    async addPaymentMethod(paymentMethod) {
        return this.request('/payment-methods', {
            method: 'POST',
            body: JSON.stringify(paymentMethod)
        });
    }
    async deletePaymentMethod(paymentMethodId) {
        return this.request(`/payment-methods/${paymentMethodId}`, {
            method: 'DELETE'
        });
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=apiService.js.map