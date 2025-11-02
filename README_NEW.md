# CodeFlow AI - Intelligent Productivity Insights for Developers

CodeFlow AI is a powerful VS Code extension that tracks your coding habits, provides AI-powered productivity insights, and gamifies your development journey with achievements and badges.

## ✨ Features

### 📊 **Advanced Productivity Analytics**
- **Comprehensive Dashboard**: Beautiful, interactive reports with multiple chart types
- **Real-time Statistics**: Track commands executed, files worked on, coding hours, and more
- **Language Distribution**: See which programming languages you're using most
- **Hourly Activity Tracking**: Visualize your most productive hours of the day
- **Weekly Trends**: Compare your performance week-over-week

### 🎯 **Goal Setting & Tracking**
- Set custom productivity goals (daily score, weekly hours, languages to learn)
- Track progress with beautiful progress bars and visual indicators
- Get motivated with goal completion notifications

### 🏆 **Gamification System**
- **Earn Badges**: Unlock achievements as you code
  - 🚀 Getting Started - Execute your first 10 commands
  - 🌐 Polyglot - Work with 3+ programming languages
  - 🦉 Night Owl - Code after 10 PM for 3 days
  - 🐦 Early Bird - Code before 7 AM for 3 days
  - 🔥 Persistence - Code for 7 consecutive days
  - And many more!
- **Level System**: Gain XP and level up as you code
- **Progress Tracking**: Monitor your coding journey

### 🎨 **Beautiful UI**
- **Dark Mode Support**: Seamlessly switch between light and dark themes
- **Modern Design**: Gradient colors, animations, and smooth transitions
- **Responsive Layout**: Works perfectly on any screen size
- **Interactive Charts**: Hover effects and detailed tooltips powered by Chart.js
- **Filter Controls**: Easily filter reports by category

### 🤖 **AI-Powered Analysis**
- **Local Analysis**: Built-in productivity scoring algorithm
- **TensorFlow.js Integration**: Train custom ML models on your coding data
- **External API Support**: Connect to your own AI services for advanced insights
- **Smart Suggestions**: Get personalized recommendations to improve productivity

### 📈 **Performance Comparison**
- Compare current week vs. previous week performance
- Track improvement trends over time
- Get instant feedback on productivity changes

### 💾 **Data Management**
- **Export Reports**: Download your data as JSON for external analysis
- **Cloud Sync**: (Optional) Sync data across multiple machines
- **Data Privacy**: All data stored locally by default

### ⚡ **Quick Actions**
- One-click report generation
- Status bar integration for easy access
- Command palette support for all features

## 🚀 Getting Started

1. **Install the Extension**
   - Search for "CodeFlow AI" in VS Code marketplace
   - Click Install

2. **Start Tracking**
   - The extension starts tracking automatically when VS Code opens
   - Code normally - no additional setup required!

3. **View Your Report**
   - Click the CodeFlow icon in the status bar, or
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Type "CodeFlow: Show Weekly Report"

## 📋 Commands

Access these commands via Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- `CodeFlow: Show Weekly Report` - View your productivity dashboard
- `CodeFlow: View Statistics` - Choose custom time periods (Today, 7 days, 30 days, All time)
- `CodeFlow: Set Goal` - Define your productivity goals
- `CodeFlow: Show Earned Badges` - View all your achievements
- `CodeFlow: Compare Performance` - Compare this week vs. last week
- `CodeFlow: Export Data` - Download your data as JSON
- `CodeFlow: Toggle Tracking` - Enable/disable tracking
- `CodeFlow: Configure AI API` - Set up external AI services
- `CodeFlow: Train TensorFlow.js Model` - Train custom ML models
- `CodeFlow: Enable Cloud Sync` - Sync data across devices

## ⚙️ Configuration

Customize CodeFlow AI in VS Code settings:

```json
{
  "codeflow.enabled": true,                    // Enable/disable tracking
  "codeflow.cloudSync": false,                 // Enable cloud sync
  "codeflow.useExternalAPI": false,            // Use external AI API
  "codeflow.apiEndpoint": "",                  // Your API endpoint
  "codeflow.apiKey": "",                       // Your API key
  "codeflow.useTFModel": false,                // Use TensorFlow.js model
  "codeflow.theme": "auto",                    // Theme: light, dark, or auto
  "codeflow.goals": {}                         // Your productivity goals
}
```

## 🎯 Use Cases

### For Individual Developers
- Track your coding productivity
- Identify your most productive hours
- Set and achieve coding goals
- Improve coding habits with AI suggestions

### For Teams
- Share insights (with cloud sync enabled)
- Compare team productivity trends
- Foster healthy competition with badges
- Identify best practices across the team

### For Students
- Monitor learning progress
- Track time spent on projects
- Earn achievements as you learn new languages
- Build good coding habits early

## 🔒 Privacy

- **Data stored locally** by default in VS Code's global storage
- **No telemetry** - we don't collect any personal data
- **Optional cloud sync** - you control when data leaves your machine
- **Open source** - review the code yourself

## 🛠️ Technical Details

- Built with TypeScript
- Uses Chart.js for beautiful visualizations
- TensorFlow.js integration for ML capabilities
- React support for future enhancements
- Fully extensible architecture

## 📊 What's Tracked

- Commands executed in VS Code
- Files opened and edited
- Programming languages used
- Time spent coding
- Active coding hours
- File edit patterns

**Note**: CodeFlow AI does NOT track:
- File contents or code
- Keystrokes
- Personal information
- Browser history
- Any data outside VS Code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Support

If you find CodeFlow AI helpful:
- ⭐ Star the repository
- 📢 Share with fellow developers
- 💬 Provide feedback and suggestions
- 🐛 Report bugs or request features

## 🔮 Roadmap

- [ ] Team collaboration features
- [ ] More badge types
- [ ] Custom chart configurations
- [ ] Integration with GitHub/GitLab
- [ ] Mobile companion app
- [ ] AI-powered code quality insights
- [ ] Customizable themes
- [ ] Plugin system for extensibility

---

**Made with ❤️ for developers who love data and productivity**
