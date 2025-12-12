import * as vscode from 'vscode';
import { AuthService } from './authService';
import { ApiService } from './apiService';
import { ConfigManager } from './config';
import { User, AuthState } from './types';

export class BackendServicesModule {
  private authService: AuthService;
  private apiService: ApiService;
  private config: ConfigManager;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.config = ConfigManager.getInstance(context);
    this.authService = AuthService.getInstance(context);
    this.apiService = ApiService.getInstance(context);
  }

  // Auth methods
  public getAuthService(): AuthService {
    return this.authService;
  }

  public getApiService(): ApiService {
    return this.apiService;
  }

  public getConfig(): ConfigManager {
    return this.config;
  }

  // Convenience methods
  public getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  public isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  public isProUser(): boolean {
    return this.authService.isProUser();
  }

  public onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    return this.authService.onAuthStateChanged(callback);
  }

  // Pro plan check
  public requireProPlan(featureName: string): boolean {
    if (!this.isProUser()) {
      vscode.window.showInformationMessage(
        `${featureName} is a Pro plan feature. Please upgrade to Pro to access this feature.`,
        'Upgrade to Pro'
      ).then(selection => {
        if (selection === 'Upgrade to Pro') {
          vscode.commands.executeCommand('codeflow.upgradeToPro');
        }
      });
      return false;
    }
    return true;
  }

  // Dispose method
  public dispose(): void {
    // Nothing to dispose for now
  }
}