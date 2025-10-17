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

    // Add to subscriptions
    context.subscriptions.push(showReportCommand, toggleTrackingCommand, showBadgesCommand);
}

export function deactivate() {
    console.log('CodeFlow AI is now deactivated');
}