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
exports.DataCollector = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class DataCollector {
    context;
    activities = [];
    keystrokeCount = 0;
    startTime = Date.now();
    currentFile;
    statusBarItem;
    isEnabled = true;
    constructor(context) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = "$(pulse) CodeFlow: Active";
        this.statusBarItem.tooltip = "CodeFlow AI is tracking your coding activity";
        this.statusBarItem.show();
        this.initialize();
    }
    initialize() {
        // Check if tracking is enabled
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('enabled', true);
        // Register event listeners
        vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged, this);
        vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved, this);
        vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged, this);
        // Track commands
        vscode.commands.registerCommand('codeflow.toggleTracking', () => {
            this.isEnabled = !this.isEnabled;
            this.statusBarItem.text = this.isEnabled ? "$(pulse) CodeFlow: Active" : "$(circle-slash) CodeFlow: Paused";
            vscode.window.showInformationMessage(`CodeFlow tracking ${this.isEnabled ? 'enabled' : 'disabled'}`);
        });
        // Save data periodically
        setInterval(() => this.saveData(), 60000); // Save every minute
    }
    onActiveEditorChanged(editor) {
        if (!editor || !this.isEnabled)
            return;
        this.currentFile = editor.document.fileName;
        this.recordActivity({
            timestamp: Date.now(),
            file: this.currentFile,
            language: editor.document.languageId
        });
    }
    onDocumentSaved(document) {
        if (!this.isEnabled)
            return;
        this.recordActivity({
            timestamp: Date.now(),
            command: 'save',
            file: document.fileName,
            language: document.languageId
        });
    }
    onDocumentChanged(event) {
        if (!this.isEnabled)
            return;
        // Count keystrokes
        this.keystrokeCount += event.contentChanges.length;
        // Record keystroke activity every 10 keystrokes
        if (this.keystrokeCount >= 10) {
            this.recordActivity({
                timestamp: Date.now(),
                keystrokes: this.keystrokeCount,
                file: event.document.fileName,
                language: event.document.languageId
            });
            this.keystrokeCount = 0;
        }
    }
    recordActivity(activity) {
        this.activities.push(activity);
        // Keep only last 1000 activities in memory
        if (this.activities.length > 1000) {
            this.saveData();
            this.activities = this.activities.slice(-500);
        }
    }
    saveData() {
        if (this.activities.length === 0)
            return;
        const storagePath = this.context.globalStorageUri.fsPath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
        const today = new Date().toISOString().split('T')[0];
        const filePath = path.join(storagePath, `activity-${today}.json`);
        // Load existing data for today
        let existingData = [];
        if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        // Combine with new data
        const allData = [...existingData, ...this.activities];
        // Save to file
        fs.writeFileSync(filePath, JSON.stringify(allData));
        // Clear in-memory activities
        this.activities = [];
    }
    getActivities(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, `activity-${targetDate}.json`);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    dispose() {
        this.saveData();
        this.statusBarItem.dispose();
    }
}
exports.DataCollector = DataCollector;
//# sourceMappingURL=dataCollector.js.map