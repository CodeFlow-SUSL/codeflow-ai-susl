import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface CodingActivity {
    timestamp: number;
    command?: string;
    keystrokes?: number;
    file?: string;
    language?: string;
}

export class DataCollector {
    private context: vscode.ExtensionContext;
    private activities: CodingActivity[] = [];
    private keystrokeCount: number = 0;
    private startTime: number = Date.now();
    private currentFile: string | undefined;
    private statusBarItem: vscode.StatusBarItem;
    private isEnabled: boolean = true;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = "$(pulse) CodeFlow: Active";
        this.statusBarItem.tooltip = "CodeFlow AI is tracking your coding activity";
        this.statusBarItem.show();
        
        this.initialize();
    }

    private initialize() {
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

    private onActiveEditorChanged(editor: vscode.TextEditor | undefined) {
        if (!editor || !this.isEnabled) return;
        
        this.currentFile = editor.document.fileName;
        this.recordActivity({
            timestamp: Date.now(),
            file: this.currentFile,
            language: editor.document.languageId
        });
    }

    private onDocumentSaved(document: vscode.TextDocument) {
        if (!this.isEnabled) return;
        
        this.recordActivity({
            timestamp: Date.now(),
            command: 'save',
            file: document.fileName,
            language: document.languageId
        });
    }

    private onDocumentChanged(event: vscode.TextDocumentChangeEvent) {
        if (!this.isEnabled) return;
        
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

    private recordActivity(activity: CodingActivity) {
        this.activities.push(activity);
        
        // Keep only last 1000 activities in memory
        if (this.activities.length > 1000) {
            this.saveData();
            this.activities = this.activities.slice(-500);
        }
    }

    private saveData() {
        if (this.activities.length === 0) return;
        
        const storagePath = this.context.globalStorageUri.fsPath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const filePath = path.join(storagePath, `activity-${today}.json`);
        
        // Load existing data for today
        let existingData: CodingActivity[] = [];
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

    public getActivities(date?: string): CodingActivity[] {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, `activity-${targetDate}.json`);
        
        if (!fs.existsSync(filePath)) {
            return [];
        }
        
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    public dispose() {
        this.saveData();
        this.statusBarItem.dispose();
    }
}