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










