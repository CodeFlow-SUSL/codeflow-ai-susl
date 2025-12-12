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
                        vscode.Uri.joinPath(this.context.extensionUri, 'node_modules'),
                        vscode.Uri.joinPath(this.context.extensionUri, 'icon')
                    ]
                }
            );

            // Set the panel icon
            this._panel.iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'icon', '2.png');

            this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, insight);
            
            // Set up message handler
            this._panel.webview.onDidReceiveMessage(async (message) => {
                console.log('Webview message received:', message);
                if (message?.type === 'upgrade') {
                    console.log('Executing upgrade command...');
                    await vscode.commands.executeCommand('codeflow.upgradeToPro');
                } else if (message?.type === 'refresh') {
                    console.log('Executing refresh...');
                    // Call the refresh callback to reload fresh data
                    if (this._refreshCallback) {
                        await this._refreshCallback();
                    }
                } else if (message?.type === 'setGoal') {
                    console.log('Setting focus goal:', message.goal);
                    await this.context.globalState.update('focusGoal', message.goal);
                    vscode.window.showInformationMessage(`Focus goal set to ${message.goal} hours per day!`);
                } else if (message?.type === 'scheduleBreak') {
                    console.log('Scheduling break reminder:', message.minutes);
                    const breakTime = message.minutes * 60 * 1000; // Convert to milliseconds
                    setTimeout(() => {
                        vscode.window.showInformationMessage('⏰ Time for a break! Step away from your screen for a few minutes.', 'Got it')
                            .then(selection => {
                                if (selection === 'Got it') {
                                    console.log('Break reminder acknowledged');
                                }
                            });
                    }, breakTime);
                    vscode.window.showInformationMessage(`Break reminder scheduled for ${message.minutes} minutes from now.`);
                }
            }, undefined, this._disposables);
            
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview, insight: ProductivityInsight): string {
        const chartJsScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.umd.js')
        );

        const jsPdfScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'jspdf', 'dist', 'jspdf.umd.min.js')
        );

        const html2canvasScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'html2canvas', 'dist', 'html2canvas.min.js')
        );

        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'styles.css')
        );

        const logoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'icon', '2.png')
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data:;">
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
    <script nonce="${nonce}" src="${jsPdfScriptUri}"></script>
    <script nonce="${nonce}" src="${html2canvasScriptUri}"></script>
    <script nonce="${nonce}">
    console.log('Scripts loading...');
    console.log('Chart.js available:', typeof Chart);
    console.log('jsPDF available:', typeof window.jspdf);
    console.log('html2canvas available:', typeof html2canvas);
    
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

    // Initialize charts when Chart.js is loaded
    function initializeCharts() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, retrying...');
            setTimeout(initializeCharts, 100);
            return;
        }

        console.log('Initializing charts...');

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

        console.log('Charts initialized successfully');
    }

    // Start chart initialization
    initializeCharts();

    function showExportModal() {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;';
        
        // Create modal card
        const modal = document.createElement('div');
        modal.style.cssText = 'background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); animation: slideUp 0.3s ease;';
        
        modal.innerHTML = \`
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .export-modal-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 12px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .export-modal-desc {
                    color: #64748b;
                    margin: 0 0 24px 0;
                    line-height: 1.6;
                }
                .export-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .export-option {
                    padding: 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .export-option:hover {
                    border-color: #0066cc;
                    background: #f0f7ff;
                    transform: translateY(-2px);
                }
                .export-option-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                .export-option-content {
                    flex: 1;
                }
                .export-option-title {
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }
                .export-option-desc {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                }
                .export-modal-footer {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .export-modal-btn {
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .export-modal-btn-cancel {
                    background: #f1f5f9;
                    color: #475569;
                }
                .export-modal-btn-cancel:hover {
                    background: #e2e8f0;
                }
            </style>
            <h2 class="export-modal-title">
                <span>📊</span>
                Export Your Report
            </h2>
            <p class="export-modal-desc">
                Choose how you'd like to download your CodeFlow productivity report.
            </p>
            <div class="export-options">
                <div class="export-option" onclick="downloadPDF()">
                    <span class="export-option-icon">📄</span>
                    <div class="export-option-content">
                        <h3 class="export-option-title">PDF Report</h3>
                        <p class="export-option-desc">Professional formatted report with all metrics and insights</p>
                    </div>
                </div>
                <div class="export-option" onclick="downloadJSON()">
                    <span class="export-option-icon">💾</span>
                    <div class="export-option-content">
                        <h3 class="export-option-title">JSON Data</h3>
                        <p class="export-option-desc">Raw data export for further analysis or integration</p>
                    </div>
                </div>
                <div class="export-option" onclick="downloadInsights()">
                    <span class="export-option-icon">🧠</span>
                    <div class="export-option-content">
                        <h3 class="export-option-title">AI Insights</h3>
                        <p class="export-option-desc">Detailed analysis and recommendations in JSON format</p>
                    </div>
                </div>
            </div>
            <div class="export-modal-footer">
                <button class="export-modal-btn export-modal-btn-cancel" onclick="closeExportModal()">
                    Cancel
                </button>
            </div>
        \`;
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeExportModal();
            }
        });
        
        // Store reference for closing
        window.exportModalBackdrop = backdrop;
    }
    
    function closeExportModal() {
        const backdrop = window.exportModalBackdrop;
        if (backdrop) {
            backdrop.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                backdrop.remove();
                window.exportModalBackdrop = null;
            }, 200);
        }
    }
    
    function exportReport() {
        showExportModal();
    }
    
    async function downloadPDF() {
        closeExportModal();
        
        try {
            console.log('Downloading PDF...');
            
            // Show loading notification
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0066cc; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); animation: slideInRight 0.3s ease;';
            notification.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><div style="width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div><span>Generating PDF report...</span></div><style>@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideInRight { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>';
            document.body.appendChild(notification);

            // Check if jsPDF is loaded
            console.log('Checking jsPDF:', typeof window.jspdf);
            if (!window.jspdf) {
                throw new Error('jsPDF library not loaded. Please reload the page.');
            }

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            console.log('jsPDF loaded:', typeof jsPDF);
            const pdf = new jsPDF('p', 'mm', 'a4');
            console.log('PDF instance created');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            let yPos = margin;

            // Helper function to add new page if needed
            function checkNewPage(requiredSpace) {
                if (yPos + requiredSpace > pageHeight - margin) {
                    pdf.addPage();
                    yPos = margin;
                    return true;
                }
                return false;
            }

            // Title
            pdf.setFontSize(24);
            pdf.setTextColor(0, 102, 204);
            pdf.text('CodeFlow AI Report', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Date
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(new Date().toLocaleDateString() + ' | ' + new Date().toLocaleTimeString(), pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Productivity Score Box
            pdf.setFillColor(37, 99, 235);
            pdf.roundedRect(pageWidth / 2 - 30, yPos, 60, 25, 3, 3, 'F');
            pdf.setFontSize(32);
            pdf.setTextColor(255, 255, 255);
            pdf.text('${insight.productivityScore}', pageWidth / 2, yPos + 13, { align: 'center' });
            pdf.setFontSize(10);
            pdf.text('Productivity Score', pageWidth / 2, yPos + 20, { align: 'center' });
            yPos += 35;

            // Key Metrics Section
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text('📊 Key Metrics', margin, yPos);
            yPos += 8;

            const metrics = [
                { label: 'Total Coding Time', value: '${totalCodingHours}h' },
                { label: 'Average per Day', value: '${averageDailyHours}h' },
                { label: 'Current Streak', value: '${streakLabel}' },
                { label: 'Commands Executed', value: '${totalCommandsFormatted}' },
                { label: 'Keystrokes Tracked', value: '${totalKeystrokesFormatted}' },
                { label: 'Files Touched', value: '${uniqueFilesFormatted}' },
                { label: 'Languages Used', value: '${insight.uniqueLanguages}' },
                { label: 'Active Window', value: '${activeRangeLabel}' }
            ];

            pdf.setFontSize(10);
            const colWidth = (pageWidth - 2 * margin) / 2;
            metrics.forEach((metric, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const x = margin + col * colWidth;
                const y = yPos + row * 10;

                pdf.setTextColor(100, 100, 100);
                pdf.text(metric.label + ':', x, y);
                pdf.setTextColor(0, 102, 204);
                pdf.setFont(undefined, 'bold');
                pdf.text(metric.value, x + colWidth - 40, y);
                pdf.setFont(undefined, 'normal');
            });
            yPos += Math.ceil(metrics.length / 2) * 10 + 10;

            // Language Distribution
            checkNewPage(60);
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text('🌐 Language Distribution', margin, yPos);
            yPos += 8;

            pdf.setFontSize(9);
            languageData.slice(0, 8).forEach((lang, index) => {
                pdf.setTextColor(100, 100, 100);
                pdf.text(lang.language, margin + 5, yPos);
                
                // Progress bar
                const barWidth = 100;
                const barHeight = 4;
                pdf.setFillColor(220, 220, 220);
                pdf.rect(margin + 60, yPos - 3, barWidth, barHeight, 'F');
                pdf.setFillColor(37, 99, 235);
                pdf.rect(margin + 60, yPos - 3, barWidth * (lang.percentage / 100), barHeight, 'F');
                
                pdf.setTextColor(0, 102, 204);
                pdf.text(lang.percentage.toFixed(1) + '%', margin + 165, yPos);
                yPos += 7;
            });
            yPos += 10;

            // Most Used Commands
            checkNewPage(60);
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text('⌨️ Most Used Commands', margin, yPos);
            yPos += 8;

            pdf.setFontSize(9);
            commandData.slice(0, 8).forEach((cmd, index) => {
                pdf.setTextColor(100, 100, 100);
                const cmdText = cmd.command.length > 35 ? cmd.command.substring(0, 32) + '...' : cmd.command;
                pdf.text(cmdText, margin + 5, yPos);
                
                // Progress bar
                const maxCount = Math.max(...commandData.map(c => c.count));
                const barWidth = 70;
                const barHeight = 4;
                pdf.setFillColor(220, 220, 220);
                pdf.rect(margin + 90, yPos - 3, barWidth, barHeight, 'F');
                pdf.setFillColor(37, 99, 235);
                pdf.rect(margin + 90, yPos - 3, barWidth * (cmd.count / maxCount), barHeight, 'F');
                
                pdf.setTextColor(0, 102, 204);
                pdf.text(cmd.count.toString(), margin + 165, yPos);
                yPos += 7;
            });
            yPos += 10;

            // AI Insights
            checkNewPage(40);
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text('🤖 AI-Powered Insights', margin, yPos);
            yPos += 8;

            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const insights = ${JSON.stringify(insight.suggestions)};
            insights.slice(0, 5).forEach((suggestion, index) => {
                const lines = pdf.splitTextToSize('• ' + suggestion, pageWidth - 2 * margin - 5);
                lines.forEach(line => {
                    checkNewPage(7);
                    pdf.text(line, margin + 5, yPos);
                    yPos += 5;
                });
                yPos += 2;
            });

            // Footer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text('Generated by CodeFlow AI • ' + new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 10, { align: 'center' });
                pdf.text('Page ' + i + ' of ' + totalPages, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }

            // Save PDF
            const fileName = 'codeflow-report-' + new Date().toISOString().split('T')[0] + '.pdf';
            pdf.save(fileName);

            // Remove loading notification and show success
            notification.remove();
            const successNotif = document.createElement('div');
            successNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); animation: slideInRight 0.3s ease;';
            successNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><span>✓</span><span>PDF downloaded successfully!</span></div>';
            document.body.appendChild(successNotif);
            setTimeout(() => successNotif.remove(), 3000);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', error.message, error.stack);
            
            const errorNotif = document.createElement('div');
            errorNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
            errorNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><span>✕</span><span>Failed to generate PDF. Please try again.</span></div>';
            document.body.appendChild(errorNotif);
            setTimeout(() => errorNotif.remove(), 4000);
        }
    }
    
    function downloadJSON() {
        closeExportModal();
        
        try {
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
            
            // Show success notification
            const successNotif = document.createElement('div');
            successNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
            successNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><span>✓</span><span>JSON data downloaded successfully!</span></div>';
            document.body.appendChild(successNotif);
            setTimeout(() => successNotif.remove(), 3000);
        } catch (error) {
            console.error('Error downloading JSON:', error);
            alert('Failed to download JSON data.');
        }
    }
    
    function downloadInsights() {
        closeExportModal();
        exportInsights();
        
        // Show success notification
        const successNotif = document.createElement('div');
        successNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
        successNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><span>✓</span><span>AI Insights downloaded successfully!</span></div>';
        document.body.appendChild(successNotif);
        setTimeout(() => successNotif.remove(), 3000);
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
        console.log('requestUpgrade called');
        try {
            vscodeApi.postMessage({ type: 'upgrade' });
            console.log('Upgrade message sent to VS Code');
        } catch (error) {
            console.error('Error sending upgrade message:', error);
        }
    }

    function setFocusGoal() {
        const goal = prompt('Set your daily coding goal (in hours):', '4');
        if (goal !== null && !isNaN(parseFloat(goal))) {
            vscodeApi.postMessage({ 
                type: 'setGoal', 
                goal: parseFloat(goal) 
            });
            alert('Focus goal set to ' + goal + ' hours per day!');
        }
    }

    function scheduleBreak() {
        const minutes = prompt('Schedule a break reminder (in minutes):', '25');
        if (minutes !== null && !isNaN(parseInt(minutes))) {
            vscodeApi.postMessage({ 
                type: 'scheduleBreak', 
                minutes: parseInt(minutes) 
            });
            alert('Break reminder set for ' + minutes + ' minutes from now.');
        }
    }

    function exportInsights() {
        const insights = {
            summary: {
                productivityScore: ${insight.productivityScore},
                totalCodingHours: ${totalCodingHours},
                streak: ${insight.streakDays},
                languages: ${insight.uniqueLanguages}
            },
            suggestions: ${JSON.stringify(insight.suggestions)},
            patterns: {
                peakHours: '${this.analyzeProductivityPatterns(insight).peakHour}',
                focusIntensity: '${this.analyzeProductivityPatterns(insight).focusIntensity}',
                velocity: '${this.analyzeProductivityPatterns(insight).velocity}'
            },
            focus: {
                deepWorkSessions: ${this.calculateFocusMetrics(insight).deepWorkSessions},
                contextSwitches: ${this.calculateFocusMetrics(insight).contextSwitches},
                avgSessionLength: ${this.calculateFocusMetrics(insight).avgSessionLength}
            },
            generatedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(insights, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'codeflow-ai-insights-' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(url);
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
        const totalHours = insight.totalActiveMinutes / 60;
        const avgDailyHours = insight.dailyCodingMinutes.length > 0
            ? insight.totalActiveMinutes / insight.dailyCodingMinutes.length / 60
            : 0;

        const achievements = [
            // Productivity & Time Management
            {
                icon: '🔥',
                name: 'Persistence',
                description: '5+ day active streak',
                earned: insight.streakDays >= 5,
                progress: Math.min(100, (insight.streakDays / 5) * 100),
                rarity: 'common',
                category: 'Productivity'
            },
            {
                icon: '💎',
                name: 'Diamond Streak',
                description: '30+ day active streak',
                earned: insight.streakDays >= 30,
                progress: Math.min(100, (insight.streakDays / 30) * 100),
                rarity: 'legendary',
                category: 'Productivity'
            },
            {
                icon: '⚡',
                name: 'Speed Demon',
                description: '4+ hours in a single day',
                earned: Math.max(...insight.dailyCodingMinutes.map(d => d.minutes)) / 60 >= 4,
                progress: Math.min(100, (Math.max(...insight.dailyCodingMinutes.map(d => d.minutes)) / 60 / 4) * 100),
                rarity: 'rare',
                category: 'Productivity'
            },
            {
                icon: '🎯',
                name: 'Consistency King',
                description: 'Average 2+ hours daily',
                earned: avgDailyHours >= 2,
                progress: Math.min(100, (avgDailyHours / 2) * 100),
                rarity: 'epic',
                category: 'Productivity'
            },
            {
                icon: '🏃',
                name: 'Marathon Coder',
                description: '50+ total hours logged',
                earned: totalHours >= 50,
                progress: Math.min(100, (totalHours / 50) * 100),
                rarity: 'epic',
                category: 'Productivity'
            },
            
            // Language Mastery
            {
                icon: '🌐',
                name: 'Polyglot',
                description: 'Worked across 3+ languages',
                earned: insight.uniqueLanguages >= 3,
                progress: Math.min(100, (insight.uniqueLanguages / 3) * 100),
                rarity: 'common',
                category: 'Skills'
            },
            {
                icon: '🗣️',
                name: 'Language Master',
                description: 'Worked across 6+ languages',
                earned: insight.uniqueLanguages >= 6,
                progress: Math.min(100, (insight.uniqueLanguages / 6) * 100),
                rarity: 'epic',
                category: 'Skills'
            },
            {
                icon: '🌍',
                name: 'Universal Developer',
                description: 'Worked across 10+ languages',
                earned: insight.uniqueLanguages >= 10,
                progress: Math.min(100, (insight.uniqueLanguages / 10) * 100),
                rarity: 'legendary',
                category: 'Skills'
            },
            
            // Time-based Achievements
            {
                icon: '🦉',
                name: 'Night Owl',
                description: 'Coding after 10pm',
                earned: (insight.activeHourRange.latest ?? -1) >= 22,
                progress: (insight.activeHourRange.latest ?? -1) >= 22 ? 100 : 0,
                rarity: 'common',
                category: 'Lifestyle'
            },
            {
                icon: '🐦',
                name: 'Early Bird',
                description: 'Started before 8am',
                earned: (insight.activeHourRange.earliest ?? 24) <= 7,
                progress: (insight.activeHourRange.earliest ?? 24) <= 7 ? 100 : 0,
                rarity: 'common',
                category: 'Lifestyle'
            },
            {
                icon: '🌙',
                name: 'Midnight Warrior',
                description: 'Coding after midnight',
                earned: (insight.activeHourRange.latest ?? -1) >= 24 || (insight.activeHourRange.latest ?? -1) <= 3,
                progress: (insight.activeHourRange.latest ?? -1) >= 24 || (insight.activeHourRange.latest ?? -1) <= 3 ? 100 : 0,
                rarity: 'rare',
                category: 'Lifestyle'
            },
            {
                icon: '☀️',
                name: 'Dawn Breaker',
                description: 'Started before 6am',
                earned: (insight.activeHourRange.earliest ?? 24) <= 5,
                progress: (insight.activeHourRange.earliest ?? 24) <= 5 ? 100 : 0,
                rarity: 'rare',
                category: 'Lifestyle'
            },
            
            // Command & Action Achievements
            {
                icon: '⌨️',
                name: 'Command Master',
                description: '150+ commands executed',
                earned: insight.totalCommandsExecuted >= 150,
                progress: Math.min(100, (insight.totalCommandsExecuted / 150) * 100),
                rarity: 'common',
                category: 'Efficiency'
            },
            {
                icon: '🎮',
                name: 'Command Legend',
                description: '500+ commands executed',
                earned: insight.totalCommandsExecuted >= 500,
                progress: Math.min(100, (insight.totalCommandsExecuted / 500) * 100),
                rarity: 'epic',
                category: 'Efficiency'
            },
            {
                icon: '👆',
                name: 'Keystroke Hero',
                description: 'Logged 500+ keystrokes',
                earned: insight.totalKeystrokes >= 500,
                progress: Math.min(100, (insight.totalKeystrokes / 500) * 100),
                rarity: 'common',
                category: 'Efficiency'
            },
            {
                icon: '⚡',
                name: 'Typing Wizard',
                description: 'Logged 5000+ keystrokes',
                earned: insight.totalKeystrokes >= 5000,
                progress: Math.min(100, (insight.totalKeystrokes / 5000) * 100),
                rarity: 'rare',
                category: 'Efficiency'
            },
            {
                icon: '🚀',
                name: 'Keyboard Ninja',
                description: 'Logged 15000+ keystrokes',
                earned: insight.totalKeystrokes >= 15000,
                progress: Math.min(100, (insight.totalKeystrokes / 15000) * 100),
                rarity: 'legendary',
                category: 'Efficiency'
            },
            
            // Navigation & Organization
            {
                icon: '📁',
                name: 'File Jumper',
                description: '40+ file switches',
                earned: insight.fileSwitchCount >= 40,
                progress: Math.min(100, (insight.fileSwitchCount / 40) * 100),
                rarity: 'common',
                category: 'Navigation'
            },
            {
                icon: '🗂️',
                name: 'Project Explorer',
                description: '100+ file switches',
                earned: insight.fileSwitchCount >= 100,
                progress: Math.min(100, (insight.fileSwitchCount / 100) * 100),
                rarity: 'rare',
                category: 'Navigation'
            },
            {
                icon: '🧭',
                name: 'Code Navigator',
                description: '300+ file switches',
                earned: insight.fileSwitchCount >= 300,
                progress: Math.min(100, (insight.fileSwitchCount / 300) * 100),
                rarity: 'epic',
                category: 'Navigation'
            },
            
            // Focus & Concentration
            {
                icon: '🧘',
                name: 'Deep Focus',
                description: 'Focused session 2+ hours',
                earned: Math.max(...insight.dailyCodingMinutes.map(d => d.minutes)) / 60 >= 2,
                progress: Math.min(100, (Math.max(...insight.dailyCodingMinutes.map(d => d.minutes)) / 60 / 2) * 100),
                rarity: 'rare',
                category: 'Focus'
            },
            {
                icon: '🎯',
                name: 'Flow State',
                description: 'Focused session 6+ hours',
                earned: Math.max(...insight.dailyCodingMinutes.map(d => d.minutes)) / 60 >= 6,
                progress: Math.min(100, (Math.max(...insight.dailyCodingMinutes.map(d => d.minutes)) / 60 / 6) * 100),
                rarity: 'legendary',
                category: 'Focus'
            },
            
            // Milestones
            {
                icon: '🎖️',
                name: 'First Steps',
                description: 'Completed first coding session',
                earned: totalHours > 0,
                progress: totalHours > 0 ? 100 : 0,
                rarity: 'common',
                category: 'Milestones'
            },
            {
                icon: '🏅',
                name: 'Century Club',
                description: '100+ hours total',
                earned: totalHours >= 100,
                progress: Math.min(100, (totalHours / 100) * 100),
                rarity: 'legendary',
                category: 'Milestones'
            },
            {
                icon: '👑',
                name: 'Elite Developer',
                description: '500+ hours total',
                earned: totalHours >= 500,
                progress: Math.min(100, (totalHours / 500) * 100),
                rarity: 'legendary',
                category: 'Milestones'
            }
        ];

        // Sort: earned first, then by rarity
        const rarityOrder = { 'legendary': 0, 'epic': 1, 'rare': 2, 'common': 3 };
        achievements.sort((a, b) => {
            if (a.earned !== b.earned) {
                return a.earned ? -1 : 1;
            }
            return (rarityOrder[a.rarity as keyof typeof rarityOrder] || 4) - (rarityOrder[b.rarity as keyof typeof rarityOrder] || 4);
        });

        // Count earned badges by rarity
        const earnedCount = achievements.filter(a => a.earned).length;
        const rarityStats = achievements.reduce((acc, a) => {
            if (a.earned) {
                acc[a.rarity] = (acc[a.rarity] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const statsHtml = `
            <div class="badge-stats">
                <div class="stat-item">
                    <span class="stat-label">Earned:</span>
                    <span class="stat-value">${earnedCount}/${achievements.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Progress:</span>
                    <span class="stat-value">${Math.round((earnedCount / achievements.length) * 100)}%</span>
                </div>
                ${rarityStats.legendary ? `<div class="stat-item legendary-stat">⭐ ${rarityStats.legendary} Legendary</div>` : ''}
                ${rarityStats.epic ? `<div class="stat-item epic-stat">💜 ${rarityStats.epic} Epic</div>` : ''}
            </div>
        `;

        const badgesHtml = achievements.map(achievement => {
            const progressBar = achievement.progress < 100 && !achievement.earned 
                ? `<div class="badge-progress"><div class="badge-progress-bar" style="width: ${achievement.progress}%"></div></div>`
                : '';
            
            const rarityClass = `rarity-${achievement.rarity}`;
            const categoryBadge = `<span class="category-badge">${achievement.category}</span>`;
            
            return `
                <div class="badge ${achievement.earned ? 'earned' : ''} ${rarityClass}" title="${achievement.category} • ${achievement.rarity}">
                    <div class="badge-icon">${achievement.icon}</div>
                    <div class="badge-name">${achievement.name}</div>
                    <div class="badge-desc">${achievement.description}</div>
                    ${categoryBadge}
                    ${progressBar}
                </div>
            `;
        }).join('');

        return statsHtml + badgesHtml;
    }

    private buildAiInsightsHtml(insight: ProductivityInsight): string {
        // Categorize suggestions
        const categorizedSuggestions = this.categorizeSuggestions(insight.suggestions);
        
        // Calculate productivity patterns
        const patterns = this.analyzeProductivityPatterns(insight);
        
        // Generate focus metrics
        const focusMetrics = this.calculateFocusMetrics(insight);
        
        // Work-life balance analysis
        const workLifeBalance = this.analyzeWorkLifeBalance(insight);
        
        // Productivity trend indicator
        const trendIndicator = this.calculateTrendIndicator(insight);
        
        const suggestionItems = (insight.suggestions && insight.suggestions.length > 0)
            ? insight.suggestions.map((suggestion, index) => `
                <li class="insight-item" data-category="${categorizedSuggestions[index] || 'general'}">
                    <span class="insight-icon">${this.getInsightIcon(categorizedSuggestions[index])}</span>
                    <span class="insight-text">${suggestion}</span>
                </li>
            `).join('')
            : '<li class="insight-item"><span class="insight-icon">💡</span><span class="insight-text">Keep coding to unlock personalized AI suggestions.</span></li>';

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
                            <div class="tf-feature-bar">
                                <div class="tf-feature-fill" style="width: ${impact}%"></div>
                            </div>
                            <span class="tf-feature-weight">${impact}%</span>
                        </div>
                    `;
                })
                .join('');

            if (topFeatures) {
                tfHighlights = `
                    <div class="tf-highlights">
                        <h3 style="font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>🧠</span> Model Insights
                        </h3>
                        <div class="tf-feature-grid">
                            ${topFeatures}
                        </div>
                    </div>
                `;
            }
        }

        return `
            <div class="ai-insights-container">
                <!-- Productivity Trend -->
                <div class="insight-section trend-section">
                    <div class="section-header">
                        <h3>📊 Productivity Trend</h3>
                        <span class="trend-badge ${trendIndicator.class}">${trendIndicator.icon} ${trendIndicator.text}</span>
                    </div>
                    <p class="section-description">${trendIndicator.description}</p>
                </div>

                <!-- Focus Analysis -->
                <div class="insight-section focus-section">
                    <div class="section-header">
                        <h3>🎯 Focus Analysis</h3>
                    </div>
                    <div class="focus-metrics">
                        <div class="focus-metric">
                            <span class="metric-label">Deep Work Sessions</span>
                            <span class="metric-value">${focusMetrics.deepWorkSessions}</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${Math.min(100, focusMetrics.deepWorkSessions * 10)}%"></div>
                            </div>
                        </div>
                        <div class="focus-metric">
                            <span class="metric-label">Context Switches</span>
                            <span class="metric-value">${focusMetrics.contextSwitches}</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${Math.min(100, focusMetrics.contextSwitches / 2)}%; background: ${focusMetrics.contextSwitches > 50 ? '#ef4444' : '#10b981'}"></div>
                            </div>
                        </div>
                        <div class="focus-metric">
                            <span class="metric-label">Avg. Session Length</span>
                            <span class="metric-value">${focusMetrics.avgSessionLength}min</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${Math.min(100, focusMetrics.avgSessionLength)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Productivity Patterns -->
                <div class="insight-section patterns-section">
                    <div class="section-header">
                        <h3>⏰ Your Peak Coding Hours</h3>
                    </div>
                    <div class="patterns-grid">
                        <div class="pattern-card">
                            <span class="pattern-icon">🌅</span>
                            <div class="pattern-info">
                                <span class="pattern-label">Most Productive</span>
                                <span class="pattern-value">${patterns.peakHour}</span>
                            </div>
                        </div>
                        <div class="pattern-card">
                            <span class="pattern-icon">🎯</span>
                            <div class="pattern-info">
                                <span class="pattern-label">Focus Intensity</span>
                                <span class="pattern-value">${patterns.focusIntensity}</span>
                            </div>
                        </div>
                        <div class="pattern-card">
                            <span class="pattern-icon">⚡</span>
                            <div class="pattern-info">
                                <span class="pattern-label">Velocity</span>
                                <span class="pattern-value">${patterns.velocity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Work-Life Balance -->
                <div class="insight-section balance-section">
                    <div class="section-header">
                        <h3>⚖️ Work-Life Balance</h3>
                        <span class="balance-score ${workLifeBalance.scoreClass}">${workLifeBalance.score}/10</span>
                    </div>
                    <p class="balance-message">${workLifeBalance.message}</p>
                    <div class="balance-indicators">
                        <div class="balance-indicator ${workLifeBalance.weekendActivity ? 'active' : ''}">
                            <span>📅</span> Weekend Activity: ${workLifeBalance.weekendActivity ? 'Detected' : 'Balanced'}
                        </div>
                        <div class="balance-indicator ${workLifeBalance.lateNightCoding ? 'active' : ''}">
                            <span>🌙</span> Late Night Coding: ${workLifeBalance.lateNightCoding ? 'Frequent' : 'Minimal'}
                        </div>
                    </div>
                </div>

                <!-- AI Suggestions -->
                <div class="insight-section suggestions-section">
                    <div class="section-header">
                        <h3>💡 Personalized Recommendations</h3>
                    </div>
                    <ul class="insight-list">
                        ${suggestionItems}
                    </ul>
                </div>

                ${tfHighlights}

                <!-- Quick Actions -->
                <div class="insight-section actions-section">
                    <div class="section-header">
                        <h3>⚡ Quick Actions</h3>
                    </div>
                    <div class="quick-actions">
                        <button class="action-btn" onclick="setFocusGoal()">
                            <span>🎯</span> Set Focus Goal
                        </button>
                        <button class="action-btn" onclick="scheduleBreak()">
                            <span>☕</span> Schedule Break
                        </button>
                        <button class="action-btn" onclick="exportInsights()">
                            <span>📤</span> Export Insights
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private categorizeSuggestions(suggestions: string[]): string[] {
        return suggestions.map(suggestion => {
            const lower = suggestion.toLowerCase();
            if (lower.includes('break') || lower.includes('burnout')) {
                return 'health';
            }
            if (lower.includes('shortcut') || lower.includes('snippet') || lower.includes('feature')) {
                return 'efficiency';
            }
            if (lower.includes('file') || lower.includes('workspace')) {
                return 'workflow';
            }
            if (lower.includes('focus') || lower.includes('concentration')) {
                return 'focus';
            }
            return 'general';
        });
    }

    private getInsightIcon(category: string): string {
        const icons: Record<string, string> = {
            health: '💚',
            efficiency: '⚡',
            workflow: '🔧',
            focus: '🎯',
            general: '💡'
        };
        return icons[category] || '💡';
    }

    private analyzeProductivityPatterns(insight: ProductivityInsight): any {
        const { activeHourRange, dailyCodingMinutes } = insight;
        
        // Find peak hour (simplified)
        const peakHourNum = activeHourRange.earliest || 9;
        const peakHourStr = peakHourNum < 12 ? `${peakHourNum}AM` : 
                           peakHourNum === 12 ? '12PM' : 
                           `${peakHourNum - 12}PM`;
        
        // Calculate focus intensity based on consecutive coding days
        const focusIntensity = insight.streakDays > 5 ? 'High' : 
                              insight.streakDays > 2 ? 'Medium' : 'Building';
        
        // Calculate velocity based on commands per hour
        const avgHoursPerDay = insight.dailyCodingMinutes.length > 0 
            ? insight.totalActiveMinutes / insight.dailyCodingMinutes.length / 60 
            : 0;
        const commandsPerHour = avgHoursPerDay > 0 
            ? Math.round(insight.totalCommandsExecuted / (insight.totalActiveMinutes / 60)) 
            : 0;
        const velocity = commandsPerHour > 30 ? 'Fast' : 
                        commandsPerHour > 15 ? 'Steady' : 'Deliberate';
        
        return {
            peakHour: peakHourStr,
            focusIntensity,
            velocity
        };
    }

    private calculateFocusMetrics(insight: ProductivityInsight): any {
        // Estimate deep work sessions (periods of >30min continuous coding)
        const avgSessionLength = insight.dailyCodingMinutes.length > 0
            ? Math.round(insight.totalActiveMinutes / insight.dailyCodingMinutes.filter(d => d.minutes > 0).length)
            : 0;
        
        const deepWorkSessions = Math.floor(insight.totalActiveMinutes / 30);
        const contextSwitches = insight.fileSwitchCount;
        
        return {
            deepWorkSessions,
            contextSwitches,
            avgSessionLength
        };
    }

    private analyzeWorkLifeBalance(insight: ProductivityInsight): any {
        // Analyze based on active hour range
        const { earliest, latest } = insight.activeHourRange;
        
        const lateNightCoding = (latest && latest > 22) || false;
        const earlyMorning = (earliest && earliest < 6) || false;
        
        // Estimate weekend activity based on daily coding pattern
        const daysWithActivity = insight.dailyCodingMinutes.filter(d => d.minutes > 0).length;
        const weekendActivity = daysWithActivity >= 7; // If coding all 7 days
        
        let score = 10;
        if (lateNightCoding) {
            score -= 2;
        }
        if (earlyMorning) {
            score -= 1;
        }
        if (weekendActivity) {
            score -= 2;
        }
        if (insight.totalActiveMinutes / insight.dailyCodingMinutes.length > 600) {
            score -= 2; // >10h/day avg
        }
        
        score = Math.max(1, Math.min(10, score));
        
        const scoreClass = score >= 8 ? 'excellent' : score >= 6 ? 'good' : 'needs-attention';
        
        const messages = [
            'Excellent balance! You\'re maintaining healthy coding habits.',
            'Good balance. Consider taking regular breaks to optimize performance.',
            'Your coding schedule shows intense commitment. Remember to rest and recharge!'
        ];
        
        const message = score >= 8 ? messages[0] : score >= 6 ? messages[1] : messages[2];
        
        return {
            score,
            scoreClass,
            message,
            weekendActivity,
            lateNightCoding
        };
    }

    private calculateTrendIndicator(insight: ProductivityInsight): any {
        const recentDays = insight.dailyCodingMinutes.slice(-3);
        const olderDays = insight.dailyCodingMinutes.slice(0, 3);
        
        if (recentDays.length === 0 || olderDays.length === 0) {
            return {
                icon: '➡️',
                text: 'Stable',
                class: 'neutral',
                description: 'Keep up the consistent coding rhythm!'
            };
        }
        
        const recentAvg = recentDays.reduce((sum, d) => sum + d.minutes, 0) / recentDays.length;
        const olderAvg = olderDays.reduce((sum, d) => sum + d.minutes, 0) / olderDays.length;
        
        const change = recentAvg - olderAvg;
        const percentChange = olderAvg > 0 ? Math.abs((change / olderAvg) * 100) : 0;
        
        if (percentChange < 10) {
            return {
                icon: '➡️',
                text: 'Stable',
                class: 'neutral',
                description: 'Your coding time is consistent. Great job maintaining balance!'
            };
        } else if (change > 0) {
            return {
                icon: '📈',
                text: `+${Math.round(percentChange)}%`,
                class: 'positive',
                description: 'Your coding activity is trending upward. You\'re in the zone!'
            };
        } else {
            return {
                icon: '📉',
                text: `-${Math.round(percentChange)}%`,
                class: 'negative',
                description: 'Your coding time has decreased. This might be a good time to refocus or take a well-deserved break.'
            };
        }
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
            },
            {
                icon: '🎯',
                title: 'Deep Work Sessions',
                description: 'Track and optimize focused coding blocks with distraction-free timers and analytics.'
            },
            {
                icon: '🌙',
                title: 'Circadian Insights',
                description: 'Discover your peak productivity hours with biological rhythm analysis.'
            },
            {
                icon: '📊',
                title: 'Advanced Analytics Dashboard',
                description: 'Export detailed reports, custom date ranges, and compare periods side-by-side.'
            },
            {
                icon: '🎨',
                title: 'Code Quality Metrics',
                description: 'Track refactoring patterns, code complexity trends, and quality improvements over time.'
            },
            {
                icon: '⚡',
                title: 'Productivity Automation',
                description: 'Auto-schedule breaks, suggest optimal work blocks, and create custom workflows.'
            },
            {
                icon: '🏅',
                title: 'Premium Achievements',
                description: 'Unlock exclusive badges, milestones, and customizable goal tracking systems.'
            },
            {
                icon: '💡',
                title: 'AI Code Suggestions',
                description: 'Get personalized recommendations for improving your coding patterns and efficiency.'
            },
            {
                icon: '📱',
                title: 'Multi-Device Sync',
                description: 'Seamlessly sync your progress across all your devices and workstations.'
            },
            {
                icon: '🔐',
                title: 'Priority Support',
                description: 'Get faster response times and dedicated assistance from our expert team.'
            },
            {
                icon: '🎓',
                title: 'Learning Path Insights',
                description: 'Track skill development, language proficiency growth, and personalized learning recommendations.'
            },
            {
                icon: '🔄',
                title: 'Habit Formation Tools',
                description: 'Build better coding habits with streak protection, habit stacking, and behavioral insights.'
            },
            {
                icon: '🌟',
                title: 'Custom Themes & Branding',
                description: 'Personalize your dashboard with custom colors, layouts, and visual preferences.'
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
