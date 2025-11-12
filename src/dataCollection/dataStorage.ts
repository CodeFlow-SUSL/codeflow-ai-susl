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







