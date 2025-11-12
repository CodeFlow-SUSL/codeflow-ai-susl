import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DailyActivityLog, CodingActivity, ActivitySession, SessionMetadata } from './types';

export class DataStorage {
      private context: vscode.ExtensionContext;
      private storagePath: string;

      constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.storagePath = context.globalStorageUri.fsPath;
        this.ensureStorageDirectory();
  }
    private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

    private getLogFilePath(date: string): string {
    return path.join(this.storagePath, `activity-${date}.json`);
  }

    public loadDailyLog(date: string): DailyActivityLog | null {
    const filePath = this.getLogFilePath(date);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

        try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData) as DailyActivityLog;
    } catch (error) {
      console.error(`Error loading daily log for ${date}:`, error);
      return null;
    }
  }

    public saveDailyLog(dailyLog: DailyActivityLog): void {
    const filePath = this.getLogFilePath(dailyLog.date);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(dailyLog, null, 2));
    } catch (error) {
      console.error(`Error saving daily log for ${dailyLog.date}:`, error);
    }
  }

    public addActivity(activity: CodingActivity): void {
    const today = new Date().toISOString().split('T')[0];
    let dailyLog = this.loadDailyLog(today);
    
    if (!dailyLog) {
      dailyLog = this.createEmptyDailyLog(today);
    }

        let currentSession = dailyLog.sessions.find(session => !session.endTime);
    
    if (!currentSession) {
      currentSession = this.createNewSession();
      dailyLog.sessions.push(currentSession);
    }

        currentSession.activities.push(activity);
    this.updateSessionMetadata(currentSession, activity);
    this.updateDailySummary(dailyLog);
    this.saveDailyLog(dailyLog);
  }

    private createEmptyDailyLog(date: string): DailyActivityLog {
    return {
      date,
      sessions: [],
      summary: {
        totalDuration: 0,
        totalKeystrokes: 0,
        totalSaves: 0,
        filesWorked: 0,
        languagesUsed: 0,
        mostActiveHour: 0,
        productivityScore: 0
      }
    };
  }

    private createNewSession(): ActivitySession {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      activities: [],
      metadata: {
        totalKeystrokes: 0,
        totalSaves: 0,
        filesWorked: [],
        languagesUsed: [],
        commandsExecuted: []
      }
    };
  }

    private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

    private updateSessionMetadata(session: ActivitySession, activity: CodingActivity): void {
    switch (activity.type) {
      case 'keystroke':
        session.metadata.totalKeystrokes += activity.data.keystrokes || 0;
        break;
      case 'save':
        session.metadata.totalSaves += 1;
        break;
      case 'command':
        if (activity.data.command && !session.metadata.commandsExecuted.includes(activity.data.command)) {
          session.metadata.commandsExecuted.push(activity.data.command);
        }
        break;
    }

        if (activity.data.filePath && !session.metadata.filesWorked.includes(activity.data.filePath)) {
      session.metadata.filesWorked.push(activity.data.filePath);
    }

        if (activity.data.language && !session.metadata.languagesUsed.includes(activity.data.language)) {
      session.metadata.languagesUsed.push(activity.data.language);
    }
  }

    private updateDailySummary(dailyLog: DailyActivityLog): void {
    const summary = dailyLog.summary;
    
    summary.totalKeystrokes = 0;
    summary.totalSaves = 0;
    summary.filesWorked = 0;
    summary.languagesUsed = 0;

        const allFiles = new Set<string>();
    const allLanguages = new Set<string>();
    const hourlyActivity = new Array(24).fill(0);
    summary.totalDuration = 0;

        for (const session of dailyLog.sessions) {
      summary.totalKeystrokes += session.metadata.totalKeystrokes;
      summary.totalSaves += session.metadata.totalSaves;

            session.metadata.filesWorked.forEach(file => allFiles.add(file));
      session.metadata.languagesUsed.forEach(lang => allLanguages.add(lang));

            for (const activity of session.activities) {
        const hour = new Date(activity.timestamp).getHours();
        hourlyActivity[hour]++;
      }

            if (session.endTime) {
        summary.totalDuration += (session.endTime - session.startTime) / (1000 * 60);
      } else {
        summary.totalDuration += (Date.now() - session.startTime) / (1000 * 60);
      }
    }
























