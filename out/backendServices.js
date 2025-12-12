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
exports.BackendServicesModule = exports.BackendServices = void 0;
const vscode = __importStar(require("vscode"));
class BackendServices {
    context;
    apiEndpoint = 'https://api.codeflow.example'; // Replace with your actual API
    isEnabled = false;
    constructor(context) {
        this.context = context;
        // Check if cloud sync is enabled
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('cloudSync', false);
    }
    async syncData(insight, progress) {
        if (!this.isEnabled) {
            return false;
        }
        try {
            // Get user identifier (you would implement proper authentication in a real extension)
            const userId = await this.getUserId();
            // Prepare data for sync
            const syncData = {
                userId,
                timestamp: Date.now(),
                insight,
                progress
            };
            // Send data to backend
            const response = await fetch(`${this.apiEndpoint}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(syncData)
            });
            if (response.ok) {
                console.log('Data synced successfully');
                return true;
            }
            else {
                console.error('Failed to sync data:', response.statusText);
                return false;
            }
        }
        catch (error) {
            console.error('Error syncing data:', error);
            return false;
        }
    }
    async getTeamInsights(teamId) {
        if (!this.isEnabled) {
            throw new Error('Cloud sync is disabled');
        }
        try {
            const response = await fetch(`${this.apiEndpoint}/teams/${teamId}/insights`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });
            if (response.ok) {
                return await response.json();
            }
            else {
                throw new Error(`Failed to get team insights: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error('Error getting team insights:', error);
            throw error;
        }
    }
    async getUserId() {
        // In a real implementation, you would get this from authentication
        // For now, we'll use a machine ID
        const storage = this.context.globalState;
        let userId = storage.get('codeflow-userId');
        if (!userId) {
            // Generate a random ID
            userId = 'user-' + Math.random().toString(36).substr(2, 9);
            await storage.update('codeflow-userId', userId);
        }
        return userId;
    }
    async getAuthToken() {
        // In a real implementation, you would implement OAuth or similar
        // For now, we'll return a placeholder
        const storage = this.context.globalState;
        let token = storage.get('codeflow-authToken');
        if (!token) {
            // In a real extension, you would implement proper authentication flow
            // For this example, we'll just show a message and use a placeholder
            vscode.window.showInformationMessage('Cloud sync requires authentication. This is a placeholder.');
            token = 'placeholder-token';
            await storage.update('codeflow-authToken', token);
        }
        return token;
    }
    async authenticate() {
        // In a real implementation, you would implement OAuth flow
        // For this example, we'll just show a message
        await vscode.window.showInformationMessage('This would open a browser for authentication in a real implementation', { modal: true }, 'OK');
        // Enable cloud sync
        const config = vscode.workspace.getConfiguration('codeflow');
        await config.update('cloudSync', true, vscode.ConfigurationTarget.Global);
        this.isEnabled = true;
        return true;
    }
}
exports.BackendServices = BackendServices;
class BackendServicesModule {
    context;
    authService;
    constructor(context) {
        this.context = context;
        this.authService = new AuthService(context);
    }
    getAuthService() {
        return this.authService;
    }
    dispose() {
        // Cleanup if needed
    }
}
exports.BackendServicesModule = BackendServicesModule;
class AuthService {
    context;
    constructor(context) {
        this.context = context;
    }
    async logout() {
        try {
            // Clear stored auth data
            await this.context.globalState.update('codeflow-authToken', undefined);
            await this.context.globalState.update('codeflow-userId', undefined);
            // Disable cloud sync
            const config = vscode.workspace.getConfiguration('codeflow');
            await config.update('cloudSync', false, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Successfully logged out from CodeFlow');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Logout failed: ${error}`);
        }
    }
    async upgradeToPro() {
        try {
            // Open localhost pro plan page in browser
            const uri = vscode.Uri.parse('http://localhost:3000/pro-plan');
            await vscode.env.openExternal(uri);
            vscode.window.showInformationMessage('Opening CodeFlow Pro plan in your browser...');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to open browser: ${error}`);
            console.error('Upgrade error:', error);
        }
    }
}
//# sourceMappingURL=backendServices.js.map