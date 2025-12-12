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
exports.AuthService = void 0;
const vscode = __importStar(require("vscode"));
const config_1 = require("./config");
// Mock Firebase Auth for demonstration
// In a real implementation, you would use the Firebase SDK
class AuthService {
    static instance;
    authState = {
        user: null,
        isLoading: false,
        error: null
    };
    config;
    stateChangeCallbacks = [];
    constructor(context) {
        this.config = config_1.ConfigManager.getInstance(context);
        this.loadUserFromStorage();
    }
    static getInstance(context) {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService(context);
        }
        return AuthService.instance;
    }
    loadUserFromStorage() {
        const context = this.config['context'];
        const userJson = context.globalState.get('codeflow.user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                this.authState.user = user;
            }
            catch (error) {
                console.error('Error loading user from storage:', error);
            }
        }
    }
    saveUserToStorage(user) {
        const context = this.config['context'];
        if (user) {
            context.globalState.update('codeflow.user', JSON.stringify(user));
        }
        else {
            context.globalState.update('codeflow.user', undefined);
        }
    }
    updateAuthState(newState) {
        this.authState = { ...this.authState, ...newState };
        this.notifyStateChange();
    }
    notifyStateChange() {
        this.stateChangeCallbacks.forEach(callback => callback(this.authState));
    }
    onAuthStateChanged(callback) {
        this.stateChangeCallbacks.push(callback);
        // Return unsubscribe function
        return () => {
            const index = this.stateChangeCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateChangeCallbacks.splice(index, 1);
            }
        };
    }
    getCurrentUser() {
        return this.authState.user;
    }
    isAuthenticated() {
        return !!this.authState.user;
    }
    isProUser() {
        return this.authState.user?.plan === 'pro';
    }
    async login(credentials) {
        this.updateAuthState({ isLoading: true, error: null });
        try {
            // In a real implementation, you would use Firebase Auth SDK
            // const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (credentials.email === 'user@example.com' && credentials.password === 'password') {
                const user = {
                    id: 'user123',
                    email: credentials.email,
                    displayName: 'Demo User',
                    plan: 'pro',
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                };
                this.updateAuthState({ user, isLoading: false });
                this.saveUserToStorage(user);
                vscode.window.showInformationMessage(`Welcome back, ${user.displayName || user.email}!`);
                return true;
            }
            else {
                throw new Error('Invalid email or password');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            this.updateAuthState({ isLoading: false, error: errorMessage });
            vscode.window.showErrorMessage(errorMessage);
            return false;
        }
    }
    async signUp(credentials) {
        this.updateAuthState({ isLoading: true, error: null });
        try {
            // In a real implementation, you would use Firebase Auth SDK
            // const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            const user = {
                id: 'user' + Math.floor(Math.random() * 1000),
                email: credentials.email,
                displayName: credentials.displayName || credentials.email.split('@')[0],
                plan: 'free',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };
            this.updateAuthState({ user, isLoading: false });
            this.saveUserToStorage(user);
            vscode.window.showInformationMessage(`Account created successfully! Welcome, ${user.displayName || user.email}!`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
            this.updateAuthState({ isLoading: false, error: errorMessage });
            vscode.window.showErrorMessage(errorMessage);
            return false;
        }
    }
    async logout() {
        try {
            // In a real implementation, you would use Firebase Auth SDK
            // await signOut(auth);
            this.updateAuthState({ user: null, isLoading: false, error: null });
            this.saveUserToStorage(null);
            vscode.window.showInformationMessage('You have been logged out successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            vscode.window.showErrorMessage(errorMessage);
        }
    }
    async upgradeToPro() {
        if (!this.isAuthenticated()) {
            vscode.window.showErrorMessage('You must be logged in to upgrade to Pro plan');
            return false;
        }
        if (this.isProUser()) {
            vscode.window.showInformationMessage('You already have the Pro plan');
            return true;
        }
        try {
            // Open the pricing/pro plan page in the default browser
            const proPageUrl = 'https://codeflow-ai.com/pricing';
            await vscode.env.openExternal(vscode.Uri.parse(proPageUrl));
            vscode.window.showInformationMessage('Opening CodeFlow Pro pricing page in your browser...');
            // Optional: Show a message with options after opening the browser
            const selection = await vscode.window.showInformationMessage('Check your browser for CodeFlow Pro plans. After completing your purchase, click "I\'ve Upgraded" to sync your account.', 'I\'ve Upgraded', 'Cancel');
            if (selection === 'I\'ve Upgraded') {
                // In a real implementation, you would verify the upgrade with your backend
                // For now, we'll simulate the verification
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (this.authState.user) {
                    this.authState.user.plan = 'pro';
                    this.updateAuthState({ user: { ...this.authState.user } });
                    this.saveUserToStorage(this.authState.user);
                    vscode.window.showInformationMessage('Successfully upgraded to Pro plan! 🎉');
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to open upgrade page';
            vscode.window.showErrorMessage(errorMessage);
            return false;
        }
    }
    getAuthState() {
        return { ...this.authState };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map