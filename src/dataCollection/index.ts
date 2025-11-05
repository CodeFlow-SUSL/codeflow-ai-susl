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