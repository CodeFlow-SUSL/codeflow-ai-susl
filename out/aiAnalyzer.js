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
const child_process_1 = require("child_process");
class AIAnalyzer {
    context;
    useExternalAPI = false;
    apiEndpoint = '';
    apiKey = '';
    useTFModel = false;
    constructor(context) {
        this.context = context;
        // Check if external API is configured
        const config = vscode.workspace.getConfiguration('codeflow');
        this.useExternalAPI = config.get('useExternalAPI', false);
        this.apiEndpoint = config.get('apiEndpoint', '');
        this.apiKey = config.get('apiKey', '');
        this.useTFModel = config.get('useTFModel', false);
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
        else if (this.useTFModel) {
            return this.analyzeWithTFModel(activities);
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
    async analyzeWithTFModel(activities) {
        try {
            // Prepare data for TensorFlow.js model
            const tfData = this.prepareTFData(activities);
            // Get the path to the TensorFlow.js predict script
            const tfPath = path.join(this.context.extensionPath, 'ml', 'tfjs');
            const predictScript = path.join(tfPath, 'predict.js');
            // Write data to a temporary file
            const tempDataPath = path.join(tfPath, 'temp_data.json');
            fs.writeFileSync(tempDataPath, JSON.stringify(tfData));
            // Run the Node.js script
            const result = await this.runNodeScript(predictScript, [tempDataPath]);
            // Parse the result
            const tfResult = JSON.parse(result);
            // Get local analysis for additional insights
            const localInsight = this.performLocalAnalysis(activities);
            // Combine TensorFlow.js results with local insights
            return {
                ...localInsight,
                productivityScore: tfResult.score,
                tfInsights: {
                    featureImportance: tfResult.featureImportance,
                    tfScore: tfResult.score
                }
            };
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error analyzing data with TensorFlow.js model: ${error}`);
            // Fall back to local analysis
            return this.performLocalAnalysis(activities);
        }
    }
    prepareTFData(activities) {
        // Group activities by session (within 30 minutes)
        const sortedActivities = [...activities].sort((a, b) => a.timestamp - b.timestamp);
        const sessions = [];
        let currentSession = null;
        for (const activity of sortedActivities) {
            if (!currentSession || activity.timestamp - currentSession.lastActivity > 30 * 60 * 1000) {
                // Start new session
                currentSession = {
                    start_time: activity.timestamp,
                    lastActivity: activity.timestamp,
                    keystrokes: 0,
                    commands: 0,
                    files: new Set(),
                    languages: new Set()
                };
                sessions.push(currentSession);
            }
            // Update session data
            currentSession.lastActivity = activity.timestamp;
            if (activity.keystrokes)
                currentSession.keystrokes += activity.keystrokes;
            if (activity.command)
                currentSession.commands++;
            if (activity.file)
                currentSession.files.add(activity.file);
            if (activity.language)
                currentSession.languages.add(activity.language);
        }
        // Convert sessions to TF input format
        const tfSessions = sessions.map(session => {
            const duration = (session.lastActivity - session.start_time) / (1000 * 60); // in minutes
            return {
                hour: new Date(session.start_time).getHours(),
                dayOfWeek: new Date(session.start_time).getDay(),
                dayOfMonth: new Date(session.start_time).getDate(),
                keystrokes: session.keystrokes,
                commands: session.commands,
                files: session.files.size,
                languages: session.languages.size,
                duration: duration,
                keystrokesPerMinute: session.keystrokes / duration,
                commandsPerMinute: session.commands / duration,
                filesPerMinute: session.files.size / duration
            };
        });
        // Aggregate all sessions to get overall features
        const totalKeystrokes = tfSessions.reduce((sum, session) => sum + session.keystrokes, 0);
        const totalCommands = tfSessions.reduce((sum, session) => sum + session.commands, 0);
        const totalFiles = new Set(tfSessions.flatMap(session => Array.from({ length: session.files }))).size;
        const totalLanguages = new Set(tfSessions.flatMap(session => Array.from({ length: session.languages }))).size;
        const totalDuration = tfSessions.reduce((sum, session) => sum + session.duration, 0);
        return {
            hour: tfSessions.length > 0 ? tfSessions[0].hour : 0,
            dayOfWeek: tfSessions.length > 0 ? tfSessions[0].dayOfWeek : 0,
            dayOfMonth: tfSessions.length > 0 ? tfSessions[0].dayOfMonth : 0,
            keystrokes: totalKeystrokes,
            commands: totalCommands,
            files: totalFiles,
            languages: totalLanguages,
            duration: totalDuration,
            keystrokesPerMinute: totalDuration > 0 ? totalKeystrokes / totalDuration : 0,
            commandsPerMinute: totalDuration > 0 ? totalCommands / totalDuration : 0,
            filesPerMinute: totalDuration > 0 ? totalFiles / totalDuration : 0
        };
    }
    runNodeScript(scriptPath, args) {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)('node', [scriptPath, ...args]);
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