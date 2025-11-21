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
exports.VisualizationPanel = void 0;
const vscode = __importStar(require("vscode"));
class VisualizationPanel {
    static viewType = 'codeflow.report';
    _panel;
    _disposables = [];
    context;
    _refreshCallback;
    constructor(context) {
        this.context = context;
    }
    setRefreshCallback(callback) {
        this._refreshCallback = callback;
    }
    show(insight) {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, insight);
        }
        else {
            this._panel = vscode.window.createWebviewPanel(VisualizationPanel.viewType, 'CodeFlow Report', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                    vscode.Uri.joinPath(this.context.extensionUri, 'node_modules'),
                    vscode.Uri.joinPath(this.context.extensionUri, 'icon')
                ]
            });
            this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, insight);
            // Set up message handler
            this._panel.webview.onDidReceiveMessage(async (message) => {
                if (message?.type === 'upgrade') {
                    vscode.commands.executeCommand('codeflow.upgradeToPro');
                }
                else if (message?.type === 'refresh') {
                    // Call the refresh callback to reload fresh data
                    if (this._refreshCallback) {
                        await this._refreshCallback();
                    }
                }
            }, undefined, this._disposables);
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        }
    }
    _getHtmlForWebview(webview, insight) {
        const chartJsScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'styles.css'));
        const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'icon', '2.png'));
        const nonce = getNonce();
        const formatHours = (value) => {
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline'; img-src ${webview.cspSource} data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeFlow Report</title>
    <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
    <button class="refresh-toggle" onclick="refreshDashboard()" aria-label="Refresh dashboard">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0.01 3.58 0.01 8C0.01 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" fill="#0066cc"/>
                </svg>
    </button>
    <div class="container">
        <header class="dashboard-header">
        <div class="header-content" style="position: relative;">
            <button class="btn export-btn" onclick="exportReport()" style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); z-index: 10;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor"/>
                </svg>
                Export Report
            </button>
            <div class="header-logo-bg" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; pointer-events: none; z-index: 0;">
                <img src="${logoUri}" alt="" style="width: 280px; height: 280px; object-fit: contain;">
            </div>
            <div class="header-copy" style="position: relative; z-index: 1;">
                <span class="eyebrow" id="datetime">🩷 ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}</span>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${logoUri}" alt="CodeFlow AI Logo" style="width: 40px; height: 40px; object-fit: contain; border: 1px solid #7999ddff; padding: 6px; border-radius: 8px; background: #f8fafc;">
                    <h1 style="animation: colorPulse 3s ease-in-out infinite;">CodeFlow AI</h1>
                </div>
                <p style="font-size: 16px; color: #64748b; margin: 12px 0; line-height: 1.6; font-weight: 400;">Your recent <span style="font-weight: 700; color: #0066cc;">Coding Rhythm</span>, intelligently summarized.</p>
                <div class="header-meta">
                <span class="meta-pill">Top language: ${topLanguage}</span>
                <span class="meta-pill">Active window: ${activeRangeLabel}</span>
                </div>
            </div>
            <div class="header-actions" style="position: relative; z-index: 1;">
                <div class="score-card" style="min-width: 320px; padding: 24px;">
                <div class="score-ring">
                    <span class="score-value">${insight.productivityScore}</span>
                </div>
                <div class="score-details">
                    <span class="score-label">Productivity Score</span>
                    <span class="score-sub">${totalCodingHours}h logged</span>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #64748b;">Streak</span>
                            <span style="font-size: 12px; font-weight: 600; color: #0066cc;">${streakLabel}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #64748b;">Languages</span>
                            <span style="font-size: 12px; font-weight: 600; color: #0066cc;">${insight.uniqueLanguages}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #64748b;">Avg/Day</span>
                            <span style="font-size: 12px; font-weight: 600; color: #0066cc;">${averageDailyHours}h</span>
                        </div>
                    </div>
                </div>
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

    // Update time continuously
    function updateDateTime() {
        const dateTimeElement = document.getElementById('datetime');
        if (dateTimeElement) {
            const now = new Date();
            dateTimeElement.textContent = ' 🩷 ' + now.toLocaleDateString() + ' | ' + now.toLocaleTimeString();
        }
    }
    setInterval(updateDateTime, 1000);

    // Chart color schemes
    const gradientColors = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
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
    dailyGradient.addColorStop(0, 'rgba(37, 99, 235, 0.6)');
    dailyGradient.addColorStop(1, 'rgba(30, 58, 138, 0.1)');

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
            borderColor: '#2563eb',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#2563eb',
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
    commandGradient.addColorStop(0, 'rgba(37, 99, 235, 0.8)');
    commandGradient.addColorStop(1, 'rgba(30, 58, 138, 0.8)');
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
    fileGradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
    fileGradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');

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
    formatActiveHourRange(range) {
        if (range.earliest === null || range.latest === null) {
            return 'No data yet';
        }
        const clampHour = (value) => Math.min(23, Math.max(0, value));
        const formatHour = (hour) => {
            const date = new Date();
            date.setHours(clampHour(hour), 0, 0, 0);
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        };
        return `${formatHour(range.earliest)} – ${formatHour(range.latest)}`;
    }
    buildAchievementsHtml(insight) {
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
    buildAiInsightsHtml(insight) {
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
    buildPremiumFeaturesHtml() {
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
    dispose() {
        this._panel?.dispose();
        this._panel = undefined;
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.VisualizationPanel = VisualizationPanel;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=visualization.js.map