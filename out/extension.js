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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const dataCollector_1 = require("./dataCollector");
const aiAnalyzer_1 = require("./aiAnalyzer");
const visualization_1 = require("./visualization");
const gamification_1 = require("./gamification");
const backendServices_1 = require("./backendServices");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
// TODO: Fix React component compilation issues
// import { LoginComponent } from './components/auth/LoginComponent';
// import { SignUpComponent } from './components/auth/SignUpComponent';
// import { AccountSettingsComponent } from './components/settings/AccountSettingsComponent';
// Global variable to hold backend services for cleanup
let backendServicesModuleInstance;
function activate(context) {
    console.log('CodeFlow AI is now active');
    // Initialize components
    const dataCollector = new dataCollector_1.DataCollector(context);
    const aiAnalyzer = new aiAnalyzer_1.AIAnalyzer(context);
    const visualizationPanel = new visualization_1.VisualizationPanel(context);
    const gamificationSystem = new gamification_1.GamificationSystem(context);
    const backendServices = new backendServices_1.BackendServices(context);
    const backendServicesModule = new backendServices_1.BackendServicesModule(context);
    backendServicesModuleInstance = backendServicesModule;
    // Set up refresh callback for visualization panel
    visualizationPanel.setRefreshCallback(async () => {
        try {
            const insight = await aiAnalyzer.analyzeData(7);
            const activities = gamificationSystem.getActivitiesForLastWeek();
            gamificationSystem.checkForNewBadges(activities);
            visualizationPanel.show(insight);
            const progress = gamificationSystem.getUserProgress();
            backendServices.syncData(insight, progress);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error refreshing report: ${error}`);
        }
    });
    // Register commands
    const showReportCommand = vscode.commands.registerCommand('codeflow.showReport', async () => {
        try {
            // Analyze data for the last 7 days
            const insight = await aiAnalyzer.analyzeData(7);
            // Check for new badges
            const activities = gamificationSystem.getActivitiesForLastWeek();
            gamificationSystem.checkForNewBadges(activities);
            // Show the report
            visualizationPanel.show(insight);
            // Sync data to cloud if enabled
            const progress = gamificationSystem.getUserProgress();
            backendServices.syncData(insight, progress);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating report: ${error}`);
        }
    });
    const toggleTrackingCommand = vscode.commands.registerCommand('codeflow.toggleTracking', async () => {
        const config = vscode.workspace.getConfiguration('codeflow');
        const currentValue = config.get('enabled', true);
        await config.update('enabled', !currentValue, vscode.ConfigurationTarget.Global);
        const status = !currentValue ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(`CodeFlow tracking ${status}`);
    });
    const showBadgesCommand = vscode.commands.registerCommand('codeflow.showBadges', () => {
        const earnedBadges = gamificationSystem.getEarnedBadges();
        const allBadges = gamificationSystem.getAllBadges();
        const progress = gamificationSystem.getUserProgress();
        // Create a quick pick to show badges
        const items = allBadges.map(badge => {
            const isEarned = earnedBadges.some(b => b.id === badge.id);
            return {
                label: `${badge.icon} ${badge.name}`,
                description: badge.description,
                detail: isEarned ? 'Earned' : 'Not earned yet',
                picked: isEarned
            };
        });
        vscode.window.showQuickPick(items, {
            placeHolder: `Level ${progress.level} Developer - ${progress.points} points`,
            canPickMany: false
        });
    });
    const enableCloudSyncCommand = vscode.commands.registerCommand('codeflow.enableCloudSync', async () => {
        try {
            await backendServices.authenticate();
            vscode.window.showInformationMessage('Cloud sync enabled successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to enable cloud sync: ${error}`);
        }
    });
    const configureAPICommand = vscode.commands.registerCommand('codeflow.configureAPI', async () => {
        const config = vscode.workspace.getConfiguration('codeflow');
        // Ask for API endpoint
        const endpoint = await vscode.window.showInputBox({
            prompt: 'Enter the API endpoint for AI analysis',
            value: config.get('apiEndpoint', ''),
            placeHolder: 'https://api.example.com/analyze'
        });
        if (endpoint !== undefined) {
            await config.update('apiEndpoint', endpoint, vscode.ConfigurationTarget.Global);
        }
        // Ask for API key
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your API key',
            value: config.get('apiKey', ''),
            password: true
        });
        if (apiKey !== undefined) {
            await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
        }
        // Ask if external API should be used
        const useExternalAPI = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Use external API for AI analysis?'
        });
        if (useExternalAPI === 'Yes') {
            await config.update('useExternalAPI', true, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('External API configured successfully!');
        }
        else if (useExternalAPI === 'No') {
            await config.update('useExternalAPI', false, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Using local analysis only.');
        }
    });
    const trainTFModelCommand = vscode.commands.registerCommand('codeflow.trainTFModel', async () => {
        try {
            const tfPath = path.join(context.extensionPath, 'ml', 'tfjs');
            const trainScript = path.join(tfPath, 'train.js');
            // Verify the script exists
            const fs = require('fs');
            if (!fs.existsSync(trainScript)) {
                vscode.window.showErrorMessage(`Training script not found at: ${trainScript}`);
                return;
            }
            // Show progress notification
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Training TensorFlow.js Model",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: "Starting training process..." });
                // Run the Node.js script
                const result = await runNodeScript(trainScript, []);
                progress.report({ message: "Training completed successfully!" });
                // Enable TensorFlow.js model in settings
                const config = vscode.workspace.getConfiguration('codeflow');
                await config.update('useTFModel', true, vscode.ConfigurationTarget.Global);
                // Show output in console
                console.log('Training output:', result);
                vscode.window.showInformationMessage('TensorFlow.js model trained and enabled successfully!');
            });
        }
        catch (error) {
            console.error('Training error:', error);
            vscode.window.showErrorMessage(`Error training TensorFlow.js model: ${error}`);
        }
    });
    const setGoalCommand = vscode.commands.registerCommand('codeflow.setGoal', async () => {
        const goalType = await vscode.window.showQuickPick([
            'Daily Productivity Score',
            'Weekly Coding Hours',
            'Languages to Learn',
            'Badges to Earn'
        ], {
            placeHolder: 'Select a goal type'
        });
        if (!goalType) {
            return;
        }
        const goalValue = await vscode.window.showInputBox({
            prompt: `Enter your target for ${goalType}`,
            placeHolder: 'e.g., 80 for score, 20 for hours, 5 for languages',
            validateInput: (value) => {
                return isNaN(Number(value)) ? 'Please enter a valid number' : null;
            }
        });
        if (goalValue) {
            const config = vscode.workspace.getConfiguration('codeflow');
            const goals = config.get('goals', {});
            goals[goalType] = Number(goalValue);
            await config.update('goals', goals, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`✅ Goal set: ${goalType} = ${goalValue}`);
        }
    });
    const viewStatsCommand = vscode.commands.registerCommand('codeflow.viewStats', async () => {
        const period = await vscode.window.showQuickPick([
            'Today',
            'Last 7 Days',
            'Last 30 Days',
            'All Time'
        ], {
            placeHolder: 'Select time period'
        });
        if (!period) {
            return;
        }
        const days = period === 'Today' ? 1 :
            period === 'Last 7 Days' ? 7 :
                period === 'Last 30 Days' ? 30 : 365;
        try {
            const insight = await aiAnalyzer.analyzeData(days);
            visualizationPanel.show(insight);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error viewing stats: ${error}`);
        }
    });
    const comparePerformanceCommand = vscode.commands.registerCommand('codeflow.comparePerformance', async () => {
        try {
            const thisWeek = await aiAnalyzer.analyzeData(7);
            const lastWeek = await aiAnalyzer.analyzeData(14);
            const scoreDiff = thisWeek.productivityScore - lastWeek.productivityScore;
            const emoji = scoreDiff > 0 ? '📈' : scoreDiff < 0 ? '📉' : '➡️';
            const trend = scoreDiff > 0 ? 'improved' : scoreDiff < 0 ? 'decreased' : 'remained stable';
            vscode.window.showInformationMessage(`${emoji} Your productivity has ${trend} by ${Math.abs(scoreDiff).toFixed(1)} points compared to last week!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error comparing performance: ${error}`);
        }
    });
    const exportDataCommand = vscode.commands.registerCommand('codeflow.exportData', async () => {
        try {
            const insight = await aiAnalyzer.analyzeData(30);
            const progress = gamificationSystem.getUserProgress();
            const badges = gamificationSystem.getEarnedBadges();
            const exportData = {
                generatedAt: new Date().toISOString(),
                productivity: insight,
                gamification: {
                    progress,
                    badges
                }
            };
            const saveUri = await vscode.window.showSaveDialog({
                filters: {
                    'JSON': ['json']
                },
                defaultUri: vscode.Uri.file(`codeflow-export-${new Date().toISOString().split('T')[0]}.json`)
            });
            if (saveUri) {
                const fs = require('fs');
                fs.writeFileSync(saveUri.fsPath, JSON.stringify(exportData, null, 2));
                vscode.window.showInformationMessage('📥 Data exported successfully!');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error exporting data: ${error}`);
        }
    });
    // Register auth-related commands
    const loginCommand = vscode.commands.registerCommand('codeflow.login', async () => {
        // Show login UI
        vscode.window.showInformationMessage('Login UI will be displayed here');
    });
    const logoutCommand = vscode.commands.registerCommand('codeflow.logout', async () => {
        await backendServicesModule.getAuthService().logout();
    });
    const upgradeToProCommand = vscode.commands.registerCommand('codeflow.upgradeToPro', async () => {
        await backendServicesModule.getAuthService().upgradeToPro();
    });
    // Register status bar item (CodeFlow icon)
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(rocket) CodeFlow';
    statusBarItem.tooltip = 'CodeFlow AI - Click to view weekly report';
    statusBarItem.command = 'codeflow.showReport';
    statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    statusBarItem.show();
    // Update status bar based on tracking state
    const updateStatusBar = () => {
        const config = vscode.workspace.getConfiguration('codeflow');
        const isEnabled = config.get('enabled', true);
        if (isEnabled) {
            statusBarItem.text = '$(rocket) CodeFlow';
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
        else {
            statusBarItem.text = '$(circle-slash) CodeFlow';
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    };
    // Initial status bar update
    updateStatusBar();
    // Listen for configuration changes to update status bar
    const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('codeflow.enabled')) {
            updateStatusBar();
        }
    });
    // Add to subscriptions
    context.subscriptions.push(dataCollector, backendServicesModule, showReportCommand, toggleTrackingCommand, showBadgesCommand, enableCloudSyncCommand, configureAPICommand, trainTFModelCommand, setGoalCommand, viewStatsCommand, comparePerformanceCommand, exportDataCommand, loginCommand, logoutCommand, upgradeToProCommand, statusBarItem, configWatcher);
    // Check for new badges periodically
    setInterval(() => {
        const activities = gamificationSystem.getActivitiesForLastWeek();
        gamificationSystem.checkForNewBadges(activities);
    }, 60000 * 60); // Check every hour
}
function runNodeScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)('node', [scriptPath, ...args], {
            cwd: path.dirname(scriptPath),
            shell: true
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            console.log('Training:', output.trim());
        });
        child.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            console.error('Training error:', output.trim());
        });
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Script exited with code ${code}: ${stderr}`));
            }
            else {
                resolve(stdout);
            }
        });
        child.on('error', (error) => {
            reject(error);
        });
    });
}
function deactivate() {
    console.log('CodeFlow AI is now deactivated');
    // Clean up local server
    if (backendServicesModuleInstance) {
        backendServicesModuleInstance.stopLocalServer();
    }
}
//# sourceMappingURL=extension.js.map