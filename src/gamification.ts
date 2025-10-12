import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CodingActivity } from './dataCollector';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (activities: CodingActivity[]) => boolean;
}

export interface UserProgress {
    badges: string[];
    points: number;
    level: number;
}

export class GamificationSystem {
    private context: vscode.ExtensionContext;
    private progress: UserProgress;

    private badges: Badge[] = [
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
                const languages = new Set(
                    activities.filter(a => a.language).map(a => a.language)
                );
                return languages.size >= 3;
            }
        },
        {
            id: 'night-owl',
            name: 'Night Owl',
            description: 'Code after 10 PM for 3 days',
            icon: '🦉',
            condition: (activities) => {
                const nightCodingDays = new Set<number>();
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
                const earlyCodingDays = new Set<number>();
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
                if (activities.length === 0) return false;

                const sortedActivities = [...activities].sort((a, b) => a.timestamp - b.timestamp);
                const days = new Set<number>();

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
                    } else {
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
                const commands = new Set(
                    activities.filter(a => a.command).map(a => a.command)
                );
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
                const filesByDay: Record<number, Set<string>> = {};

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

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.progress = this.loadProgress();
    }

    private loadProgress(): UserProgress {
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

    private saveProgress() {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, 'progress.json');

        fs.writeFileSync(filePath, JSON.stringify(this.progress));
    }

    public checkForNewBadges(activities: CodingActivity[]): Badge[] {
        const newBadges: Badge[] = [];

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

    public getEarnedBadges(): Badge[] {
        return this.badges.filter(badge => this.progress.badges.includes(badge.id));
    }

    public getAllBadges(): Badge[] {
        return this.badges;
    }

    public getUserProgress(): UserProgress {
        return { ...this.progress };
    }

    public getActivitiesForLastWeek(): CodingActivity[] {
        const activities: CodingActivity[] = [];
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

    private getActivitiesForDate(date: string): CodingActivity[] {
        const storagePath = this.context.globalStorageUri.fsPath;
        const filePath = path.join(storagePath, `activity-${date}.json`);

        if (!fs.existsSync(filePath)) {
            return [];
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
}
