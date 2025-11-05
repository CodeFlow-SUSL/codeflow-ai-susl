export interface CodingActivity {
  id: string;          // Unique identifier for the activity
  timestamp: number;   // Unix timestamp in milliseconds
  type: ActivityType;  // Type of activity
  data: ActivityData;  // Activity-specific data
}
