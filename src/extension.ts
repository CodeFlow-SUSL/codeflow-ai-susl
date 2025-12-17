import * as vscode from 'vscode';
import { DataCollector } from './dataCollector';
import { AIAnalyzer } from './aiAnalyzer';
import { VisualizationPanel } from './visualization';
import { GamificationSystem } from './gamification';
import { BackendServices, BackendServicesModule } from './backendServices';
import { GeminiService } from './geminiService';
import { spawn } from 'child_process';
import * as path from 'path';

// TODO: Fix React component compilation issues
// import { LoginComponent } from './components/auth/LoginComponent';
// import { SignUpComponent } from './components/auth/SignUpComponent';
// import { AccountSettingsComponent } from './components/settings/AccountSettingsComponent';

// Global variable to hold backend services for cleanup
let backendServicesModuleInstance: BackendServicesModule | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('CodeFlow AI is now active');
    
    // Initialize components
    const dataCollector = new DataCollector(context);
    const aiAnalyzer = new AIAnalyzer(context);
    const visualizationPanel = new VisualizationPanel(context);
    const gamificationSystem = new GamificationSystem(context);
    const backendServices = new BackendServices(context);
    const backendServicesModule = new BackendServicesModule(context);
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
        } catch (error) {
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
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating report: ${error}`);
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
        } catch (error) {
            console.error('Training error:', error);
            vscode.window.showErrorMessage(`Error training TensorFlow.js model: ${error}`);
        }
    });

    const testGeminiCommand = vscode.commands.registerCommand('codeflow.testGeminiConnection', async () => {
        try {
            const geminiService = new GeminiService();
            
            // Show progress notification
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Testing Gemini AI Connection",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: "Connecting to Gemini API..." });
                
                const result = await geminiService.testConnection();
                
                if (result.success) {
                    vscode.window.showInformationMessage(
                        `✅ ${result.message}`,
                        'View Settings'
                    ).then(selection => {
                        if (selection === 'View Settings') {
                            vscode.commands.executeCommand('workbench.action.openSettings', 'codeflow');
                        }
                    });
                } else {
                    const action = await vscode.window.showErrorMessage(
                        `❌ ${result.message}`,
                        'Open Settings',
                        'Get API Key'
                    );
                    
                    if (action === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'codeflow.gemini');
                    } else if (action === 'Get API Key') {
                        vscode.env.openExternal(vscode.Uri.parse('https://makersuite.google.com/app/apikey'));
                    }
                }
            });
        } catch (error) {
            console.error('Gemini test error:', error);
            vscode.window.showErrorMessage(`Error testing Gemini connection: ${error}`);
        }
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
        } else {
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
    context.subscriptions.push(
        dataCollector,
        backendServicesModule,
        showReportCommand,
        trainTFModelCommand,
        testGeminiCommand,
        statusBarItem,
        configWatcher
    );
    
    // Check for new badges periodically
    setInterval(() => {
        const activities = gamificationSystem.getActivitiesForLastWeek();
        gamificationSystem.checkForNewBadges(activities);
    }, 60000 * 60); // Check every hour
}

function runNodeScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath, ...args], {
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
    
    // Clean up local server
    if (backendServicesModuleInstance) {
        backendServicesModuleInstance.stopLocalServer();
    }
}
// 