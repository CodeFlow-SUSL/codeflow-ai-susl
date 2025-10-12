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

    public show(insight: ProductivityInsight) {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
        } else {
            this._panel = vscode.window.createWebviewPanel(
                VisualizationPanel.viewType,
                'CodeFlow Report',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                        vscode.Uri.joinPath(this.context.extensionUri, 'node_modules')
                    ]
                }
            );

            this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, insight);
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview, insight: ProductivityInsight): string {
        const chartJsScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.min.js')
        );

        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'styles.css')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CodeFlow Report</title>
<link href="${styleUri}" rel="stylesheet">
</head>
<body>
<div class="container">
    <header>
        <h1>CodeFlow Weekly Report</h1>
        <div class="productivity-score">
            <div class="score-circle">
                <span class="score-value">${insight.productivityScore}</span>
                <span class="score-label">Productivity Score</span>
            </div>
        </div>
    </header>

    <section class="insights">
        <div class="insight-card">
            <h2>Language Distribution</h2>
            <div class="chart-container">
                <canvas id="languageChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="insight-card">
            <h2>Most Used Commands</h2>
            <div class="chart-container">
                <canvas id="commandChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="insight-card">
            <h2>Most Worked Files</h2>
            <div class="chart-container">
                <canvas id="fileChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="insight-card">
            <h2>Suggestions</h2>
            <div class="suggestions">
                <ul>
                    ${insight.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        </div>
    </section>

    <div class="badges-section">
        <h2>Earned Badges</h2>
        <div class="badges">
            <div class="badge ${insight.productivityScore > 70 ? 'earned' : ''}">
                <div class="badge-icon">🏆</div>
                <div class="badge-name">Productivity Master</div>
                <div class="badge-desc">Score above 70</div>
            </div>
            <div class="badge ${insight.languageDistribution.length > 3 ? 'earned' : ''}">
                <div class="badge-icon">🌐</div>
                <div class="badge-name">Polyglot</div>
                <div class="badge-desc">Work with 4+ languages</div>
            </div>
            <div class="badge ${insight.mostUsedCommands.length > 0 ? 'earned' : ''}">
                <div class="badge-icon">⌨</div>
                <div class="badge-name">Command Expert</div>
                <div class="badge-desc">Use diverse commands</div>
            </div>
        </div>
    </div>
</div>

<script nonce="${nonce}" src="${chartJsScriptUri}"></script>
<script nonce="${nonce}">
const languageData = ${JSON.stringify(insight.languageDistribution)};
const commandData = ${JSON.stringify(insight.mostUsedCommands)};
const fileData = ${JSON.stringify(insight.mostWorkedFiles)};

// Language Distribution Chart
const languageCtx = document.getElementById('languageChart').getContext('2d');
new Chart(languageCtx, {
    type: 'pie',
    data: {
        labels: languageData.map(item => item.language),
        datasets: [{
            data: languageData.map(item => item.percentage),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'right' }
        }
    }
});

// Commands Chart
const commandCtx = document.getElementById('commandChart').getContext('2d');
new Chart(commandCtx, {
    type: 'bar',
    data: {
        labels: commandData.map(item => item.command),
        datasets: [{ label: 'Usage Count', data: commandData.map(item => item.count), backgroundColor: '#36A2EB' }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
    }
});

// Files Chart
const fileCtx = document.getElementById('fileChart').getContext('2d');
new Chart(fileCtx, {
    type: 'bar',
    data: {
        labels: fileData.map(item => item.file.split('/').pop()),
        datasets: [{ label: 'Time Spent', data: fileData.map(item => item.time), backgroundColor: '#4BC0C0' }]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        scales: { x: { beginAtZero: true } }
    }
});
</script>
</body>
</html>`;
    }

    public dispose() {
        this._panel?.dispose();
        this._panel = undefined;

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) { x.dispose(); }
        }
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
