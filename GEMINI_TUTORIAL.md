# Step-by-Step: Creating AI Insights with Gemini

This tutorial walks you through exactly how CodeFlow generates AI-powered insights using Google Gemini AI.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Step 1: Setup Google Gemini API](#step-1-setup-google-gemini-api)
3. [Step 2: Configure CodeFlow](#step-2-configure-codeflow)
4. [Step 3: Understanding the Data Collection](#step-3-understanding-the-data-collection)
5. [Step 4: How Insights Are Generated](#step-4-how-insights-are-generated)
6. [Step 5: Testing Your Setup](#step-5-testing-your-setup)
7. [Step 6: Interpreting Results](#step-6-interpreting-results)
8. [Advanced: Customization](#advanced-customization)

---

## Overview

**What happens when you generate a CodeFlow report?**

1. ✅ Your coding activities are collected (commands, files, time, languages)
2. ✅ Data is aggregated into meaningful metrics
3. ✅ Context is prepared with your coding patterns
4. ✅ Gemini AI analyzes the patterns
5. ✅ Personalized insights are generated
6. ✅ Suggestions are categorized and displayed

**Time Required:** 10-15 minutes for complete setup

---

## Step 1: Setup Google Gemini API

### 1.1 Create Google Account (if needed)
- Go to https://accounts.google.com
- Sign up or log in with existing account

### 1.2 Access Google AI Studio
**Option A: Direct Link**
```
https://makersuite.google.com/app/apikey
```

**Option B: Through AI Studio**
```
https://aistudio.google.com/ → Click "Get API Key"
```

### 1.3 Create API Key

**Step-by-step:**

1. **Click "Create API Key" button**
   
2. **Choose Project:**
   - Select "Create API key in new project" (recommended)
   - Or select existing Google Cloud project
   
3. **Copy Your API Key**
   ```
   Example: AIzaSyD_Km9X2h5J-example-key-V8pL3qM
   ```
   
4. **Save It Securely**
   - Store in password manager
   - Don't share or commit to Git
   - You'll need it in Step 2

### 1.4 Understand Free Tier Limits

**What you get for FREE:**
```
✅ 60 requests per minute
✅ 1,500 requests per day
✅ No credit card required
```

**CodeFlow typical usage:**
```
📊 1 request per weekly report
📊 ~7-30 requests per week
✅ Well within free tier!
```

### 1.5 (Optional) Test API Key

You can test your key works:

```bash
curl https://generativelanguage.googleapis.com/v1/models \
  -H "x-goog-api-key: YOUR_API_KEY"
```

If successful, you'll see a list of available models.

---

## Step 2: Configure CodeFlow

### 2.1 Open VS Code Settings

**Method 1: Keyboard Shortcut**
- Windows/Linux: `Ctrl + ,`
- Mac: `Cmd + ,`

**Method 2: Menu**
```
File → Preferences → Settings
```

**Method 3: Command Palette**
```
Ctrl+Shift+P → "Preferences: Open Settings (UI)"
```

### 2.2 Find CodeFlow Settings

1. In the search bar at top, type: `codeflow`
2. You'll see all CodeFlow settings

### 2.3 Enable Gemini AI

Find and check:
```
☑️ Codeflow: Use Gemini AI
```

### 2.4 Add Your API Key

Find and paste your key:
```
Codeflow: Gemini Api Key
[Paste your API key here]
```

### 2.5 Alternative: Edit settings.json

**Open settings.json:**
```
Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
```

**Add these lines:**
```json
{
  "codeflow.useGeminiAI": true,
  "codeflow.geminiApiKey": "YOUR_API_KEY_HERE"
}
```

### 2.6 Verify Installation

Check package is installed:
```bash
npm list @google/generative-ai
```

Should show:
```
@google/generative-ai@0.21.0
```

If not installed:
```bash
npm install @google/generative-ai
```

---

## Step 3: Understanding the Data Collection

### 3.1 What Data is Collected?

**Automatically tracked:**
- ✅ Commands executed (e.g., "Save File", "Format Document")
- ✅ Files you work on (paths, not contents)
- ✅ Programming languages used
- ✅ Keystroke counts
- ✅ Time spent coding
- ✅ Active coding hours

**NOT collected:**
- ❌ Actual code content
- ❌ File contents
- ❌ Personal information
- ❌ Passwords or secrets

### 3.2 Where is Data Stored?

**Local storage:**
```
Windows: C:\Users\YourName\AppData\Roaming\Code\User\globalStorage\codeflow-ai
Mac: ~/Library/Application Support/Code/User/globalStorage/codeflow-ai
Linux: ~/.config/Code/User/globalStorage/codeflow-ai
```

**Format:**
```
activity-2024-12-16.json
activity-2024-12-15.json
activity-2024-12-14.json
...
```

### 3.3 View Your Data (Optional)

**Example activity entry:**
```json
{
  "timestamp": 1702742400000,
  "command": "workbench.action.files.save",
  "keystrokes": 45,
  "file": "src/app.ts",
  "language": "typescript"
}
```

### 3.4 Privacy Considerations

**What's sent to Gemini:**
```
✅ Aggregated statistics
✅ Language names
✅ File names (not content)
✅ Activity patterns
```

**Example context sent:**
```
Languages Used: TypeScript, Python
Total Keystrokes: 15,420
Commands Executed: 234
Unique Files: 18
File Switches: 45
```

**NOT sent:**
```
❌ Actual code
❌ File contents
❌ Sensitive data
```

---

## Step 4: How Insights Are Generated

### 4.1 Data Aggregation

**When you request a report:**

1. **Last 7 days collected**
   ```typescript
   // Pseudo-code
   for (let day = 0; day < 7; day++) {
     activities += getActivitiesForDate(date);
   }
   ```

2. **Metrics calculated**
   ```
   - Productivity Score: 0-100
   - Total Active Time
   - Coding Streak
   - Language Distribution
   - File Statistics
   - Command Usage
   ```

### 4.2 Context Preparation

**GeminiService prepares a prompt:**

```
Analyze this developer's coding patterns:

**Productivity Metrics:**
- Productivity Score: 75/100
- Total Active Time: 12.5 hours
- Streak: 5 days
- Active Hours: 9:00 - 18:00

**Coding Behavior:**
- Languages Used: TypeScript, Python
- Total Keystrokes: 15,420
- Commands Executed: 234
- Unique Files: 18
- File Switches: 45

**Top Commands:**
1. workbench.action.files.save (89 times)
2. editor.action.formatDocument (34 times)
3. workbench.action.terminal.new (12 times)

**Top Files:**
1. src/app.ts (45 min)
2. src/utils.ts (23 min)
3. tests/app.test.ts (18 min)

Please provide specific insights in these categories:
1. Code Improvement Suggestions
2. Performance Tips
3. Bad Practice Warnings
4. Refactoring Ideas
5. Productivity Hints

Format as JSON:
{
  "codeImprovements": [...],
  "performanceTips": [...],
  "badPracticeWarnings": [...],
  "refactoringIdeas": [...],
  "productivityHints": [...]
}
```

### 4.3 API Call to Gemini

**Request sent:**
```typescript
const result = await model.generateContent(context);
const response = await result.response;
const text = response.text();
```

**Gemini processes:**
1. Analyzes patterns
2. Identifies trends
3. Generates suggestions
4. Formats as JSON

### 4.4 Response Parsing

**Gemini returns:**
```json
{
  "codeImprovements": [
    "Consider using TypeScript-specific linters like @typescript-eslint for better type safety",
    "Add comprehensive JSDoc comments to exported functions",
    "Implement unit tests for critical business logic"
  ],
  "performanceTips": [
    "Master VS Code shortcuts to reduce mouse usage",
    "Use multi-cursor editing for repetitive changes",
    "Set up custom code snippets for common patterns"
  ],
  "badPracticeWarnings": [
    "High file switching detected - consider better task organization",
    "Inconsistent formatting suggests manual formatting instead of using auto-format"
  ],
  "refactoringIdeas": [
    "Extract repeated patterns in src/app.ts into utility functions",
    "Consider splitting large files into smaller, focused modules",
    "Review test coverage for recently modified files"
  ],
  "productivityHints": [
    "Excellent 5-day streak! Consistency is key to mastery",
    "Your most productive hours are 9-11 AM - schedule deep work then",
    "Consider time-blocking to reduce context switching"
  ]
}
```

### 4.5 Formatting for Display

**Categorized with icons:**
```typescript
insights.suggestions = [
  ...codeImprovements.map(s => `💡 Code Improvement: ${s}`),
  ...performanceTips.map(s => `⚡ Performance: ${s}`),
  ...badPracticeWarnings.map(s => `⚠️ Warning: ${s}`),
  ...refactoringIdeas.map(s => `🔧 Refactoring: ${s}`),
  ...productivityHints.map(s => `🎯 Productivity: ${s}`)
];
```

### 4.6 Fallback Logic

**If Gemini fails or is disabled:**

```typescript
if (!geminiEnabled || apiCallFailed) {
  // Use context-aware defaults
  suggestions = generateBasicSuggestions(insight);
}
```

**Smart defaults based on:**
- Productivity score
- Coding streak
- File switching patterns
- Time distribution

---

## Step 5: Testing Your Setup

### 5.1 Generate Your First Report

**Method 1: Command Palette**
1. Press `Ctrl+Shift+P` (Win/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `CodeFlow: Show Weekly Report`
3. Press Enter

**Method 2: Status Bar**
1. Look for "🚀 CodeFlow" in bottom-right status bar
2. Click it

### 5.2 Wait for Generation

**You'll see:**
```
⏳ Analyzing data...
⏳ Generating AI insights...
✅ Report ready!
```

**Time:** 5-10 seconds typically

### 5.3 Check for AI Insights

**Scroll to find:**
```
┌─────────────────────────────────────┐
│  🤖 AI-Powered Insights            │
│                                     │
│  💡 Code Improvement:              │
│  Consider using TypeScript-        │
│  specific linters...               │
│                                     │
│  ⚡ Performance:                   │
│  Master VS Code shortcuts...       │
│  ...                               │
└─────────────────────────────────────┘
```

### 5.4 Verify Categories

**Check you see all 5:**
- ☑️ 💡 Code Improvements
- ☑️ ⚡ Performance Tips
- ☑️ ⚠️ Warnings
- ☑️ 🔧 Refactoring Ideas
- ☑️ 🎯 Productivity Hints

### 5.5 Troubleshooting

**No insights showing?**

1. **Check settings:**
   ```
   Ctrl+, → Search "codeflow"
   Verify: useGeminiAI = true
   Verify: geminiApiKey is set
   ```

2. **Check console for errors:**
   ```
   Help → Toggle Developer Tools
   Look at Console tab
   ```

3. **Check API key:**
   ```
   Visit: https://makersuite.google.com/
   Verify key is active
   ```

4. **Check internet:**
   ```
   Gemini requires internet connection
   ```

**Generic suggestions?**

- Code more! Need at least 1-2 days of data
- Try again with more diverse activities

---

## Step 6: Interpreting Results

### 6.1 Code Improvements 💡

**What they mean:**
- Suggestions for better code quality
- Best practices for your languages
- Maintainability improvements

**Example:**
```
💡 Code Improvement: Consider using TypeScript-specific 
linters for better type safety
```

**Action:**
```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 6.2 Performance Tips ⚡

**What they mean:**
- Ways to code faster
- Workflow optimizations
- Tool usage improvements

**Example:**
```
⚡ Performance: Master keyboard shortcuts to reduce 
mouse usage and speed up development
```

**Action:**
- Learn 2-3 new shortcuts per week
- Print a shortcut cheat sheet
- Practice during coding sessions

### 6.3 Bad Practice Warnings ⚠️

**What they mean:**
- Potential issues detected
- Habits to improve
- Red flags in patterns

**Example:**
```
⚠️ Warning: High file switching detected. Consider 
focusing on one task at a time for better concentration
```

**Action:**
- Use time-blocking technique
- Finish one feature before starting another
- Close unrelated files

### 6.4 Refactoring Ideas 🔧

**What they mean:**
- Code structure improvements
- Opportunities to simplify
- Better organization suggestions

**Example:**
```
🔧 Refactoring: Extract repeated code patterns in 
src/app.ts into reusable utility functions
```

**Action:**
- Review src/app.ts for duplication
- Create utils/ directory
- Extract common patterns

### 6.5 Productivity Hints 🎯

**What they mean:**
- Motivation and encouragement
- Habit formation tips
- Work-life balance suggestions

**Example:**
```
🎯 Productivity: Excellent 5-day streak! Consistency 
is key to mastery. Keep up the great work!
```

**Action:**
- Celebrate the win!
- Set a goal for 7-day streak
- Share progress with team

---

## Advanced: Customization

### Customize Number of Insights

**Edit `src/geminiService.ts`:**

```typescript
// Line ~185
return {
  codeImprovements: insights.codeImprovements.slice(0, 5),  // Change 5
  performanceTips: insights.performanceTips.slice(0, 4),     // Change 4
  badPracticeWarnings: insights.badPracticeWarnings.slice(0, 3), // Change 3
  refactoringIdeas: insights.refactoringIdeas.slice(0, 4),   // Change 4
  productivityHints: insights.productivityHints.slice(0, 5)  // Change 5
};
```

### Change AI Model

**Edit `src/geminiService.ts`:**

```typescript
// Line ~32
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro'  // More powerful, detailed
  // or
  model: 'gemini-1.5-flash'  // Faster, concise (default)
});
```

### Custom Prompt Focus

**Edit `src/geminiService.ts` - prepareContext():**

```typescript
return `
Analyze this developer focusing on SECURITY:

[metrics...]

Provide insights specifically about:
1. Security best practices
2. Vulnerability patterns
3. Secure coding suggestions
4. Authentication/authorization tips
5. Data protection advice
`;
```

### Add Custom Category

**1. Update GeminiInsights interface:**
```typescript
export interface GeminiInsights {
  codeImprovements: string[];
  performanceTips: string[];
  badPracticeWarnings: string[];
  refactoringIdeas: string[];
  productivityHints: string[];
  securityTips?: string[];  // Add this
}
```

**2. Update prompt:**
```typescript
Please provide insights in these categories:
1. Code Improvements
2. Performance Tips
3. Bad Practice Warnings
4. Refactoring Ideas
5. Productivity Hints
6. Security Tips  // Add this
```

**3. Update formatting:**
```typescript
...geminiInsights.securityTips?.map(s => `🔒 Security: ${s}`) || []
```

---

## 🎉 Congratulations!

You now understand:
- ✅ How to set up Gemini AI
- ✅ How data is collected
- ✅ How insights are generated
- ✅ How to interpret results
- ✅ How to customize the system

**Next Steps:**
1. Use CodeFlow daily
2. Review insights weekly
3. Implement suggestions
4. Track improvement
5. Share with your team!

---

**Questions or Issues?**
- See [GEMINI_SETUP_GUIDE.md](GEMINI_SETUP_GUIDE.md) for detailed troubleshooting
- See [GEMINI_QUICKSTART.md](GEMINI_QUICKSTART.md) for quick reference
- Check [GEMINI_ARCHITECTURE.md](GEMINI_ARCHITECTURE.md) for technical details

**Happy Coding with AI-Powered Insights! 🚀**
