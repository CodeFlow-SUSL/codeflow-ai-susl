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
exports.GamificationSystem = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class GamificationSystem {
    context;
    progress;
    badges = [
        {
            id: 'first-commands',
            name: 'Getting Started',
            description: 'Execute your first 10 commands',
            icon: '🚀',
            condition: (activities) => {
                return activities.filter(a => a.command).length >= 10;
            }
        },
        {
            id: 'polyglot',
            name: 'Polyglot',
            description: 'Work with 3+ programming languages',
            icon: '🌐',
            condition: (activities) => {
                const languages = new Set(activities.filter(a => a.language).map(a => a.language));
                return languages.size >= 3;
            }
        },
        {
            id: 'night-owl',
            name: 'Night Owl',
            description: 'Code after 10 PM for 3 days',
            icon: '🦉',
            condition: (activities) => {
                const nightCodingDays = new Set();
                activities.forEach(activity => {
                    const hour = new Date(activity.timestamp).getHours();
                    if (hour >= 22 || hour <= 6) {
                        const day = new Date(activity.timestamp).getDate();
                        nightCodingDays.add(day);
                    }
                });
                return nightCodingDays.size >= 3;
            }
        },
        {
            id: 'early-bird',
            name: 'Early Bird',
            description: 'Code before 7 AM for 3 days',
            icon: '🐦',
            condition: (activities) => {
                const earlyCodingDays = new Set();
                activities.forEach(activity => {
                    const hour = new Date(activity.timestamp).getHours();
                    if (hour >= 5 && hour <= 7) {
                        const day = new Date(activity.timestamp).getDate();
                        earlyCodingDays.add(day);
                    }
                });
                return earlyCodingDays.size >= 3;
            }
        },
        {
            id: 'persistence',
            name: 'Persistence',
            description: 'Code for 7 consecutive days',
            icon: '🔥',
            condition: (activities) => {
                if (activities.length === 0)
                    return false;
                const sortedActivities = [...activities].sort((a, b) => a.timestamp - b.timestamp);
                const days = new Set();
                sortedActivities.forEach(activity => {
                    const day = Math.floor(activity.timestamp / (1000 * 60 * 60 * 24));
                    days.add(day);
                });
                const dayArray = Array.from(days).sort((a, b) => a - b);
                let streak = 1;
                let maxStreak = 1;
                for (let i = 1; i < dayArray.length; i++) {
                    if (dayArray[i] === dayArray[i - 1] + 1) {
                        streak++;
                        maxStreak = Math.max(maxStreak, streak);
                    }
                    else {
                        streak = 1;
                    }
                }
                return maxStreak >= 7;
            }
        },
        {
            id: 'command-master',
            name: 'Command Master',
            description: 'Use 20 different commands',
            icon: '⌨',
            condition: (activities) => {
                const commands = new Set(activities.filter(a => a.command).map(a => a.command));
                return commands.size >= 20;
            }
        },
        {
            id: 'keystroke-hero',
            name: 'Keystroke Hero',
            description: 'Type 10,000 keystrokes in a week',
            icon: '👆',
            condition: (activities) => {
                const totalKeystrokes = activities
                    .filter(a => a.keystrokes)
                    .reduce((sum, a) => sum + (a.keystrokes || 0), 0);
                return totalKeystrokes >= 10000;
            }
        },
        {
            id: 'file-jumper',
            name: 'File Jumper',
            description: 'Work with 10 different files in a day',
            icon: '📁',
            condition: (activities) => {
                const filesByDay = {};
                activities.forEach(activity => {
                    if (activity.file) {
                        const day = Math.floor(activity.timestamp / (1000 * 60 * 60 * 24));
                        if (!filesByDay[day]) {
                            filesByDay[day] = new Set();
                        }
                        filesByDay[day].add(activity.file);
                    }
                });
                return Object.values(filesByDay).some(files => files.size >= 10);
            }
        }
    ];
    constructor(context) {
        this.context = context;
        this.progress = this.loadProgress();
    }
    loadProgress() {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, 'progress.json');
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        // Default progress
        return {
            badges: [],
            points: 0,
            level: 1
        };
    }
    saveProgress() {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, 'progress.json');
        fs.writeFileSync(filePath, JSON.stringify(this.progress));
    }
    checkForNewBadges(activities) {
        const newBadges = [];
        for (const badge of this.badges) {
            if (!this.progress.badges.includes(badge.id) && badge.condition(activities)) {
                this.progress.badges.push(badge.id);
                newBadges.push(badge);
                // Award points
                this.progress.points += 100;
                // Show notification
                vscode.window.showInformationMessage(`🏆 New badge earned: ${badge.name}!`);
            }
        }
        // Update level
        this.progress.level = Math.floor(this.progress.points / 500) + 1;
        if (newBadges.length > 0) {
            this.saveProgress();
        }
        return newBadges;
    }
    getEarnedBadges() {
        return this.badges.filter(badge => this.progress.badges.includes(badge.id));
    }
    getAllBadges() {
        return this.badges;
    }
    getUserProgress() {
        return { ...this.progress };
    }
    getActivitiesForLastWeek() {
        const activities = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayActivities = this.getActivitiesForDate(dateStr);
            activities.push(...dayActivities);
        }
        return activities;
    }
    getActivitiesForDate(date) {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, `activity-${date}.json`);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
}
exports.GamificationSystem = GamificationSystem;
//# sourceMappingURL=gamification.js.map