import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { CodingActivity } from './dataCollector';
import { GeminiService } from './geminiService';

// Re-export for convenience
export { CodingActivity };

export interface ProductivityInsight {
    productivityScore: number;
    mostUsedCommands: { command: string; count: number }[];
    mostWorkedFiles: { file: string; time: number }[];
    languageDistribution: { language: string; percentage: number }[];
    suggestions: string[];
    tfInsights?: {
        featureImportance: { [key: string]: number };
        tfScore: number;
    };
    dailyCodingMinutes: { date: string; minutes: number }[];
    totalActiveMinutes: number;
    streakDays: number;
    totalKeystrokes: number;
    totalCommandsExecuted: number;
    uniqueFilesWorked: number;
    uniqueLanguages: number;
    activeHourRange: { earliest: number | null; latest: number | null };
    fileSwitchCount: number;
}

interface TimeMetrics {
    dailyCodingMinutes: { date: string; minutes: number }[];
    totalActiveMinutes: number;
    streakDays: number;
    earliestHour: number | null;
    latestHour: number | null;
    fileSwitchCount: number;
    fileDurations: Map<string, number>;
}

export class AIAnalyzer {
    private context: vscode.ExtensionContext;
    private useExternalAPI: boolean = false;
    private apiEndpoint: string = '';
    private apiKey: string = '';
    private useTFModel: boolean = false;
    private geminiService: GeminiService;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.geminiService = new GeminiService();
        
