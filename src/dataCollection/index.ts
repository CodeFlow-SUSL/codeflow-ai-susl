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