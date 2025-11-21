import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProductivityInsight } from './aiAnalyzer';

export class VisualizationPanel {
    private static readonly viewType = 'codeflow.report';
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    private context: vscode.ExtensionContext;
    private _refreshCallback: (() => Promise<void>) | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public setRefreshCallback(callback: () => Promise<void>) {
        this._refreshCallback = callback;
    }

    public show(insight: ProductivityInsight) {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, insight);
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
            
            // Set up message handler
            this._panel.webview.onDidReceiveMessage(async (message) => {
                if (message?.type === 'upgrade') {
                    vscode.commands.executeCommand('codeflow.upgradeToPro');
                } else if (message?.type === 'refresh') {
                    // Call the refresh callback to reload fresh data
                    if (this._refreshCallback) {
                        await this._refreshCallback();
                    }
                }
            }, undefined, this._disposables);
            
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview, insight: ProductivityInsight): string {
        const chartJsScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.umd.js')
        );

        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'styles.css')
        );

        const nonce = getNonce();

        const formatHours = (value: number) => {
            const rounded = Math.round(value * 10) / 10;
            return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
        };

        const totalCodingHours = formatHours(insight.totalActiveMinutes / 60);
        const averageDailyHours = insight.dailyCodingMinutes.length > 0
            ? formatHours(insight.totalActiveMinutes / insight.dailyCodingMinutes.length / 60)
            : '0';
        const topLanguage = insight.languageDistribution[0]?.language ?? '—';
        const streakLabel = insight.streakDays > 0
            ? `${insight.streakDays} day${insight.streakDays === 1 ? '' : 's'}`
            : 'No streak yet';
        const activeRangeLabel = this.formatActiveHourRange(insight.activeHourRange);
        const languagesChip = insight.uniqueLanguages === 0
            ? 'No languages yet'
            : insight.uniqueLanguages === 1
                ? '1 language'
                : `${insight.uniqueLanguages} languages`;
        const totalCommandsFormatted = insight.totalCommandsExecuted.toLocaleString();
        const totalKeystrokesFormatted = insight.totalKeystrokes.toLocaleString();
        const uniqueFilesFormatted = insight.uniqueFilesWorked.toLocaleString();
        const achievementsHtml = this.buildAchievementsHtml(insight);
        const aiInsightsHtml = this.buildAiInsightsHtml(insight);
        const premiumFeaturesHtml = this.buildPremiumFeaturesHtml();

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
    <header class="dashboard-header">
        <div class="header-copy">
            <span class="eyebrow">CodeFlow AI</span>
            <h1>Productivity Dashboard</h1>
            <p>Your recent coding rhythm, intelligently summarized.</p>
            <div class="header-meta">
                <span class="meta-pill">Top language: ${topLanguage}</span>
                <span class="meta-pill">Active window: ${activeRangeLabel}</span>
            </div>
        </div>
        <div class="header-actions">
            <button class="btn refresh-btn" onclick="refreshDashboard()">🔄 Refresh</button>
            <button class="btn export-btn" onclick="exportReport()">📥 Export JSON</button>
            <div class="score-card">
                <div class="score-ring">
                    <span class="score-value">${insight.productivityScore}</span>
                </div>
                <div class="score-details">
                    <span class="score-label">Productivity score</span>
                    <span class="score-sub">${totalCodingHours}h logged</span>
                </div>
            </div>
        </div>
    </header>

    <section class="metric-grid">
        <article class="metric-card">
            <span class="metric-icon">⏱️</span>
            <div>
                <h3>${totalCodingHours}h</h3>
                <p>Total coding time</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">📊</span>
            <div>
                <h3>${averageDailyHours}h</h3>
                <p>Average per day</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">⌨️</span>
            <div>
                <h3>${totalCommandsFormatted}</h3>
                <p>Commands executed</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">🔥</span>
            <div>
                <h3>${streakLabel}</h3>
                <p>Current streak</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">👆</span>
            <div>
                <h3>${totalKeystrokesFormatted}</h3>
                <p>Keystrokes tracked</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">📁</span>
            <div>
                <h3>${uniqueFilesFormatted}</h3>
                <p>Files touched</p>
            </div>
        </article>
    </section>

    <section class="chart-grid">
        <article class="insight-card chart-card">
            <div class="card-head">
                <h2>📆 Daily Coding Hours</h2>
                <span class="chip">Avg ${averageDailyHours}h/day</span>
            </div>
            <div class="chart-container large">
                <canvas id="dailyChart"></canvas>
            </div>
        </article>

        <article class="insight-card chart-card">
            <div class="card-head">
                <h2>🌐 Language Distribution</h2>
                <span class="chip">${languagesChip}</span>
            </div>
            <div class="chart-container">
                <canvas id="languageChart"></canvas>
            </div>
        </article>

        <article class="insight-card chart-card">
            <div class="card-head">
                <h2>⌨️ Most Used Commands</h2>
                <span class="chip">${insight.mostUsedCommands.length} favourites</span>
            </div>
            <div class="chart-container">
                <canvas id="commandChart"></canvas>
            </div>
        </article>

        <article class="insight-card chart-card">
            <div class="card-head">
                <h2>📁 Most Worked Files</h2>
                <span class="chip">${insight.uniqueFilesWorked} files</span>
            </div>
            <div class="chart-container">
                <canvas id="fileChart"></canvas>
            </div>
        </article>
    </section>

    <section class="deep-dive">
        <article class="insight-card ai-card">
            <div class="card-head">
                <h2>🤖 AI-Powered Insights</h2>
                <span class="chip">Smart suggestions</span>
            </div>
            ${aiInsightsHtml}
        </article>

        <article class="insight-card badge-card">
            <div class="card-head">
                <h2>🏆 Achievement Badges</h2>
                <span class="chip">Track your highlights</span>
            </div>
            <div class="badges">
                ${achievementsHtml}
            </div>
        </article>

        <article class="insight-card premium-card">
            <div class="card-head">
                <h2>💎 Premium Features</h2>
                <span class="chip">Unlock more flow</span>
            </div>
            <div class="premium-grid">
                ${premiumFeaturesHtml}
            </div>
            <button class="btn upgrade-btn" onclick="requestUpgrade()">Upgrade to CodeFlow Pro</button>
        </article>
    </section>
