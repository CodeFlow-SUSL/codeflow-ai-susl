export interface CodingActivity {
  id: string;          // Unique identifier for the activity
  timestamp: number;   // Unix timestamp in milliseconds
  type: ActivityType;  // Type of activity
  data: ActivityData;  // Activity-specific data
}

export enum ActivityType {
  KEYSTROKE = 'keystroke',
  SAVE = 'save',
  SWITCH_FILE = 'switch_file',
  OPEN_FILE = 'open_file',
  CLOSE_FILE = 'close_file',
  COMMAND = 'command'
}

export interface ActivityData {
  filePath?: string;
  language?: string;
  keystrokes?: number;
  command?: string;
}

export interface ActivitySession {
  id: string;
  startTime: number;
  endTime?: number;
  activities: CodingActivity[];
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  totalKeystrokes: number;
  totalSaves: number;
  filesWorked: string[];
  languagesUsed: string[];
  commandsExecuted: string[];
}

export interface DailyActivityLog {
  date: string;
  sessions: ActivitySession[];
  summary: DailySummary;
}

export interface DailySummary {
  totalDuration: number;
  totalKeystrokes: number;
  totalSaves: number;
}

export interface DailySummary {
  totalDuration: number;
  totalKeystrokes: number;
  totalSaves: number;
  filesWorked: number;
  languagesUsed: number;
}


