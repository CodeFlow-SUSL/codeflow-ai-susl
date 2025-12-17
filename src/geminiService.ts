import { GoogleGenerativeAI } from '@google/generative-ai';
import * as vscode from 'vscode';
import { ProductivityInsight } from './aiAnalyzer';
import { CodingActivity } from './dataCollector';

export interface GeminiInsights {
    codeImprovements: string[];
    performanceTips: string[];
    badPracticeWarnings: string[];
    refactoringIdeas: string[];
    productivityHints: string[];
}

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private isEnabled: boolean = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('useGeminiAI', false);
        const apiKey = config.get<string>('geminiApiKey', '');

        console.log('Initializing Gemini Service...');
        console.log('Gemini AI Enabled:', this.isEnabled);
        console.log('API Key Present:', !!apiKey);

        if (!this.isEnabled) {
            console.log('Gemini AI is disabled in settings (codeflow.useGeminiAI)');
            return;
        }

        if (!apiKey || apiKey.trim() === '') {
            console.error('Gemini API key is missing or empty');
            vscode.window.showErrorMessage('Gemini API key not configured. Please set codeflow.geminiApiKey in settings.');
            this.isEnabled = false;
            return;
        }

        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            // Use the latest Gemini 2.5 Flash model
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            console.log('Gemini AI initialized successfully with model: gemini-2.5-flash');
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('Error initializing Gemini AI:', errorMessage);
            console.error('Full error:', error);
            vscode.window.showErrorMessage(`Failed to initialize Gemini AI: ${errorMessage}`);
            this.isEnabled = false;
        }
    }

    public async generateInsights(
        insight: ProductivityInsight,
        activities: CodingActivity[]
    ): Promise<GeminiInsights> {
        if (!this.isEnabled) {
            console.log('Gemini AI is disabled in settings');
            return this.getFallbackInsights(insight);
        }

        if (!this.model) {
            console.error('Gemini model not initialized. Check API key configuration.');
            vscode.window.showErrorMessage('Gemini AI model not initialized. Please check your API key in settings.');
            return this.getFallbackInsights(insight);
        }

        try {
            console.log('Generating Gemini AI insights...');
            
            // Prepare context for Gemini
            const context = this.prepareContext(insight, activities);
            
            // Generate insights using Gemini AI
            const insights = await this.queryGeminiForInsights(context);
            
            console.log('Successfully generated Gemini insights');
            return insights;
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('Error generating Gemini insights:', errorMessage);
            console.error('Full error:', error);
            
            // Show more specific error messages based on error type
            if (errorMessage.toLowerCase().includes('api key') || errorMessage.includes('401')) {
                vscode.window.showErrorMessage('Invalid Gemini API key. Please check your settings.');
            } else if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('exceeded') || errorMessage.includes('429')) {
                vscode.window.showWarningMessage('Gemini API quota or rate limit exceeded. Using fallback suggestions. Try again later.');
            } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('econnrefused') || errorMessage.toLowerCase().includes('timeout')) {
                vscode.window.showWarningMessage('Network error connecting to Gemini API. Check your internet connection. Using fallback suggestions.');
            } else if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
                vscode.window.showErrorMessage('Gemini model not found. The API may have been updated. Using fallback suggestions.');
            } else {
                vscode.window.showWarningMessage(`Failed to generate AI insights: ${errorMessage}. Using fallback suggestions.`);
            }
            
            return this.getFallbackInsights(insight);
        }
    }

    private prepareContext(insight: ProductivityInsight, activities: CodingActivity[]): string {
        // Get unique files and languages
        const files = new Set(activities.filter(a => a.file).map(a => a.file));
        const languages = insight.languageDistribution.map(l => l.language).join(', ');
        
        // Calculate activity patterns
        const hourlyActivity = this.analyzeHourlyActivity(activities);
        const fileTypes = this.analyzeFileTypes(Array.from(files).filter((f): f is string => f !== undefined));
        
        return `
Analyze this developer's coding patterns and provide actionable insights:

**Productivity Metrics:**
- Productivity Score: ${insight.productivityScore}/100
- Total Active Time: ${(insight.totalActiveMinutes / 60).toFixed(1)} hours
- Streak: ${insight.streakDays} days
- Active Hours: ${insight.activeHourRange.earliest ?? 'N/A'}:00 - ${insight.activeHourRange.latest ?? 'N/A'}:00

**Coding Behavior:**
- Languages Used: ${languages || 'Various'}
- Total Keystrokes: ${insight.totalKeystrokes}
- Commands Executed: ${insight.totalCommandsExecuted}
- Unique Files: ${insight.uniqueFilesWorked}
- File Switches: ${insight.fileSwitchCount}

**Top Commands:**
${insight.mostUsedCommands.map((cmd, i) => `${i + 1}. ${cmd.command} (${cmd.count} times)`).join('\n')}

**Top Files:**
${insight.mostWorkedFiles.map((file, i) => `${i + 1}. ${file.file} (${file.time} min)`).join('\n')}

**Activity Patterns:**
${hourlyActivity}

**File Types Worked:**
${fileTypes}

Please provide specific, actionable insights in these categories:
1. Code Improvement Suggestions (3-5 specific suggestions)
2. Performance Tips (2-4 tips to improve development speed)
3. Bad Practice Warnings (2-3 potential issues to watch out for)
4. Refactoring Ideas (2-4 areas that might benefit from refactoring)
5. Productivity Hints (3-5 tips to boost productivity)

Format your response EXACTLY as JSON with these keys:
{
  "codeImprovements": ["suggestion1", "suggestion2", ...],
  "performanceTips": ["tip1", "tip2", ...],
  "badPracticeWarnings": ["warning1", "warning2", ...],
  "refactoringIdeas": ["idea1", "idea2", ...],
  "productivityHints": ["hint1", "hint2", ...]
}

Keep each item concise (1-2 sentences) and actionable.
`;
    }

    private analyzeHourlyActivity(activities: CodingActivity[]): string {
        const hourCounts: Record<number, number> = {};
        
        activities.forEach(activity => {
            const hour = new Date(activity.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const sortedHours = Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (sortedHours.length === 0) {
            return 'No clear activity pattern detected';
        }

        return `Most active hours: ${sortedHours.map(([hour, count]) => 
            `${hour}:00 (${count} activities)`
        ).join(', ')}`;
    }

    private analyzeFileTypes(files: string[]): string {
        const extensions: Record<string, number> = {};
        
        files.forEach(file => {
            const ext = file.split('.').pop()?.toLowerCase() || 'unknown';
            extensions[ext] = (extensions[ext] || 0) + 1;
        });

        const sortedExts = Object.entries(extensions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedExts.length === 0) {
            return 'No file types detected';
        }

        return sortedExts.map(([ext, count]) => 
            `${ext}: ${count} files`
        ).join(', ');
    }

    private async queryGeminiForInsights(context: string): Promise<GeminiInsights> {
        if (!this.model) {
            throw new Error('Gemini model not initialized');
        }

        try {
            console.log('Sending request to Gemini API (model: gemini-2.5-flash)...');
            const result = await this.model.generateContent(context);
            const response = await result.response;
            const text = response.text();

            console.log('Received response from Gemini API');
            console.log('Response length:', text.length);

            // Try to parse JSON from the response
            try {
                // Remove markdown code blocks if present
                const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const insights = JSON.parse(jsonText);

                // Validate the structure
                return {
                    codeImprovements: Array.isArray(insights.codeImprovements) 
                        ? insights.codeImprovements.slice(0, 5) 
                        : [],
                    performanceTips: Array.isArray(insights.performanceTips) 
                        ? insights.performanceTips.slice(0, 4) 
                        : [],
                    badPracticeWarnings: Array.isArray(insights.badPracticeWarnings) 
                        ? insights.badPracticeWarnings.slice(0, 3) 
                        : [],
                    refactoringIdeas: Array.isArray(insights.refactoringIdeas) 
                        ? insights.refactoringIdeas.slice(0, 4) 
                        : [],
                    productivityHints: Array.isArray(insights.productivityHints) 
                        ? insights.productivityHints.slice(0, 5) 
                        : []
                };
            } catch (parseError: any) {
                console.error('Error parsing Gemini JSON response:', parseError.message);
                console.log('Raw response (first 500 chars):', text.substring(0, 500));
                
                // Try to extract insights from plain text
                return this.parseTextResponse(text);
            }
        } catch (apiError: any) {
            console.error('Gemini API request failed:', apiError.message);
            throw new Error(`Gemini API error: ${apiError.message || 'Unknown API error'}`);
        }
    }

    private parseTextResponse(text: string): GeminiInsights {
        // Simple text parsing fallback
        const codeImprovements: string[] = [];
        const performanceTips: string[] = [];
        const badPracticeWarnings: string[] = [];
        const refactoringIdeas: string[] = [];
        const productivityHints: string[] = [];

        const lines = text.split('\n').filter(line => line.trim());
        
        let currentCategory: string[] | null = null;

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            
            if (lowerLine.includes('code improvement') || lowerLine.includes('improvement suggestion')) {
                currentCategory = codeImprovements;
            } else if (lowerLine.includes('performance tip')) {
                currentCategory = performanceTips;
            } else if (lowerLine.includes('bad practice') || lowerLine.includes('warning')) {
                currentCategory = badPracticeWarnings;
            } else if (lowerLine.includes('refactoring')) {
                currentCategory = refactoringIdeas;
            } else if (lowerLine.includes('productivity hint') || lowerLine.includes('productivity tip')) {
                currentCategory = productivityHints;
            } else if (currentCategory && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
                const cleaned = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                if (cleaned && currentCategory.length < 5) {
                    currentCategory.push(cleaned);
                }
            }
        });

        return {
            codeImprovements,
            performanceTips,
            badPracticeWarnings,
            refactoringIdeas,
            productivityHints
        };
    }

    private getFallbackInsights(insight: ProductivityInsight): GeminiInsights {
        // Return empty insights with a message encouraging Gemini AI usage
        const enableMessage = '💡 Enable Gemini AI in settings (codeflow.useGeminiAI) and add your API key (codeflow.geminiApiKey) to get personalized, AI-powered insights based on your coding patterns.';
        
        return {
            codeImprovements: [enableMessage],
            performanceTips: [],
            badPracticeWarnings: [],
            refactoringIdeas: [],
            productivityHints: []
        };
    }











    /**
     * Test the Gemini API connection
     */
    public async testConnection(): Promise<{ success: boolean; message: string }> {
        if (!this.isEnabled) {
            return {
                success: false,
                message: 'Gemini AI is disabled. Enable it in settings (codeflow.useGeminiAI).'
            };
        }

        if (!this.model) {
            return {
                success: false,
                message: 'Gemini model not initialized. Check your API key configuration.'
            };
        }

        try {
            console.log('Testing Gemini API connection...');
            const result = await this.model.generateContent('Respond with "OK" if you can read this.');
            const response = await result.response;
            const text = response.text();
            
            console.log('Connection test response:', text);
            
            return {
                success: true,
                message: 'Successfully connected to Gemini API! ✓'
            };
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('Connection test failed:', errorMessage);
            
            return {
                success: false,
                message: `Connection failed: ${errorMessage}`
            };
        }
    }











    public isGeminiEnabled(): boolean {
        return this.isEnabled && this.model !== null;
    }
}