</div>

<script nonce="${nonce}" src="${chartJsScriptUri}"></script>
<script nonce="${nonce}">
const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : { postMessage: () => {} };
const dailyCoding = ${JSON.stringify(insight.dailyCodingMinutes)};
const languageData = ${JSON.stringify(insight.languageDistribution)};
const commandData = ${JSON.stringify(insight.mostUsedCommands)};
const fileData = ${JSON.stringify(insight.mostWorkedFiles)};

// Chart color schemes
const gradientColors = ['#0066cc', '#3399ff', '#0099ff', '#00ccff', '#0052cc', '#66b3ff', '#3385ff'];
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            position: 'bottom',
            labels: {
                padding: 15,
                font: { size: 12 }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
        }
    }
};

// Daily Coding Hours (Line)
const dailyCtx = document.getElementById('dailyChart').getContext('2d');
const dailyGradient = dailyCtx.createLinearGradient(0, 0, 0, 400);
dailyGradient.addColorStop(0, 'rgba(0, 102, 204, 0.6)');
dailyGradient.addColorStop(1, 'rgba(51, 153, 255, 0.1)');

const dailyLabels = dailyCoding.map(item => formatDayLabel(item.date));
const dailyHours = dailyCoding.map(item => Number((item.minutes / 60).toFixed(2)));

new Chart(dailyCtx, {
    type: 'line',
    data: {
        labels: dailyLabels,
        datasets: [{
            label: 'Hours coded',
            data: dailyHours,
            backgroundColor: dailyGradient,
            borderColor: '#0066cc',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#0066cc',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    },
    options: {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 11 } },
                title: { display: true, text: 'Hours', font: { size: 12 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { display: false }
            }
        }
    }
});

// Language Distribution Chart (Doughnut)
const languageCtx = document.getElementById('languageChart').getContext('2d');
new Chart(languageCtx, {
    type: 'doughnut',
    data: {
        labels: languageData.map(item => item.language),
        datasets: [{
            data: languageData.map(item => item.percentage),
            backgroundColor: gradientColors,
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 10
        }]
    },
    options: {
        ...chartOptions,
        cutout: '60%',
        plugins: {
            ...chartOptions.plugins,
            legend: { position: 'right' }
        }
    }
});

// Commands Chart (Bar with gradient)
const commandCtx = document.getElementById('commandChart').getContext('2d');
const commandGradient = commandCtx.createLinearGradient(0, 0, 0, 400);
commandGradient.addColorStop(0, 'rgba(0, 102, 204, 0.8)');
commandGradient.addColorStop(1, 'rgba(51, 153, 255, 0.8)');
new Chart(commandCtx, {
    type: 'bar',
    data: {
        labels: commandData.map(item => item.command),
        datasets: [{
            label: 'Usage Count',
            data: commandData.map(item => item.count),
            backgroundColor: commandGradient,
            borderRadius: 8,
            borderSkipped: false
        }]
    },
    options: {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { display: false }
            }
        }
    }
});

// Files Chart (Horizontal Bar)
const fileCtx = document.getElementById('fileChart').getContext('2d');
const fileGradient = fileCtx.createLinearGradient(0, 0, 400, 0);
fileGradient.addColorStop(0, 'rgba(0, 153, 255, 0.8)');
fileGradient.addColorStop(1, 'rgba(51, 204, 255, 0.8)');

