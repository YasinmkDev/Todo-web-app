export type Priority = 'p1' | 'p2' | 'p3' | 'p4' | 'none';

export type Status = 'todo' | 'in_progress' | 'review' | 'completed';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g. every 1 day, every 2 weeks
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  streak: number; // Current streak count
  bestStreak: number;
  lastCompletedDate?: string;
  nextDueDate?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  projectId: string;
  tags: string[];
  dueDate: string | null; // ISO YYYY-MM-DD
  dueTime?: string | null; // HH:mm
  estimatedMinutes?: number;
  recurrence: RecurrenceRule;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
}

export type ViewMode = 'list' | 'board' | 'calendar' | 'analytics';

export type GroupBy = 'status' | 'priority' | 'project' | 'none';

export interface FilterOptions {
  search: string;
  priority: Priority | 'all';
  status: Status | 'all' | 'uncompleted';
  projectId: string | 'all';
  recurringOnly: boolean;
  dateRange: 'all' | 'today' | 'upcoming' | 'overdue';
  tag: string | 'all';
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'info' | 'warning' | 'error';
  itemCount: number;
}

export interface SyncState {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string | null;
  syncRoomId: string;
  isOfflineMode: boolean;
  pendingChanges: number;
  logs: SyncLogEntry[];
  serverPingMs: number;
}
