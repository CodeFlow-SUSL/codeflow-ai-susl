# Change Log

All notable changes to the "codeflow-ai" extension will be documented in this file.

## [0.2.0] - 2025-11-02

### 🎨 UI Improvements
- **Modern Design System**: Implemented comprehensive CSS variable system for theming
- **Dark Mode**: Added full dark mode support with persistent theme preference
- **Enhanced Charts**: Upgraded to doughnut charts with gradient fills and better interactivity
- **Animations**: Added fadeIn, slideDown, pulse, ripple, bounce, and shimmer animations
- **Card Layout**: Redesigned with modern cards featuring hover effects and shadows
- **Responsive Design**: Fully responsive layout that adapts to any screen size
- **Color Scheme**: Beautiful gradient color palette throughout the interface

### ✨ New Features
- **Goal Setting** (`codeflow.setGoal`): Set and track custom productivity goals
- **Flexible Time Periods** (`codeflow.viewStats`): View stats for Today, 7 days, 30 days, or All time
- **Performance Comparison** (`codeflow.comparePerformance`): Compare current vs. previous week
- **Data Export** (`codeflow.exportData`): Export all data as JSON
- **Statistics Overview**: 4-card dashboard showing key metrics at a glance
- **Hourly Activity Chart**: Visualize productivity distribution across 24 hours
- **Weekly Trend Chart**: Compare productivity and activity over 7 days
- **Filter System**: Filter reports by category (Languages, Commands, Files, Time, Trends)
- **Progress Bars**: Visual goal progress tracking with animated fills

### 📊 Chart Enhancements
- Added **Doughnut Chart** for language distribution
- Enhanced **Bar Charts** with gradients and rounded corners
- New **Line Charts** with area fills for time analytics
- Added **Multi-line Chart** for trend comparison
- Improved tooltips with better styling and formatting
- Better legends and axis labels

### 🎯 User Experience
- Theme toggle button in top-right corner
- One-click export functionality
- Active filter highlighting
- Smooth transitions and hover effects
- Better visual feedback on interactions
- Persistent theme preference
- Enhanced badge system with earn animations

### ⚙️ Configuration
- Added `codeflow.goals` setting for storing user goals
- Added `codeflow.theme` setting for theme preference (light/dark/auto)
- Enhanced all command descriptions
- Added icons to all commands

### 🔧 Technical
- Refactored CSS with modern practices
- Improved TypeScript code organization
- Added utility functions for data generation
- Better error handling
- Enhanced command registration
- Optimized chart rendering

### 📝 Documentation
- Created comprehensive README
- Added FEATURES.md for detailed feature documentation
- Added IMPROVEMENT_SUMMARY.md
- Enhanced inline code comments

## [0.0.1] - 2024

### Initial Release
- Basic activity tracking
- Simple weekly reports
- Badge system
- Cloud sync support
- TensorFlow.js integration
- External API support