new Chart(fileCtx, {
    type: 'bar',
    data: {
        labels: fileData.map(item => item.file.split('/').pop() || item.file),
        datasets: [{
            label: 'Time Spent (minutes)',
            data: fileData.map(item => item.time),
            backgroundColor: fileGradient,
            borderRadius: 8,
            borderSkipped: false
        }]
    },
    options: {
        ...chartOptions,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            y: {
                ticks: { font: { size: 10 } },
                grid: { display: false }
            }
        }
    }
});

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function exportReport() {
    const reportData = {
        productivityScore: ${insight.productivityScore},
        languages: languageData,
        commands: commandData,
        files: fileData,
        dailyCoding: dailyCoding,
        generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'codeflow-report-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
}

function refreshDashboard() {
    vscodeApi.postMessage({ type: 'refresh' });
}

// Load theme preference
window.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

function formatDayLabel(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) {
        return dateStr;
    }
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function requestUpgrade() {
    vscodeApi.postMessage({ type: 'upgrade' });
}

</script>
</body>
</html>`;
    }

    private formatActiveHourRange(range: { earliest: number | null; latest: number | null }): string {
        if (range.earliest === null || range.latest === null) {
            return 'No data yet';
        }

        const clampHour = (value: number) => Math.min(23, Math.max(0, value));
        const formatHour = (hour: number) => {
            const date = new Date();
            date.setHours(clampHour(hour), 0, 0, 0);
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        };

        return `${formatHour(range.earliest)} – ${formatHour(range.latest)}`;
    }

    private buildAchievementsHtml(insight: ProductivityInsight): string {
        const achievements = [
            {
                icon: '🌐',
                name: 'Polyglot',
                description: 'Worked across 3+ languages',
                earned: insight.uniqueLanguages >= 3
            },
            {
                icon: '🦉',
                name: 'Night Owl',
                description: 'Coding after 10pm',
                earned: (insight.activeHourRange.latest ?? -1) >= 22
            },
            {
                icon: '🐦',
                name: 'Early Bird',
                description: 'Started before 8am',
                earned: (insight.activeHourRange.earliest ?? 24) <= 7
            },
            {
                icon: '🔥',
                name: 'Persistence',
                description: '5+ day active streak',
                earned: insight.streakDays >= 5
            },
            {
                icon: '⌨️',
                name: 'Command Master',
                description: '150+ commands executed',
                earned: insight.totalCommandsExecuted >= 150
            },
            {
                icon: '👆',
                name: 'Keystroke Hero',
                description: 'Logged 500+ keystrokes',
                earned: insight.totalKeystrokes >= 500
            },
            {
                icon: '📁',
                name: 'File Jumper',
                description: '40+ file switches',
                earned: insight.fileSwitchCount >= 40
            }
        ];

        return achievements.map(achievement => `
            <div class="badge ${achievement.earned ? 'earned' : ''}">
                <div class="badge-icon">${achievement.icon}</div>
                <div class="badge-name">${achievement.name}</div>
                <div class="badge-desc">${achievement.description}</div>
            </div>
        `).join('');
    }

    private buildAiInsightsHtml(insight: ProductivityInsight): string {
        const suggestionItems = (insight.suggestions && insight.suggestions.length > 0)
            ? insight.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')
            : '<li>Keep coding to unlock personalized AI suggestions.</li>';

        let tfHighlights = '';
        if (insight.tfInsights?.featureImportance) {
            const topFeatures = Object.entries(insight.tfInsights.featureImportance)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([feature, weight]) => {
                    const impact = Math.round(weight * 100);
                    return `
                        <div class="tf-feature">
                            <span class="tf-feature-name">${feature}</span>
                            <span class="tf-feature-weight">${impact}%</span>
                        </div>
                    `;
                })
                .join('');

            if (topFeatures) {
                tfHighlights = `
                    <div class="tf-highlights">
                        <h3>Model Highlights</h3>
                        <div class="tf-feature-grid">
                            ${topFeatures}
                        </div>
                    </div>
                `;
            }
        }

        return `
            <ul class="insight-list">
                ${suggestionItems}
            </ul>
            ${tfHighlights}
        `;
    }

    private buildPremiumFeaturesHtml(): string {
        const premiumFeatures = [
            {
                icon: '🧠',
                title: 'Adaptive Focus Coach',
                description: 'Get in-IDE nudges tailored to your current energy and momentum.'
            },
            {
                icon: '📈',
                title: 'Trend Radar',
                description: 'See multi-week performance trends with predictive AI forecasting.'
            },
            {
                icon: '🤝',
                title: 'Team Pulse',
                description: 'Share anonymized benchmarks and celebrate wins with your crew.'
            },
            {
                icon: '🔔',
                title: 'Smart Nudges',
                description: 'Receive reminders when goals slip or streaks are at risk.'
            }
        ];

        return premiumFeatures.map(feature => `
            <div class="premium-feature">
                <div class="premium-icon">${feature.icon}</div>
                <div class="premium-copy">
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            </div>
        `).join('');
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
