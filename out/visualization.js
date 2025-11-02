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
    constructor(context) {
        this.context = context;
    }
    show(insight) {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
        }
        else {
            this._panel = vscode.window.createWebviewPanel(VisualizationPanel.viewType, 'CodeFlow Report', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                    vscode.Uri.joinPath(this.context.extensionUri, 'node_modules')
                ]
            });
            this._panel.webview.html = this._getHtmlForWebview(this._panel.webview, insight);
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        }
    }
    _getHtmlForWebview(webview, insight) {
        const chartJsScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.min.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'styles.css'));
        const nonce = getNonce();
        // Calculate additional stats
        const totalCommands = insight.mostUsedCommands.reduce((sum, cmd) => sum + cmd.count, 0);
        const totalFiles = insight.mostWorkedFiles.length;
        const totalTime = insight.mostWorkedFiles.reduce((sum, file) => sum + file.time, 0);
        const avgTimePerFile = totalFiles > 0 ? (totalTime / totalFiles).toFixed(1) : 0;
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
<button class="theme-toggle" onclick="toggleTheme()">🌓</button>
<div class="container">
    <header>
        <div>
            <h1>📊 CodeFlow Weekly Report</h1>
            <p style="color: var(--text-secondary); margin: 5px 0 0 0;">Your productivity insights at a glance</p>
        </div>
        <div class="header-actions">
            <button class="btn export-btn" onclick="exportReport()">📥 Export</button>
            <div class="productivity-score">
                <div class="score-circle">
                    <span class="score-value">${insight.productivityScore}</span>
                    <span class="score-label">Score</span>
                </div>
            </div>
        </div>
    </header>

    <div class="stats-overview">
        <div class="stat-card">
            <div class="stat-icon">⌨️</div>
            <div class="stat-value">${totalCommands}</div>
            <div class="stat-label">Commands Executed</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📁</div>
            <div class="stat-value">${totalFiles}</div>
            <div class="stat-label">Files Worked On</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">${Math.round(totalTime / 60)}</div>
            <div class="stat-label">Hours Coded</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">${avgTimePerFile}</div>
            <div class="stat-label">Avg Min/File</div>
        </div>
    </div>

    <div class="progress-section">
        <h2>🎯 Weekly Goal Progress</h2>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(insight.productivityScore, 100)}%"></div>
        </div>
        <div class="progress-text">${insight.productivityScore}% of target achieved</div>
    </div>

    <div class="filter-controls">
        <button class="filter-btn active" onclick="filterView('all')">All</button>
        <button class="filter-btn" onclick="filterView('languages')">Languages</button>
        <button class="filter-btn" onclick="filterView('commands')">Commands</button>
        <button class="filter-btn" onclick="filterView('files')">Files</button>
    </div>

    <section class="insights">
        <div class="insight-card" data-category="languages">
            <h2>🌐 Language Distribution</h2>
            <div class="chart-container">
                <canvas id="languageChart"></canvas>
            </div>
        </div>

        <div class="insight-card" data-category="commands">
            <h2>⌨️ Most Used Commands</h2>
            <div class="chart-container">
                <canvas id="commandChart"></canvas>
            </div>
        </div>

        <div class="insight-card" data-category="files">
            <h2>📁 Most Worked Files</h2>
            <div class="chart-container">
                <canvas id="fileChart"></canvas>
            </div>
        </div>

        <div class="insight-card" data-category="time">
            <h2>🕐 Hourly Activity</h2>
            <div class="chart-container">
                <canvas id="timeChart"></canvas>
            </div>
        </div>

        <div class="insight-card" data-category="trend">
            <h2>📈 Weekly Trend</h2>
            <div class="chart-container">
                <canvas id="trendChart"></canvas>
            </div>
        </div>

        <div class="insight-card">
            <h2>💡 AI Suggestions</h2>
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

// Generate sample data for new charts
const hourlyData = generateHourlyData();
const weeklyTrendData = generateWeeklyTrend();

// Chart color schemes
const gradientColors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'];
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
commandGradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
commandGradient.addColorStop(1, 'rgba(118, 75, 162, 0.8)');
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
fileGradient.addColorStop(0, 'rgba(67, 233, 123, 0.8)');
fileGradient.addColorStop(1, 'rgba(56, 239, 125, 0.8)');

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

// Hourly Activity Chart (Line)
const timeCtx = document.getElementById('timeChart').getContext('2d');
const timeGradient = timeCtx.createLinearGradient(0, 0, 0, 400);
timeGradient.addColorStop(0, 'rgba(250, 112, 154, 0.6)');
timeGradient.addColorStop(1, 'rgba(254, 225, 64, 0.1)');

new Chart(timeCtx, {
    type: 'line',
    data: {
        labels: hourlyData.labels,
        datasets: [{
            label: 'Activity Level',
            data: hourlyData.values,
            backgroundColor: timeGradient,
            borderColor: '#fa709a',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#fa709a',
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
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { display: false }
            }
        }
    }
});

// Weekly Trend Chart (Line with multiple datasets)
const trendCtx = document.getElementById('trendChart').getContext('2d');
new Chart(trendCtx, {
    type: 'line',
    data: {
        labels: weeklyTrendData.labels,
        datasets: [
            {
                label: 'Productivity',
                data: weeklyTrendData.productivity,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Activity',
                data: weeklyTrendData.activity,
                borderColor: '#43e97b',
                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    },
    options: {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
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

// Utility functions
function generateHourlyData() {
    const hours = Array.from({length: 24}, (_, i) => i);
    const labels = hours.map(h => h.toString().padStart(2, '0') + ':00');
    const values = hours.map(() => Math.floor(Math.random() * 100));
    return { labels, values };
}

function generateWeeklyTrend() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const productivity = days.map(() => Math.floor(Math.random() * 40) + 60);
    const activity = days.map(() => Math.floor(Math.random() * 40) + 50);
    return { labels: days, productivity, activity };
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function filterView(category) {
    const cards = document.querySelectorAll('.insight-card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'all') {
        cards.forEach(card => card.style.display = 'block');
    } else {
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            card.style.display = cardCategory === category ? 'block' : 'none';
        });
    }
}

function exportReport() {
    const reportData = {
        productivityScore: ${insight.productivityScore},
        languages: languageData,
        commands: commandData,
        files: fileData,
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

// Load theme preference
window.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
</script>
</body>
</html>`;
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