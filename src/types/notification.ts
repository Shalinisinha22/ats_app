export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type?: 'system' | 'shortlist' | 'application' | 'other';
}