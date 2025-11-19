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
exports.ActivityTracker = void 0;
const vscode = __importStar(require("vscode"));
const dataStorage_1 = require("./dataStorage");
const types_1 = require("./types");
class ActivityTracker {
    storage;
    disposables = [];
    isEnabled = true;
    keystrokeBuffer = {}; // Buffer for keystrokes per file
    keystrokeTimer = null;
    statusBarItem;
    constructor(context) {
        this.storage = new dataStorage_1.DataStorage(context);
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = "$(pulse) CodeFlow: Active";
        this.statusBarItem.tooltip = "CodeFlow is tracking your coding activity";
        this.statusBarItem.show();
        this.initialize(context);
    }
    initialize(context) {
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('enabled', true);
        this.registerEventListeners();
        this.registerCommands();
        context.subscriptions.push(...this.disposables);
        this.startKeystrokeTimer();
    }
    registerEventListeners() {
        // Track text changes (keystrokes)
        this.disposables.push(vscode.workspace.onDidChangeTextDocument((event) => {
            if (!this.isEnabled)
                return;
            const document = event.document;
            if (document.isUntitled || document.getText().length > 1000000)
                return;
            const filePath = document.uri.fsPath;
            const language = document.languageId;
            let keystrokes = 0;
            for (const change of event.contentChanges) {
                keystrokes += change.text.length;
            }
            if (!this.keystrokeBuffer[filePath]) {
                this.keystrokeBuffer[filePath] = 0;
            }
            this.keystrokeBuffer[filePath] += keystrokes;
        }));
        // Track file saves
        this.disposables.push(vscode.workspace.onDidSaveTextDocument((document) => {
            if (!this.isEnabled)
                return;
            const filePath = document.uri.fsPath;
            const language = document.languageId;
            this.trackActivity({
                type: types_1.ActivityType.SAVE,
                data: { filePath, language }
            });
        }));
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (!this.isEnabled || !editor)
                return;
            const filePath = editor.document.uri.fsPath;
            const language = editor.document.languageId;
            this.trackActivity({
                type: types_1.ActivityType.SWITCH_FILE,
                data: { filePath, language }
            });
        }));
        // Track file openings
        this.disposables.push(vscode.workspace.onDidOpenTextDocument((document) => {
            if (!this.isEnabled)
                return;
            const filePath = document.uri.fsPath;
            const language = document.languageId;
            this.trackActivity({
                type: types_1.ActivityType.OPEN_FILE,
                data: { filePath, language }
            });
        }));
        // Track file closures
        this.disposables.push(vscode.workspace.onDidCloseTextDocument((document) => {
            if (!this.isEnabled)
                return;
            const filePath = document.uri.fsPath;
            const language = document.languageId;
            this.trackActivity({
                type: types_1.ActivityType.CLOSE_FILE,
                data: { filePath, language }
            });
        }));
        this.disposables.push(vscode.commands.onDidExecuteCommand((event) => {
            if (!this.isEnabled)
                return;
            if (event.command.startsWith('codeflow.'))
                return;
            this.trackActivity({
                type: types_1.ActivityType.COMMAND,
                data: { command: event.command }
            });
        }));
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('codeflow.toggleTracking', () => {
            this.isEnabled = !this.isEnabled;
            this.statusBarItem.text = this.isEnabled
                ? "$(pulse) CodeFlow: Active"
                : "$(circle-slash) CodeFlow: Paused";
            vscode.window.showInformationMessage(`CodeFlow tracking ${this.isEnabled ? 'enabled' : 'disabled'}`);
        }));
    }
    startKeystrokeTimer() {
        this.keystrokeTimer = setInterval(() => {
            this.processKeystrokeBuffer();
        }, 2000);
    }
    processKeystrokeBuffer() {
        for (const filePath in this.keystrokeBuffer) {
            const keystrokes = this.keystrokeBuffer[filePath];
            if (keystrokes > 0) {
                this.trackActivity({
                    type: types_1.ActivityType.KEYSTROKE,
                    data: { filePath, keystrokes }
                });
                this.keystrokeBuffer[filePath] = 0;
            }
        }
    }
    trackActivity(activity) {
        const fullActivity = {
            id: this.generateActivityId(),
            timestamp: Date.now(),
            ...activity
        };
        this.storage.addActivity(fullActivity);
    }
    generateActivityId() {
        return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    dispose() {
        this.storage.endCurrentSession();
        if (this.keystrokeTimer) {
            clearInterval(this.keystrokeTimer);
            this.keystrokeTimer = null;
        }
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.statusBarItem.dispose();
    }
}
exports.ActivityTracker = ActivityTracker;
//# sourceMappingURL=activityTracker.js.map