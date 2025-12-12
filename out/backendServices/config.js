"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const vscode = __importStar(require("vscode"));
class ConfigManager {
    static instance;
    config;
    context;
    constructor(context) {
        this.context = context;
        this.config = this.loadConfig();
    }
    static getInstance(context) {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager(context);
        }
        return ConfigManager.instance;
    }
    loadConfig() {
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
    getConfig() {
        return this.config;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
    }
    saveConfig() {
        const config = vscode.workspace.getConfiguration('codeflow');
        config.update('auth.apiKey', this.config.auth.apiKey, vscode.ConfigurationTarget.Global);
        config.update('auth.authDomain', this.config.auth.authDomain, vscode.ConfigurationTarget.Global);
        config.update('auth.projectId', this.config.auth.projectId, vscode.ConfigurationTarget.Global);
        config.update('api.baseUrl', this.config.api.baseUrl, vscode.ConfigurationTarget.Global);
        config.update('api.timeout', this.config.api.timeout, vscode.ConfigurationTarget.Global);
        config.update('proPlan.enabled', this.config.proPlan.enabled, vscode.ConfigurationTarget.Global);
        config.update('proPlan.features', this.config.proPlan.features, vscode.ConfigurationTarget.Global);
    }
    isProPlanEnabled() {
        return this.config.proPlan.enabled;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map