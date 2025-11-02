# CodeFlow AI - Visual Guide

## 🎨 UI Components Overview

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│  📊 CodeFlow Weekly Report           [Export] [🌓] ⭕85    │
│  Your productivity insights at a glance                     │
└─────────────────────────────────────────────────────────────┘
```

### Stats Overview (4-Card Grid)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  ⌨️          │  📁          │  ⏱️          │  🎯          │
│  1,234       │  156         │  42          │  27.4        │
│  Commands    │  Files       │  Hours       │  Avg Min     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Progress Bar
```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Weekly Goal Progress                                    │
│  ████████████████████░░░░░░  85%                           │
│  85% of target achieved                                     │
└─────────────────────────────────────────────────────────────┘
```

### Filter Controls
```
┌─────────────────────────────────────────────────────────────┐
│  [All] [Languages] [Commands] [Files]                      │
└─────────────────────────────────────────────────────────────┘
```

### Charts Grid (2-Column Layout)
```
┌────────────────────────────┬────────────────────────────┐
│  🌐 Language Distribution │  ⌨️ Most Used Commands    │
│  ┌─────────────────────┐  │  ┌─────────────────────┐  │
│  │   Doughnut Chart    │  │  │   Bar Chart         │  │
│  │   (Interactive)     │  │  │   (Gradient)        │  │
│  └─────────────────────┘  │  └─────────────────────┘  │
├────────────────────────────┼────────────────────────────┤
│  📁 Most Worked Files     │  🕐 Hourly Activity       │
│  ┌─────────────────────┐  │  ┌─────────────────────┐  │
│  │   Horizontal Bar    │  │  │   Line Chart        │  │
│  │   (Time Based)      │  │  │   (24 Hours)        │  │
│  └─────────────────────┘  │  └─────────────────────┘  │
├────────────────────────────┼────────────────────────────┤
│  📈 Weekly Trend          │  💡 AI Suggestions        │
│  ┌─────────────────────┐  │  • Suggestion 1          │
│  │   Multi-line Chart  │  │  • Suggestion 2          │
│  │   (Comparison)      │  │  • Suggestion 3          │
│  └─────────────────────┘  │                           │
└────────────────────────────┴────────────────────────────┘
```

### Badges Section
```
┌─────────────────────────────────────────────────────────────┐
│  🏆 Earned Badges                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🚀  │ │ 🌐  │ │ 🦉  │ │ 🐦  │ │ 🔥  │ │ ⌨️  │   │
│  │Start│ │Poly │ │Night│ │Early│ │Pers │ │Cmd  │   │
│  │ ✓   │ │ ✓   │ │ ✓   │ │     │ │ ✓   │ │ ✓   │   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Light Mode
- **Background**: Linear gradient (Purple to Purple-Pink)
- **Cards**: White (#ffffff)
- **Text**: Dark Gray (#333333)
- **Accent**: Blue (#007acc)
- **Shadows**: Light shadows for depth

### Dark Mode
- **Background**: Same gradient overlay
- **Cards**: Dark Gray (#2d2d30)
- **Text**: Light Gray (#e0e0e0)
- **Accent**: Blue (#007acc)
- **Shadows**: Darker shadows

### Gradient Colors
```
Primary:   #667eea → #764ba2 (Purple)
Success:   #43e97b → #38ef7d (Green)
Warning:   #fa709a → #fee140 (Pink/Yellow)
Info:      #4facfe → #00f2fe (Blue)
```

## 🎯 Interactive Elements

### Buttons
- **Primary**: Blue with white text
- **Hover**: Lifts up (-2px) with enhanced shadow
- **Active**: Slightly compressed
- **Icons**: Codicons from VS Code

### Cards
- **Rest**: Subtle shadow
- **Hover**: Lifts up (-5px) with larger shadow
- **Active**: Border highlight

### Charts
- **Hover**: Segment/bar highlights
- **Tooltip**: Dark background with white text
- **Legend**: Click to show/hide datasets

### Badges
- **Locked**: Grayscale, 40% opacity
- **Unlocked**: Full color, 100% opacity
- **Hover**: Scale up (1.05x)
- **Earn**: Rotate + scale animation

## 📊 Chart Specifications

### 1. Language Distribution (Doughnut)
- **Type**: Doughnut Chart
- **Colors**: 7-color gradient array
- **Cutout**: 60%
- **Legend**: Right side
- **Hover**: Segment pops out

### 2. Most Used Commands (Bar)
- **Type**: Vertical Bar Chart
- **Colors**: Purple gradient
- **Border Radius**: 8px
- **Y-Axis**: Starts at 0
- **Hover**: Bar highlights

### 3. Most Worked Files (Horizontal Bar)
- **Type**: Horizontal Bar Chart
- **Colors**: Green gradient
- **Labels**: Filename only
- **X-Axis**: Time in minutes
- **Hover**: Bar highlights

### 4. Hourly Activity (Line)
- **Type**: Line with Area Fill
- **Colors**: Pink/Yellow gradient
- **Points**: 5px radius
- **Tension**: 0.4 (curved)
- **Fill**: Below line

### 5. Weekly Trend (Multi-line)
- **Type**: Multi-dataset Line
- **Dataset 1**: Productivity (Purple)
- **Dataset 2**: Activity (Green)
- **Y-Axis**: 0-100 scale
- **Legend**: Bottom

## 🎬 Animations

### fadeIn (Container)
```
0%   → opacity: 0, translateY(20px)
100% → opacity: 1, translateY(0)
Duration: 0.5s
```

### slideDown (Header)
```
0%   → opacity: 0, translateY(-30px)
100% → opacity: 1, translateY(0)
Duration: 0.6s
```

### pulse (Score Circle)
```
0%, 100% → scale(1)
50%      → scale(1.05)
Duration: 2s (infinite)
```

### ripple (Score Ring)
```
0%   → scale(0.9), opacity: 1
100% → scale(1.2), opacity: 0
Duration: 2s (infinite)
```

### badgeEarn
```
0%   → scale(0.8), rotate(-5deg), opacity: 0
50%  → scale(1.1), rotate(5deg)
100% → scale(1), rotate(0), opacity: 1
Duration: 0.6s
```

### bounce (Badge Icon)
```
0%, 100% → translateY(0)
50%      → translateY(-10px)
Duration: 0.6s
```

### shimmer (Progress Bar)
```
0%   → translateX(-100%)
100% → translateX(100%)
Duration: 2s (infinite)
```

## 🎮 User Interactions

### Theme Toggle
1. Click moon/sun button (top-right)
2. Body class toggles `dark-mode`
3. Preference saved to localStorage
4. Button rotates 15deg on hover

### Filter Buttons
1. Click filter button
2. Active class toggles
3. Cards show/hide based on data-category
4. Smooth opacity transitions

### Export Data
1. Click Export button
2. Data compiled to JSON
3. Blob created
4. Save dialog appears
5. File downloads with timestamp

### Set Goal
1. Open command palette
2. Select goal type from list
3. Enter target value
4. Validation checks number
5. Saved to settings
6. Confirmation message

## 📱 Responsive Breakpoints

### Desktop (>1200px)
- 2-column chart grid
- 4-column stats grid
- Full-width header

### Tablet (768px - 1200px)
- 1-2 column chart grid (auto-fit)
- 2-4 column stats grid (auto-fit)
- Stacked header elements

### Mobile (<768px)
- 1-column layout
- Stacked stats cards
- Reduced padding
- Smaller fonts

## 🎨 Typography

### Headings
- **H1**: 32px, Bold, Gradient
- **H2**: 24px, Semi-bold, Primary color
- **H3**: 20px, Semi-bold, Text color

### Body
- **Regular**: 14px, Normal weight
- **Labels**: 12px, Uppercase, 0.5px spacing
- **Values**: 28-36px, Bold

### Font Family
```
'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
```

## ✨ Special Effects

### Gradient Text (Header)
```css
background: linear-gradient(135deg, primary, secondary);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Card Shadow (Layered)
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Hover Shadow (Enhanced)
```css
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
```

### Score Circle Shadow
```css
box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
```

## 🎯 Best Practices Used

✅ CSS Variables for easy theming
✅ Semantic HTML structure
✅ Accessible color contrasts
✅ GPU-accelerated animations (transform/opacity)
✅ Responsive grid layouts
✅ Mobile-first approach
✅ Consistent spacing system
✅ Reusable component classes
✅ Smooth state transitions
✅ Progressive enhancement

## 📐 Spacing System

```
Extra Small: 5px
Small:       10px
Medium:      15px
Large:       20px
Extra Large: 30px
```

## 🎨 Border Radius

```
Small:  8px  (buttons, small cards)
Medium: 12px (cards, inputs)
Large:  16px (main containers)
Circle: 50%  (score, avatars)
Pill:   25px (filter buttons)
```

---

**This visual guide helps understand the structure and design decisions behind the CodeFlow AI interface! 🎨**
