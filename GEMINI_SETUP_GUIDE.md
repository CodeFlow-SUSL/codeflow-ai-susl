# Google Gemini AI Integration Guide

This guide will walk you through integrating Google Gemini AI to generate intelligent code insights in CodeFlow AI.

## 🎯 What You'll Get

With Gemini AI integration, CodeFlow will provide:

1. **Code Improvement Suggestions** - Specific recommendations to enhance code quality
2. **Performance Tips** - Actionable advice to improve development speed
3. **Bad Practice Warnings** - Alerts about potential issues in your coding patterns
4. **Refactoring Ideas** - Smart suggestions for code restructuring
5. **Productivity Hints** - Personalized tips to boost your productivity

## 📋 Prerequisites

- VS Code with CodeFlow AI extension installed
- Google Cloud account (free tier available)
- Node.js and npm installed

---

## Step-by-Step Setup

### Step 1: Get Google Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/

2. **Sign in with your Google account**

3. **Create API Key**
   - Click "Get API Key" or "Create API Key"
   - Choose "Create API key in new project" (or select existing project)
   - Copy the generated API key (keep it secure!)

   > **Note:** The free tier includes:
   > - 60 requests per minute
   > - 1,500 requests per day
   > - This is plenty for CodeFlow's usage!

### Step 2: Install Required Package

Open your terminal in the CodeFlow project directory and run:

```bash
npm install @google/generative-ai
```

This installs the Google Generative AI SDK.

### Step 3: Configure CodeFlow Settings

1. **Open VS Code Settings**
   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Or: File → Preferences → Settings

2. **Search for "CodeFlow"**

3. **Enable Gemini AI**
   - Find `Codeflow: Use Gemini AI`
   - Check the box to enable it

4. **Add Your API Key**
   - Find `Codeflow: Gemini Api Key`
   - Paste your API key from Step 1
   - The key is stored securely in VS Code settings

   **Alternative: Use settings.json**
   ```json
   {
     "codeflow.useGeminiAI": true,
     "codeflow.geminiApiKey": "YOUR_API_KEY_HERE"
   }
   ```

### Step 4: Test the Integration

1. **Generate a Report**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `CodeFlow: Show Weekly Report`
   - Press Enter

2. **View AI Insights**
   - Scroll to the "AI-Powered Insights" section
   - You should see categorized suggestions:
     - 💡 Code Improvements
     - ⚡ Performance Tips
     - ⚠️ Warnings
     - 🔧 Refactoring Ideas
     - 🎯 Productivity Hints

---

## 🔧 How It Works

### Data Collection
CodeFlow tracks your coding activities:
- Commands executed
- Files worked on
- Programming languages used
- Coding time and patterns
- Keystroke and activity metrics

### AI Analysis
When you generate a report:

1. **Data Preparation**: CodeFlow aggregates your recent coding data
2. **Context Building**: Creates a detailed summary of your coding patterns
3. **Gemini Query**: Sends the context to Google Gemini AI
4. **Insight Generation**: Gemini analyzes patterns and generates personalized suggestions
5. **Display**: Insights are categorized and displayed in the report

### Example Prompt Sent to Gemini

```
Analyze this developer's coding patterns:

Productivity Metrics:
- Productivity Score: 75/100
- Total Active Time: 12.5 hours
- Streak: 5 days
- Active Hours: 9:00 - 18:00

Coding Behavior:
- Languages Used: TypeScript, Python
- Total Keystrokes: 15,420
- Commands Executed: 234
- Unique Files: 18
- File Switches: 45

Please provide specific insights in these categories:
1. Code Improvement Suggestions
2. Performance Tips
3. Bad Practice Warnings
4. Refactoring Ideas
5. Productivity Hints
```

---

## 📊 Understanding Your Insights

### Code Improvement Suggestions 💡
**Purpose**: Enhance code quality and maintainability

**Example Insights**:
- "Consider using TypeScript-specific linters for better type safety"
- "Add comprehensive comments for complex logic blocks"
- "Implement unit tests for critical functions"

**Action**: Review suggestions and implement them in your codebase

### Performance Tips ⚡
**Purpose**: Speed up your development workflow

**Example Insights**:
- "Master keyboard shortcuts for common operations"
- "Reduce context switching by completing tasks sequentially"
- "Use code snippets for repetitive patterns"

**Action**: Integrate tips into your daily workflow

### Bad Practice Warnings ⚠️
**Purpose**: Identify potential issues early

**Example Insights**:
- "Excessive file switching detected - consider better task planning"
- "Low coding time with high file count suggests scattered focus"
- "Inconsistent coding hours may affect productivity"

**Action**: Address warnings to improve coding habits

### Refactoring Ideas 🔧
**Purpose**: Improve code structure and organization

**Example Insights**:
- "Consider breaking down large files into smaller modules"
- "Extract repeated code patterns into reusable functions"
- "Simplify complex conditional logic"

**Action**: Plan refactoring sessions based on suggestions

### Productivity Hints 🎯
**Purpose**: Boost overall productivity and motivation

**Example Insights**:
- "Great 5-day streak! Keep the momentum going"
- "Set dedicated coding blocks during peak hours"
- "Take regular breaks to maintain focus"

**Action**: Adopt productivity techniques gradually

---

## 🎨 Customization Options

### Adjust Insight Frequency

In [geminiService.ts](geminiService.ts):

```typescript
// Modify the number of insights per category
codeImprovements: insights.codeImprovements.slice(0, 5)  // Show 5 items
performanceTips: insights.performanceTips.slice(0, 4)     // Show 4 items
badPracticeWarnings: insights.badPracticeWarnings.slice(0, 3)  // Show 3 items
```

