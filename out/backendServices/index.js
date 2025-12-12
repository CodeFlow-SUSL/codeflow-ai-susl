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
exports.BackendServicesModule = void 0;
const vscode = __importStar(require("vscode"));
const authService_1 = require("./authService");
const apiService_1 = require("./apiService");
const config_1 = require("./config");
class BackendServicesModule {
    authService;
    apiService;
    config;
    context;
    constructor(context) {
        this.context = context;
        this.config = config_1.ConfigManager.getInstance(context);
        this.authService = authService_1.AuthService.getInstance(context);
        this.apiService = apiService_1.ApiService.getInstance(context);
    }
    // Auth methods
    getAuthService() {
        return this.authService;
    }
    getApiService() {
        return this.apiService;
    }
    getConfig() {
        return this.config;
    }
    // Convenience methods
    getCurrentUser() {
        return this.authService.getCurrentUser();
    }
    isAuthenticated() {
        return this.authService.isAuthenticated();
    }
    isProUser() {
        return this.authService.isProUser();
    }
    onAuthStateChanged(callback) {
        return this.authService.onAuthStateChanged(callback);
    }
    // Pro plan check
    requireProPlan(featureName) {
        if (!this.isProUser()) {
            vscode.window.showInformationMessage(`${featureName} is a Pro plan feature. Please upgrade to Pro to access this feature.`, 'Upgrade to Pro').then(selection => {
                if (selection === 'Upgrade to Pro') {
                    vscode.commands.executeCommand('codeflow.upgradeToPro');
                }
            });
            return false;
        }
        return true;
    }
    // Dispose method
    dispose() {
        // Nothing to dispose for now
    }
}
exports.BackendServicesModule = BackendServicesModule;
//# sourceMappingURL=index.js.map