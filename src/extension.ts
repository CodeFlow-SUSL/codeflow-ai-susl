import * as vscode from 'vscode';
import { DataCollector } from './dataCollector';
import { AIAnalyzer } from './aiAnalyzer';
import { VisualizationPanel } from './visualization';
import { GamificationSystem } from './gamification';
import { BackendServices } from './backendServices';

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
    
    // Add to subscriptions
    context.subscriptions.push(showReportCommand);
}

export function deactivate() {
    console.log('CodeFlow AI is now deactivated');
}