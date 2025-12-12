import * as vscode from 'vscode';
import { ApiResponse, SyncData, ApiConfig } from './types';
import { ConfigManager } from './config';

export class ApiService {
  private static instance: ApiService;
  private config: ConfigManager;
  private authToken: string | null = null;

  private constructor(context: vscode.ExtensionContext) {
    this.config = ConfigManager.getInstance(context);
    this.loadAuthToken();
  }

  public static getInstance(context: vscode.ExtensionContext): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(context);
    }
    return ApiService.instance;
  }

  private loadAuthToken(): void {
    const context = this.config['context'];
    this.authToken = context.globalState.get<string>('codeflow.authToken');
  }

  private saveAuthToken(token: string | null): void {
    const context = this.config['context'];
    if (token) {
      context.globalState.update('codeflow.authToken', token);
    } else {
      context.globalState.update('codeflow.authToken', undefined);
    }
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    this.saveAuthToken(token);
  }

  public clearAuthToken(): void {
    this.authToken = null;
    this.saveAuthToken(null);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const { baseUrl, timeout } = this.config.getConfig().api;
    const url = `${baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
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
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async syncData(data: SyncData): Promise<ApiResponse> {
    return this.request('/sync', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getData(startDate: string, endDate: string): Promise<ApiResponse> {
    return this.request(`/data?startDate=${startDate}&endDate=${endDate}`);
  }

  public async getTeamInsights(teamId: string): Promise<ApiResponse> {
    return this.request(`/teams/${teamId}/insights`);
  }

  public async createTeam(name: string): Promise<ApiResponse> {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }

  public async inviteToTeam(teamId: string, email: string): Promise<ApiResponse> {
    return this.request(`/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public async getSubscriptionPlans(): Promise<ApiResponse> {
    return this.request('/subscriptions/plans');
  }

  public async createSubscription(planId: string, paymentMethodId: string): Promise<ApiResponse> {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethodId })
    });
  }

  public async getPaymentMethods(): Promise<ApiResponse> {
    return this.request('/payment-methods');
  }

  public async addPaymentMethod(paymentMethod: any): Promise<ApiResponse> {
    return this.request('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethod)
    });
  }

  public async deletePaymentMethod(paymentMethodId: string): Promise<ApiResponse> {
    return this.request(`/payment-methods/${paymentMethodId}`, {
      method: 'DELETE'
    });
  }
}