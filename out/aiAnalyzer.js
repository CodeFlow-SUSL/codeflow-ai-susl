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
exports.AIAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class AIAnalyzer {
    context;
    useExternalAPI = false;
    apiEndpoint = '';
    apiKey = '';
    constructor(context) {
        this.context = context;
        // Check if external API is configured
        const config = vscode.workspace.getConfiguration('codeflow');
        this.useExternalAPI = config.get('useExternalAPI', false);
        this.apiEndpoint = config.get('apiEndpoint', '');
        this.apiKey = config.get('apiKey', '');
    }
    async analyzeData(days = 7) {
        // Collect data for the specified number of days
        const activities = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayActivities = this.getActivitiesForDate(dateStr);
            activities.push(...dayActivities);
        }
        // Choose analysis method based on configuration
        if (this.useExternalAPI && this.apiEndpoint && this.apiKey) {
            return this.analyzeWithExternalAPI(activities);
        }
        else {
            return this.performLocalAnalysis(activities);
        }
    }
    getActivitiesForDate(date) {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, `activity-${date}.json`);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    async analyzeWithExternalAPI(activities) {
        try {
            // Prepare data for API
            const apiData = {
                activities,
                analysisType: 'productivity'
            };
            // Call external API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(apiData)
            });
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const insight = await response.json();
            return insight;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error analyzing data with external API: ${error}`);
            // Fall back to local analysis
            return this.performLocalAnalysis(activities);
        }
    }
    performLocalAnalysis(activities) {
        // Calculate productivity score (0-100)
        const productivityScore = this.calculateProductivityScore(activities);
        // Find most used commands
        const commandCounts = {};
        activities.forEach(activity => {
            if (activity.command) {
                commandCounts[activity.command] = (commandCounts[activity.command] || 0) + 1;
            }
        });
        const mostUsedCommands = Object.entries(commandCounts)
            .map(([command, count]) => ({ command, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // Find most worked files
        const fileTimes = {};
        activities.forEach(activity => {
            if (activity.file) {
                fileTimes[activity.file] = (fileTimes[activity.file] || 0) + 1;
            }
        });
        const mostWorkedFiles = Object.entries(fileTimes)
            .map(([file, time]) => ({ file, time }))
            .sort((a, b) => b.time - a.time)
            .slice(0, 5);
        // Calculate language distribution
        const languageCounts = {};
        activities.forEach(activity => {
            if (activity.language) {
                languageCounts[activity.language] = (languageCounts[activity.language] || 0) + 1;
            }
        });
        const totalLanguageActivities = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
        const languageDistribution = Object.entries(languageCounts)
            .map(([language, count]) => ({
            language,
            percentage: Math.round((count / totalLanguageActivities) * 100)
        }))
            .sort((a, b) => b.percentage - a.percentage);
        // Generate suggestions
        const suggestions = this.generateSuggestions(activities, commandCounts, fileTimes);
        return {
            productivityScore,
            mostUsedCommands,
            mostWorkedFiles,
            languageDistribution,
            suggestions
        };
    }
    calculateProductivityScore(activities) {
        if (activities.length === 0)
            return 0;
        // Calculate based on various factors
        let score = 50; // Base score
        // Factor 1: Activity frequency (more activities = higher score, up to a point)
        const activityFactor = Math.min(activities.length / 100, 1) * 20;
        score += activityFactor;
        // Factor 2: Command diversity (using different commands is good)
        const commands = new Set(activities.filter(a => a.command).map(a => a.command));
        const commandFactor = Math.min(commands.size / 10, 1) * 15;
        score += commandFactor;
        // Factor 3: File diversity (working on different files)
        const files = new Set(activities.filter(a => a.file).map(a => a.file));
        const fileFactor = Math.min(files.size / 5, 1) * 15;
        score += fileFactor;
        return Math.round(Math.min(score, 100));
    }
    generateSuggestions(activities, commandCounts, fileTimes) {
        const suggestions = [];
        // Check for repetitive commands
        const totalCommands = Object.values(commandCounts).reduce((sum, count) => sum + count, 0);
        if (totalCommands > 0) {
            const mostUsedCommand = Object.entries(commandCounts)
                .sort((a, b) => b[1] - a[1])[0];
            if (mostUsedCommand[1] / totalCommands > 0.3) {
                suggestions.push(`You use "${mostUsedCommand[0]}" frequently. Consider creating a custom shortcut or snippet to save time.`);
            }
        }
        // Check for long sessions without breaks
        const sortedActivities = [...activities].sort((a, b) => a.timestamp - b.timestamp);
        let longSessionCount = 0;
        for (let i = 1; i < sortedActivities.length; i++) {
            const timeDiff = sortedActivities[i].timestamp - sortedActivities[i - 1].timestamp;
            if (timeDiff > 2 * 60 * 60 * 1000) { // 2 hours
                longSessionCount++;
            }
        }
        if (longSessionCount > 0) {
            suggestions.push("Consider taking regular breaks to maintain productivity and avoid burnout.");
        }
        // Check for file switching frequency
        const fileSwitches = activities.filter(a => a.file).length;
        if (fileSwitches > 100) {
            suggestions.push("You switch between files frequently. Consider using VS Code's split view or workspace features to work more efficiently.");
        }
        // Default suggestion if none triggered
        if (suggestions.length === 0) {
            suggestions.push("Great job maintaining a balanced workflow! Keep exploring new VS Code features to improve your productivity.");
        }
        return suggestions;
    }
}
exports.AIAnalyzer = AIAnalyzer;
//# sourceMappingURL=aiAnalyzer.js.map