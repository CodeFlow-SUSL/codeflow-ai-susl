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

