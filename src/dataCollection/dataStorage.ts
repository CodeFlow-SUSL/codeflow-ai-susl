import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DailyActivityLog, CodingActivity, ActivitySession, SessionMetadata } from './types';

export class DataStorage {
      private context: vscode.ExtensionContext;
        private storagePath: string;
        





