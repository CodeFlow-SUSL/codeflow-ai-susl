"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCollectionModule = void 0;
const activityTracker_1 = require("./activityTracker");
const dataStorage_1 = require("./dataStorage");
class DataCollectionModule {
    tracker;
    storage;
    constructor(context) {
        this.storage = new dataStorage_1.DataStorage(context);
        this.tracker = new activityTracker_1.ActivityTracker(context);
    }
    getActivitiesForDate(date) {
        const dailyLog = this.storage.loadDailyLog(date);
        if (!dailyLog) {
            return [];
        }
        const activities = [];
        for (const session of dailyLog.sessions) {
            activities.push(...session.activities);
        }
        return activities;
    }
    getActivitiesForDateRange(startDate, endDate) {
        return this.storage.getActivitiesForDateRange(startDate, endDate);
    }
    getAllDailyLogs() {
        return this.storage.getAllDailyLogs();
    }
    getDailySummary(date) {
        const dailyLog = this.storage.loadDailyLog(date);
        return dailyLog ? dailyLog.summary : null;
    }
    dispose() {
        this.tracker.dispose();
    }
}
exports.DataCollectionModule = DataCollectionModule;
//# sourceMappingURL=index.js.map