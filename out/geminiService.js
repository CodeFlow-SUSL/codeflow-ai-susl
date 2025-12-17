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
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const vscode = __importStar(require("vscode"));
class GeminiService {
    genAI = null;
    model = null;
    isEnabled = false;
    constructor() {
        this.initialize();
    }
    initialize() {
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('useGeminiAI', false);
        const apiKey = config.get('geminiApiKey', '');
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
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            // Use the latest Gemini 2.5 Flash model
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            console.log('Gemini AI initialized successfully with model: gemini-2.5-flash');
        }
        catch (error) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('Error initializing Gemini AI:', errorMessage);
            console.error('Full error:', error);
            vscode.window.showErrorMessage(`Failed to initialize Gemini AI: ${errorMessage}`);
            this.isEnabled = false;
        }
    }
    async generateInsights(insight, activities) {
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
        }
        catch (error) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('Error generating Gemini insights:', errorMessage);
            console.error('Full error:', error);
            // Show more specific error messages based on error type
            if (errorMessage.toLowerCase().includes('api key') || errorMessage.includes('401')) {
                vscode.window.showErrorMessage('Invalid Gemini API key. Please check your settings.');
            }
            else if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('exceeded') || errorMessage.includes('429')) {
                vscode.window.showWarningMessage('Gemini API quota or rate limit exceeded. Using fallback suggestions. Try again later.');
            }
            else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('econnrefused') || errorMessage.toLowerCase().includes('timeout')) {
                vscode.window.showWarningMessage('Network error connecting to Gemini API. Check your internet connection. Using fallback suggestions.');
            }
            else if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
                vscode.window.showErrorMessage('Gemini model not found. The API may have been updated. Using fallback suggestions.');
            }
            else {
                vscode.window.showWarningMessage(`Failed to generate AI insights: ${errorMessage}. Using fallback suggestions.`);
            }
            return this.getFallbackInsights(insight);
        }
    }
    prepareContext(insight, activities) {
        // Get unique files and languages
        const files = new Set(activities.filter(a => a.file).map(a => a.file));
        const languages = insight.languageDistribution.map(l => l.language).join(', ');
        // Calculate activity patterns
        const hourlyActivity = this.analyzeHourlyActivity(activities);
        const fileTypes = this.analyzeFileTypes(Array.from(files).filter((f) => f !== undefined));
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
    analyzeHourlyActivity(activities) {
        const hourCounts = {};
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
        return `Most active hours: ${sortedHours.map(([hour, count]) => `${hour}:00 (${count} activities)`).join(', ')}`;
    }
    analyzeFileTypes(files) {
        const extensions = {};
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
        return sortedExts.map(([ext, count]) => `${ext}: ${count} files`).join(', ');
    }
    async queryGeminiForInsights(context) {
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
            }
            catch (parseError) {
                console.error('Error parsing Gemini JSON response:', parseError.message);
                console.log('Raw response (first 500 chars):', text.substring(0, 500));
                // Try to extract insights from plain text
                return this.parseTextResponse(text);
            }
        }
        catch (apiError) {
            console.error('Gemini API request failed:', apiError.message);
            throw new Error(`Gemini API error: ${apiError.message || 'Unknown API error'}`);
        }
    }
    parseTextResponse(text) {
        // Simple text parsing fallback
        const codeImprovements = [];
        const performanceTips = [];
        const badPracticeWarnings = [];
        const refactoringIdeas = [];
        const productivityHints = [];
        const lines = text.split('\n').filter(line => line.trim());
        let currentCategory = null;
        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('code improvement') || lowerLine.includes('improvement suggestion')) {
                currentCategory = codeImprovements;
            }
            else if (lowerLine.includes('performance tip')) {
                currentCategory = performanceTips;
            }
            else if (lowerLine.includes('bad practice') || lowerLine.includes('warning')) {
                currentCategory = badPracticeWarnings;
            }
            else if (lowerLine.includes('refactoring')) {
                currentCategory = refactoringIdeas;
            }
            else if (lowerLine.includes('productivity hint') || lowerLine.includes('productivity tip')) {
                currentCategory = productivityHints;
            }
            else if (currentCategory && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
                const cleaned = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                if (cleaned && currentCategory.length < 5) {
                    currentCategory.push(cleaned);
                }
            }
        });
        return {
            codeImprovements: codeImprovements.length > 0 ? codeImprovements : this.getDefaultCodeImprovements(),
            performanceTips: performanceTips.length > 0 ? performanceTips : this.getDefaultPerformanceTips(),
            badPracticeWarnings: badPracticeWarnings.length > 0 ? badPracticeWarnings : this.getDefaultWarnings(),
            refactoringIdeas: refactoringIdeas.length > 0 ? refactoringIdeas : this.getDefaultRefactoringIdeas(),
            productivityHints: productivityHints.length > 0 ? productivityHints : this.getDefaultProductivityHints()
        };
    }
    getFallbackInsights(insight) {
        return {
            codeImprovements: this.getContextualCodeImprovements(insight),
            performanceTips: this.getContextualPerformanceTips(insight),
            badPracticeWarnings: this.getContextualWarnings(insight),
            refactoringIdeas: this.getContextualRefactoringIdeas(insight),
            productivityHints: this.getContextualProductivityHints(insight)
        };
    }
    getContextualCodeImprovements(insight) {
        const improvements = [];
        if (insight.languageDistribution.length > 0) {
            const topLang = insight.languageDistribution[0].language;
            improvements.push(`Consider using ${topLang}-specific linters and formatters to maintain code quality.`);
        }
        if (insight.fileSwitchCount > 50) {
            improvements.push('High file switch count detected. Consider organizing related code into modules.');
        }
        improvements.push('Use consistent naming conventions across your codebase.');
        improvements.push('Add comprehensive comments for complex logic blocks.');
        improvements.push('Implement proper error handling in critical sections.');
        return improvements.slice(0, 5);
    }
    getContextualPerformanceTips(insight) {
        const tips = [];
        if (insight.activeHourRange.latest && insight.activeHourRange.earliest) {
            const range = insight.activeHourRange.latest - insight.activeHourRange.earliest;
            if (range > 10) {
                tips.push('Consider focusing your coding sessions during peak productivity hours.');
            }
        }
        if (insight.fileSwitchCount > 30) {
            tips.push('Reduce context switching by completing tasks in one file before moving to another.');
        }
        tips.push('Use keyboard shortcuts to speed up common operations.');
        tips.push('Leverage code snippets and templates for repetitive patterns.');
        return tips.slice(0, 4);
    }
    getContextualWarnings(insight) {
        const warnings = [];
        if (insight.streakDays === 0) {
            warnings.push('No coding streak detected. Try to code consistently to build momentum.');
        }
        if (insight.totalActiveMinutes < 60 && insight.dailyCodingMinutes.length > 2) {
            warnings.push('Low coding time detected. Consider setting dedicated coding blocks.');
        }
        if (insight.fileSwitchCount > 100) {
            warnings.push('Excessive file switching may indicate scattered focus or unclear task planning.');
        }
        return warnings.slice(0, 3);
    }
    getContextualRefactoringIdeas(insight) {
        const ideas = [];
        if (insight.mostWorkedFiles.length > 0) {
            const topFile = insight.mostWorkedFiles[0];
            if (topFile.time > 60) {
                ideas.push(`Consider breaking down ${topFile.file} into smaller, more manageable modules.`);
            }
        }
        ideas.push('Extract repeated code patterns into reusable functions.');
        ideas.push('Review and simplify complex conditional logic.');
        ideas.push('Consider using design patterns for better code organization.');
        return ideas.slice(0, 4);
    }
    getContextualProductivityHints(insight) {
        const hints = [];
        if (insight.streakDays > 0) {
            hints.push(`Great job maintaining a ${insight.streakDays}-day streak! Keep the momentum going.`);
        }
        if (insight.uniqueLanguages > 1) {
            hints.push('Working with multiple languages? Document language-specific conventions for quick reference.');
        }
        hints.push('Take regular breaks to maintain focus and prevent burnout.');
        hints.push('Use VS Code extensions to automate repetitive tasks.');
        hints.push('Set daily coding goals to track progress and stay motivated.');
        return hints.slice(0, 5);
    }
    /**
     * Test the Gemini API connection
     */
    async testConnection() {
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
        }
        catch (error) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('Connection test failed:', errorMessage);
            return {
                success: false,
                message: `Connection failed: ${errorMessage}`
            };
        }
    }
    getDefaultCodeImprovements() {
        return [
            'Use consistent code formatting across all files.',
            'Add meaningful comments to complex logic.',
            'Follow SOLID principles for better maintainability.',
            'Implement unit tests for critical functions.',
            'Use version control best practices with clear commit messages.'
        ];
    }
    getDefaultPerformanceTips() {
        return [
            'Master keyboard shortcuts for common operations.',
            'Use multi-cursor editing for batch changes.',
            'Leverage IntelliSense and autocomplete features.',
            'Set up custom code snippets for frequent patterns.'
        ];
    }
    getDefaultWarnings() {
        return [
            'Avoid deeply nested code structures - consider refactoring.',
            'Watch out for code duplication - extract common patterns.',
            'Be mindful of large file sizes - split when necessary.'
        ];
    }
    getDefaultRefactoringIdeas() {
        return [
            'Extract long methods into smaller, focused functions.',
            'Consider using dependency injection for better testability.',
            'Review and update outdated dependencies.',
            'Simplify complex conditional statements.'
        ];
    }
    getDefaultProductivityHints() {
        return [
            'Set specific coding goals for each session.',
            'Use the Pomodoro Technique for focused work periods.',
            'Keep a coding journal to track progress and learnings.',
            'Minimize distractions during deep work sessions.',
            'Review and refactor code regularly to maintain quality.'
        ];
    }
    isGeminiEnabled() {
        return this.isEnabled && this.model !== null;
    }
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=geminiService.js.map