### Change AI Model

Update the model in [geminiService.ts](geminiService.ts):

```typescript
// Use different Gemini models
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro'  // More powerful, slower
  // or
  model: 'gemini-1.5-flash'  // Faster, good for quick insights (default)
});
```

### Customize Prompt

Edit the `prepareContext()` method in [geminiService.ts](geminiService.ts) to focus on specific aspects:

```typescript
private prepareContext(insight: ProductivityInsight, activities: CodingActivity[]): string {
  return `
    Focus on [specific area]:
    - Security best practices
    - Performance optimization
    - Code maintainability
    // ... your custom instructions
  `;
}
```

---

## 🔒 Security Best Practices

### API Key Security

1. **Never commit API keys to version control**
   ```bash
   # Add to .gitignore
   .vscode/settings.json
   ```

2. **Use environment variables** (optional advanced setup)
   ```typescript
   const apiKey = process.env.GEMINI_API_KEY || config.get<string>('geminiApiKey', '');
   ```

3. **Rotate keys regularly**
   - Go to Google AI Studio
   - Delete old keys
   - Generate new ones

### Data Privacy

- CodeFlow sends only **aggregated statistics** to Gemini
- **No actual code** is transmitted
- File paths are included but not file contents
- You can review what's sent in [geminiService.ts](geminiService.ts) `prepareContext()` method

---

## 🐛 Troubleshooting

### Issue: "Failed to initialize Gemini AI"

**Solutions**:
1. Verify API key is correct
2. Check internet connection
3. Ensure `@google/generative-ai` package is installed
4. Check API key hasn't exceeded quota

### Issue: "No AI insights showing"

**Solutions**:
1. Confirm `codeflow.useGeminiAI` is enabled
2. Check if you have enough coding data (at least 1 day)
3. Look at VS Code Developer Console (`Help → Toggle Developer Tools`)
4. Review error messages

### Issue: API quota exceeded

**Solutions**:
1. Wait for quota to reset (daily reset)
2. Reduce report generation frequency
3. Upgrade to paid tier if needed

### Issue: Insights seem generic

**Solutions**:
1. Code more to generate better patterns
2. Work on diverse projects
3. Use for at least 3-7 days to establish patterns
4. Customize the prompt for your specific needs

---

## 💡 Advanced Usage

### Test Gemini Connection

Add this command to test your setup:

```typescript
// In extension.ts
const testGeminiCommand = vscode.commands.registerCommand('codeflow.testGemini', async () => {
  const geminiService = new GeminiService();
  const isConnected = await geminiService.testConnection();
  
  if (isConnected) {
    vscode.window.showInformationMessage('✅ Gemini AI connected successfully!');
  } else {
    vscode.window.showErrorMessage('❌ Failed to connect to Gemini AI');
  }
});
```

### Batch Processing

For processing multiple days of data:

```typescript
// Generate insights for last 30 days
const insight = await aiAnalyzer.analyzeData(30);
```

### Custom Insight Categories

Extend `GeminiInsights` interface in [geminiService.ts](geminiService.ts):

```typescript
export interface GeminiInsights {
  codeImprovements: string[];
  performanceTips: string[];
  badPracticeWarnings: string[];
  refactoringIdeas: string[];
  productivityHints: string[];
  // Add your custom categories
  securityTips?: string[];
  testingAdvice?: string[];
}
```

---

## 📈 Monitoring Usage

### Track API Calls

Google AI Studio Dashboard:
- Visit: https://makersuite.google.com/
- View usage statistics
- Monitor quota consumption
- Track response times

### Cost Estimation

**Free Tier**:
- 60 requests/minute
- 1,500 requests/day
- **Cost**: $0

**Typical CodeFlow Usage**:
- 1 request per report generation
- ~7-30 reports per week
- **Well within free tier limits!**

---

## 🎓 Learning Resources

### Google Gemini Documentation
- [Gemini API Quickstart](https://ai.google.dev/tutorials/quickstart)
- [Node.js SDK Documentation](https://ai.google.dev/tutorials/node_quickstart)
- [Best Practices](https://ai.google.dev/docs/best_practices)

### CodeFlow Resources
- [README.md](../README.md) - Extension overview
- [FEATURES.md](../FEATURES.md) - Full feature list
- [aiAnalyzer.ts](aiAnalyzer.ts) - Core analysis logic
- [geminiService.ts](geminiService.ts) - Gemini integration

---

## ✅ Quick Checklist

- [ ] Created Google AI Studio account
- [ ] Generated Gemini API key
- [ ] Installed `@google/generative-ai` package
- [ ] Enabled `codeflow.useGeminiAI` setting
- [ ] Added API key to `codeflow.geminiApiKey` setting
- [ ] Generated test report
- [ ] Verified AI insights appear
- [ ] Reviewed and implemented suggestions

---

## 🤝 Contributing

Found ways to improve Gemini integration?

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Submit a pull request

Ideas for contributions:
- Better prompt engineering
- Additional insight categories
- Custom insight filters
- Multi-language support for insights
- Integration with other AI models

---

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share tips
- **Documentation**: Check [README.md](../README.md) for general help

---

## 🎉 Success!

You've successfully integrated Google Gemini AI with CodeFlow! 

Now every time you generate a report, you'll receive:
- ✨ Personalized insights
- 🎯 Actionable recommendations  
- 📊 Data-driven suggestions
- 🚀 Productivity boost

**Happy Coding! 🚀**

---

*Last Updated: December 2024*
*CodeFlow AI Version: 0.1.3*
