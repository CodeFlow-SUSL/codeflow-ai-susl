import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProductivityInsight } from './aiAnalyzer';

export class VisualizationPanel {
    private static readonly viewType = 'codeflow.report';
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }
}