        // Check if external API is configured
        const config = vscode.workspace.getConfiguration('codeflow');
        this.useExternalAPI = config.get('useExternalAPI', false);
        this.apiEndpoint = config.get('apiEndpoint', '');
        this.apiKey = config.get('apiKey', '');
        this.useTFModel = config.get('useTFModel', false);
    }

    public async analyzeData(days: number = 7): Promise<ProductivityInsight> {
        // Collect data for the specified number of days
        const activities: CodingActivity[] = [];
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayActivities = this.getActivitiesForDate(dateStr);
            activities.push(...dayActivities);
        }

        // Choose analysis method based on configuration
        let insight: ProductivityInsight;
        if (this.useExternalAPI && this.apiEndpoint && this.apiKey) {
            insight = await this.analyzeWithExternalAPI(activities, days);
        } else if (this.useTFModel) {
            insight = await this.analyzeWithTFModel(activities, days);
        } else {
            insight = this.performLocalAnalysis(activities, days);
        }

        // Generate AI-powered suggestions using Gemini if enabled
        if (this.geminiService.isGeminiEnabled()) {
            try {
                const geminiInsights = await this.geminiService.generateInsights(insight, activities);
                
                // Combine all insights into suggestions array
                insight.suggestions = [
                    ...geminiInsights.codeImprovements.map(s => `💡 Code Improvement: ${s}`),
                    ...geminiInsights.performanceTips.map(s => `⚡ Performance: ${s}`),
                    ...geminiInsights.badPracticeWarnings.map(s => `⚠️ Warning: ${s}`),
                    ...geminiInsights.refactoringIdeas.map(s => `🔧 Refactoring: ${s}`),
                    ...geminiInsights.productivityHints.map(s => `🎯 Productivity: ${s}`)
                ];
            } catch (error) {
                console.error('Error generating Gemini insights:', error);
                // Keep existing suggestions or add basic ones
                if (insight.suggestions.length === 0) {
                    insight.suggestions = this.generateBasicSuggestions(insight);
                }
            }
        } else if (insight.suggestions.length === 0) {
            // Generate basic suggestions if no AI is enabled
            insight.suggestions = this.generateBasicSuggestions(insight);
        }

        return insight;
    }

    private getActivitiesForDate(date: string): CodingActivity[] {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, `activity-${date}.json`);
        
        if (!fs.existsSync(filePath)) {
            return [];
        }
        
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    private async analyzeWithExternalAPI(activities: CodingActivity[], daysRequested: number): Promise<ProductivityInsight> {
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

            const insight = await response.json() as ProductivityInsight;
            return this.mergeWithDerivedMetrics(insight, activities, daysRequested);
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing data with external API: ${error}`);
            // Fall back to local analysis
            return this.performLocalAnalysis(activities, daysRequested);
        }
    }

    private async analyzeWithTFModel(activities: CodingActivity[], daysRequested: number): Promise<ProductivityInsight> {
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
            const localInsight = this.performLocalAnalysis(activities, daysRequested);
            
            // Combine TensorFlow.js results with local insights
            return {
                ...localInsight,
                productivityScore: tfResult.score,
                tfInsights: {
                    featureImportance: tfResult.featureImportance,
                    tfScore: tfResult.score
                }
            };
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing data with TensorFlow.js model: ${error}`);
            // Fall back to local analysis
            return this.performLocalAnalysis(activities, daysRequested);
        }
    }

    private prepareTFData(activities: CodingActivity[]): any {
        // Group activities by session (within 30 minutes)
        const sortedActivities = [...activities].sort((a, b) => a.timestamp - b.timestamp);
        const sessions: any[] = [];
        let currentSession: any = null;
        
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
            if (activity.keystrokes) {
                currentSession.keystrokes += activity.keystrokes;
            }
            if (activity.command) {
                currentSession.commands++;
            }
            if (activity.file) {
                currentSession.files.add(activity.file);
            }
            if (activity.language) {
                currentSession.languages.add(activity.language);
            }
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

    private runNodeScript(scriptPath: string, args: string[]): Promise<string> {
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

    private performLocalAnalysis(activities: CodingActivity[], daysRequested: number): ProductivityInsight {
        // Calculate productivity score (0-100)
        const productivityScore = this.calculateProductivityScore(activities);

        // Aggregate command and keystroke activity
        const commandCounts: Record<string, number> = {};
        const fileCounts: Record<string, number> = {};
        const languageCounts: Record<string, number> = {};
        const filesWorked = new Set<string>();
        const languagesWorked = new Set<string>();
        let totalKeystrokes = 0;

        activities.forEach(activity => {
            if (activity.command) {
                commandCounts[activity.command] = (commandCounts[activity.command] || 0) + 1;
            }
            if (activity.file) {
                fileCounts[activity.file] = (fileCounts[activity.file] || 0) + 1;
                filesWorked.add(activity.file);
            }
            if (activity.language) {
                languageCounts[activity.language] = (languageCounts[activity.language] || 0) + 1;
                languagesWorked.add(activity.language);
            }
            if (activity.keystrokes) {
                totalKeystrokes += activity.keystrokes;
            }
        });

        const totalCommandsExecuted = Object.values(commandCounts).reduce((sum, count) => sum + count, 0);

        const mostUsedCommands = Object.entries(commandCounts)
            .map(([command, count]) => ({ command, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const timeMetrics = this.computeTimeMetrics(activities, daysRequested);
        let mostWorkedFiles = Array.from(timeMetrics.fileDurations.entries())
            .map(([file, minutes]) => ({ file, time: Number(minutes.toFixed(1)) }))
            .sort((a, b) => b.time - a.time)
            .slice(0, 5);

        // Fallback to interaction counts if timing information is limited
        if (mostWorkedFiles.length === 0 && Object.keys(fileCounts).length > 0) {
            mostWorkedFiles = Object.entries(fileCounts)
                .map(([file, time]) => ({ file, time }))
                .sort((a, b) => b.time - a.time)
                .slice(0, 5);
        }

        const totalLanguageActivities = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
        const languageDistribution = totalLanguageActivities === 0
            ? []
            : Object.entries(languageCounts)
                .map(([language, count]) => ({
                    language,
                    percentage: Math.round((count / totalLanguageActivities) * 100)
                }))
                .sort((a, b) => b.percentage - a.percentage);

        const suggestions: string[] = [];

        return {
            productivityScore,
            mostUsedCommands,
            mostWorkedFiles,
            languageDistribution,
            suggestions,
            dailyCodingMinutes: timeMetrics.dailyCodingMinutes,
            totalActiveMinutes: timeMetrics.totalActiveMinutes,
            streakDays: timeMetrics.streakDays,
            totalKeystrokes,
            totalCommandsExecuted,
            uniqueFilesWorked: filesWorked.size,
            uniqueLanguages: languagesWorked.size,
            activeHourRange: {
                earliest: timeMetrics.earliestHour,
                latest: timeMetrics.latestHour
            },
            fileSwitchCount: timeMetrics.fileSwitchCount
        };
    }

    private mergeWithDerivedMetrics(
        baseInsight: ProductivityInsight,
        activities: CodingActivity[],
        daysRequested: number
    ): ProductivityInsight {
        const localInsight = this.performLocalAnalysis(activities, daysRequested);

        return {
            ...localInsight,
            ...baseInsight,
            mostUsedCommands: baseInsight.mostUsedCommands?.length ? baseInsight.mostUsedCommands : localInsight.mostUsedCommands,
            mostWorkedFiles: baseInsight.mostWorkedFiles?.length ? baseInsight.mostWorkedFiles : localInsight.mostWorkedFiles,
            languageDistribution: baseInsight.languageDistribution?.length ? baseInsight.languageDistribution : localInsight.languageDistribution,
            suggestions: baseInsight.suggestions?.length ? baseInsight.suggestions : localInsight.suggestions,
            dailyCodingMinutes: baseInsight.dailyCodingMinutes?.length ? baseInsight.dailyCodingMinutes : localInsight.dailyCodingMinutes,
            totalActiveMinutes: baseInsight.totalActiveMinutes ?? localInsight.totalActiveMinutes,
            streakDays: baseInsight.streakDays ?? localInsight.streakDays,
            totalKeystrokes: baseInsight.totalKeystrokes ?? localInsight.totalKeystrokes,
            totalCommandsExecuted: baseInsight.totalCommandsExecuted ?? localInsight.totalCommandsExecuted,
            uniqueFilesWorked: baseInsight.uniqueFilesWorked ?? localInsight.uniqueFilesWorked,
            uniqueLanguages: baseInsight.uniqueLanguages ?? localInsight.uniqueLanguages,
            activeHourRange: baseInsight.activeHourRange ?? localInsight.activeHourRange,
            fileSwitchCount: baseInsight.fileSwitchCount ?? localInsight.fileSwitchCount
        };
    }

    private computeTimeMetrics(activities: CodingActivity[], daysRequested: number): TimeMetrics {
        const dayMap = new Map<string, number>();
        const dayOrder: string[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalDays = Math.max(1, daysRequested);
        for (let offset = totalDays - 1; offset >= 0; offset--) {
            const date = new Date(today);
            date.setDate(today.getDate() - offset);
            const dateKey = date.toISOString().split('T')[0];
            dayMap.set(dateKey, 0);
            dayOrder.push(dateKey);
        }

        if (activities.length === 0) {
            const baseline = dayOrder.map(date => ({ date, minutes: 0 }));
            return {
                dailyCodingMinutes: baseline,
                totalActiveMinutes: 0,
                streakDays: 0,
                earliestHour: null as number | null,
                latestHour: null as number | null,
                fileSwitchCount: 0,
                fileDurations: new Map<string, number>()
            };
        }

        const sortedActivities = [...activities].sort((a, b) => a.timestamp - b.timestamp);
        const fileDurations = new Map<string, number>();
        const MAX_CONTINUOUS_GAP = 10 * 60 * 1000; // 10 minutes
        const SESSION_PADDING = 5 * 60 * 1000; // 5 minutes

        let earliestHour: number | null = null;
        let latestHour: number | null = null;
        let fileSwitchCount = 0;
        let previous: CodingActivity | undefined;

        const addMinutes = (timestamp: number, minutes: number, file?: string) => {
            const dateKey = new Date(timestamp).toISOString().split('T')[0];
            if (!dayMap.has(dateKey)) {
                dayMap.set(dateKey, 0);
                dayOrder.push(dateKey);
            }
            dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + minutes);
            if (file) {
                fileDurations.set(file, (fileDurations.get(file) || 0) + minutes);
            }
        };

        for (const activity of sortedActivities) {
            const hour = new Date(activity.timestamp).getHours();
            earliestHour = earliestHour === null ? hour : Math.min(earliestHour, hour);
            latestHour = latestHour === null ? hour : Math.max(latestHour, hour);

            if (!previous) {
                previous = activity;
                continue;
            }

            const diff = activity.timestamp - previous.timestamp;
            let minutesToAdd = 0;

            if (diff > 0) {
                if (diff <= MAX_CONTINUOUS_GAP) {
                    minutesToAdd = diff / 60000;
                } else {
                    minutesToAdd = SESSION_PADDING / 60000;
                }
            }

            if (minutesToAdd > 0) {
                addMinutes(previous.timestamp, minutesToAdd, previous.file);
            }

            if (previous.file && activity.file && previous.file !== activity.file) {
                fileSwitchCount++;
            }

            previous = activity;
        }

        if (previous) {
            const paddingMinutes = SESSION_PADDING / 60000;
            addMinutes(previous.timestamp, paddingMinutes, previous.file);
        }

        const uniqueDayOrder = Array.from(new Set(dayOrder)).sort();
        if (uniqueDayOrder.length > totalDays) {
            uniqueDayOrder.splice(0, uniqueDayOrder.length - totalDays);
        }
        const dailyCodingMinutes = uniqueDayOrder.map(date => ({
            date,
            minutes: Number(((dayMap.get(date) || 0)).toFixed(1))
        }));

        const totalActiveMinutes = dailyCodingMinutes.reduce((sum, day) => sum + day.minutes, 0);

        let streakDays = 0;
        for (let i = dailyCodingMinutes.length - 1; i >= 0; i--) {
            if (dailyCodingMinutes[i].minutes > 0) {
                streakDays++;
            } else {
                break;
            }
        }

        return {
            dailyCodingMinutes,
            totalActiveMinutes,
            streakDays,
            earliestHour,
            latestHour,
            fileSwitchCount,
            fileDurations
        };
    }
    private calculateProductivityScore(activities: CodingActivity[]): number {
        if (activities.length === 0) {
            return 0;
        }
        
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

    private generateBasicSuggestions(insight: ProductivityInsight): string[] {
        const suggestions: string[] = [];

        // Productivity score based suggestions
        if (insight.productivityScore < 50) {
            suggestions.push('💡 Code Improvement: Try to maintain consistent coding sessions to improve productivity.');
        } else if (insight.productivityScore > 80) {
            suggestions.push('🎯 Productivity: Excellent productivity! Keep maintaining your current coding habits.');
        }

        // Streak based suggestions
        if (insight.streakDays === 0) {
            suggestions.push('🎯 Productivity: Start a coding streak by committing to daily practice.');
        } else if (insight.streakDays >= 7) {
            suggestions.push(`🎯 Productivity: Amazing ${insight.streakDays}-day streak! Consistency is key to mastery.`);
        }

        // File switching suggestions
        if (insight.fileSwitchCount > 50) {
            suggestions.push('⚠️ Warning: High file switching detected. Consider focusing on one task at a time.');
            suggestions.push('🔧 Refactoring: Group related functionality to reduce context switching.');
        }

        // Language diversity suggestions
        if (insight.uniqueLanguages > 3) {
            suggestions.push('💡 Code Improvement: Working with multiple languages? Ensure consistent coding standards across all.');
        }

        // Active hours suggestions
        if (insight.activeHourRange.latest && insight.activeHourRange.earliest) {
            const range = insight.activeHourRange.latest - insight.activeHourRange.earliest;
            if (range > 12) {
                suggestions.push('⚠️ Warning: Long coding hours detected. Remember to take regular breaks.');
            }
        }

        // General suggestions
        suggestions.push('⚡ Performance: Use keyboard shortcuts to speed up common operations.');
        suggestions.push('💡 Code Improvement: Regularly review and refactor code to maintain quality.');
        suggestions.push('🔧 Refactoring: Extract repeated patterns into reusable components.');

        return suggestions;
    }
}