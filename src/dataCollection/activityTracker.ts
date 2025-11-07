import * as vscode from 'vscode';
import { DataStorage } from './dataStorage';
import { CodingActivity, ActivityType, ActivityData } from './types';

export class ActivityTracker {
    private storage: DataStorage;
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;
    private keystrokeBuffer: { [key: string]: number } = {}; // Buffer for keystrokes per file
    private keystrokeTimer: NodeJS.Timeout | null = null;
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.storage = new DataStorage(context);
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = "$(pulse) CodeFlow: Active";
        this.statusBarItem.tooltip = "CodeFlow is tracking your coding activity";
        this.statusBarItem.show();
        this.initialize(context);
    }

    private initialize(context: vscode.ExtensionContext): void {
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('enabled', true);
        this.registerEventListeners();
        this.registerCommands();
        context.subscriptions.push(...this.disposables);
        this.startKeystrokeTimer();
    }

    private registerEventListeners(): void {
        // Track text changes (keystrokes)
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                if (!this.isEnabled) return;
                const document = event.document;
                if (document.isUntitled || document.getText().length > 1000000) return;
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
            })
        );

        // Track file saves
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument((document) => {
                if (!this.isEnabled) return;
                const filePath = document.uri.fsPath;
                const language = document.languageId;
                this.trackActivity({
                    type: ActivityType.SAVE,
                    data: { filePath, language }
                });
            })
        );

         this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor((editor) => {
                if (!this.isEnabled || !editor) return;
                const filePath = editor.document.uri.fsPath;
                const language = editor.document.languageId;
                this.trackActivity({
                    type: ActivityType.SWITCH_FILE,
                    data: { filePath, language }
                });
            })
        );

        // Track file openings
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument((document) => {
                if (!this.isEnabled) return;
                const filePath = document.uri.fsPath;
                const language = document.languageId;
                this.trackActivity({
                    type: ActivityType.OPEN_FILE,
                    data: { filePath, language }
                });
            })
        );

        // Track file closures
        this.disposables.push(
            vscode.workspace.onDidCloseTextDocument((document) => {
                if (!this.isEnabled) return;
                const filePath = document.uri.fsPath;
                const language = document.languageId;
                this.trackActivity({
                    type: ActivityType.CLOSE_FILE,
                    data: { filePath, language }
                });
            })
        );
           this.disposables.push(
            vscode.commands.onDidExecuteCommand((event) => {
                if (!this.isEnabled) return;
                if (event.command.startsWith('codeflow.')) return;
                this.trackActivity({
                    type: ActivityType.COMMAND,
                    data: { command: event.command }
                });
            })
        );
    }
 private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand('codeflow.toggleTracking', () => {
                this.isEnabled = !this.isEnabled;
                this.statusBarItem.text = this.isEnabled
                    ? "$(pulse) CodeFlow: Active"
                    : "$(circle-slash) CodeFlow: Paused";
                vscode.window.showInformationMessage(
                    `CodeFlow tracking ${this.isEnabled ? 'enabled' : 'disabled'}`
                );
            })
        );
    }
    private startKeystrokeTimer(): void {
        this.keystrokeTimer = setInterval(() => {
            this.processKeystrokeBuffer();
        }, 2000);
    }

    private processKeystrokeBuffer(): void {
        for (const filePath in this.keystrokeBuffer) {
            const keystrokes = this.keystrokeBuffer[filePath];
            if (keystrokes > 0) {
                this.trackActivity({
                    type: ActivityType.KEYSTROKE,
                    data: { filePath, keystrokes }
                });
                this.keystrokeBuffer[filePath] = 0;
            }
        }
    }
private trackActivity(activity: Omit<CodingActivity, 'id' | 'timestamp'>): void {
        const fullActivity: CodingActivity = {
            id: this.generateActivityId(),
            timestamp: Date.now(),
            ...activity
        };
        this.storage.addActivity(fullActivity);
    }

    private generateActivityId(): string {
        return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
 public dispose(): void {
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