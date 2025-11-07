import * as vscode from 'vscode';
import { ActivityTracker } from './activityTracker';
import { DataStorage } from './dataStorage';
import { CodingActivity, DailyActivityLog } from './types';

export class DataCollectionModule {
    private tracker: ActivityTracker;
    private storage: DataStorage;

    constructor(context: vscode.ExtensionContext) {
        this.storage = new DataStorage(context);
        this.tracker = new ActivityTracker(context);
    }
      public getActivitiesForDate(date: string): CodingActivity[] {
        const dailyLog = this.storage.loadDailyLog(date);
        if (!dailyLog) {
            return [];
        }
        const activities: CodingActivity[] = [];
        for (const session of dailyLog.sessions) {
            activities.push(...session.activities);
        }
        return activities;
    }
    public getActivitiesForDateRange(startDate: string, endDate: string): CodingActivity[] {
        return this.storage.getActivitiesForDateRange(startDate, endDate);
    }