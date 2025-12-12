import * as vscode from 'vscode';

export interface BackendConfig {
  auth: {
    apiKey: string;
    authDomain: string;
    projectId: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  proPlan: {
    enabled: boolean;
    features: string[];
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: BackendConfig;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.config = this.loadConfig();
  }

  public static getInstance(context: vscode.ExtensionContext): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(context);
    }
    return ConfigManager.instance;
  }

  private loadConfig(): BackendConfig {
    const config = vscode.workspace.getConfiguration('codeflow');
    
    return {
      auth: {
        apiKey: config.get('auth.apiKey', ''),
        authDomain: config.get('auth.authDomain', ''),
        projectId: config.get('auth.projectId', '')
      },
      api: {
        baseUrl: config.get('api.baseUrl', 'https://api.codeflow.ai'),
        timeout: config.get('api.timeout', 10000)
      },
      proPlan: {
        enabled: config.get('proPlan.enabled', false),
        features: config.get('proPlan.features', [
          'advanced_analytics',
          'team_insights',
          'unlimited_history',
          'priority_support'
        ])
      }
    };
  }

  public getConfig(): BackendConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<BackendConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private saveConfig(): void {
    const config = vscode.workspace.getConfiguration('codeflow');
    
    config.update('auth.apiKey', this.config.auth.apiKey, vscode.ConfigurationTarget.Global);
    config.update('auth.authDomain', this.config.auth.authDomain, vscode.ConfigurationTarget.Global);
    config.update('auth.projectId', this.config.auth.projectId, vscode.ConfigurationTarget.Global);
    config.update('api.baseUrl', this.config.api.baseUrl, vscode.ConfigurationTarget.Global);
    config.update('api.timeout', this.config.api.timeout, vscode.ConfigurationTarget.Global);
    config.update('proPlan.enabled', this.config.proPlan.enabled, vscode.ConfigurationTarget.Global);
    config.update('proPlan.features', this.config.proPlan.features, vscode.ConfigurationTarget.Global);
  }

  public isProPlanEnabled(): boolean {
    return this.config.proPlan.enabled;
  }
}