import * as vscode from 'vscode';
import { DataCollector } from './dataCollector';
import { AIAnalyzer } from './aiAnalyzer';
import { VisualizationPanel } from './visualization';
import { GamificationSystem } from './gamification';
import { BackendServices } from './backendServices';
import { spawn } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodeFlow AI is now active');
    
    // Initialize components
    const dataCollector = new DataCollector(context);
    const aiAnalyzer = new AIAnalyzer(context);
    const visualizationPanel = new VisualizationPanel(context);
    const gamificationSystem = new GamificationSystem(context);
    const backendServices = new BackendServices(context);
    
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
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating report: ${error}`);
        }
    });
    
    const toggleTrackingCommand = vscode.commands.registerCommand('codeflow.toggleTracking', () => {
        // This is handled by the DataCollector class
        vscode.commands.executeCommand('codeflow.toggleTracking');
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
        } catch (error) {
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
        } else if (useExternalAPI === 'No') {
            await config.update('useExternalAPI', false, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Using local analysis only.');
        }
    });
    
    const trainTFModelCommand = vscode.commands.registerCommand('codeflow.trainTFModel', async () => {
        try {
            const tfPath = path.join(context.extensionPath, 'ml', 'tfjs');
            const trainScript = path.join(tfPath, 'train.js');
            
            // Show progress notification
            vscode.window.withProgress({
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
                
                vscode.window.showInformationMessage('TensorFlow.js model trained and enabled successfully!');
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error training TensorFlow.js model: ${error}`);
        }
    });
    
    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(chart-line) CodeFlow";
    statusBarItem.tooltip = "Show CodeFlow Report";
    statusBarItem.command = 'codeflow.showReport';
    statusBarItem.show();
    
    // Add to subscriptions
    context.subscriptions.push(
        dataCollector,
        showReportCommand,
        toggleTrackingCommand,
        showBadgesCommand,
        enableCloudSyncCommand,
        configureAPICommand,
        trainTFModelCommand,
        statusBarItem
    );
    
    // Check for new badges periodically
    setInterval(() => {
        const activities = gamificationSystem.getActivitiesForLastWeek();
        gamificationSystem.checkForNewBadges(activities);
    }, 60000 * 60); // Check every hour
}

function runNodeScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, ...args]);
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Script exited with code ${code}: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

export function deactivate() {
    console.log('CodeFlow AI is now deactivated');
}