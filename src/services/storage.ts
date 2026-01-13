import { Task, Project, SyncState, SyncLogEntry } from '../types/todo';
import { getTodayDateString, addDays } from '../utils/dates';

const STORAGE_KEY_TASKS = 'notion_todo_tasks_v1';
const STORAGE_KEY_PROJECTS = 'notion_todo_projects_v1';
const STORAGE_KEY_SYNC = 'notion_todo_sync_state_v1';
const STORAGE_KEY_SNAPSHOTS = 'notion_todo_snapshots_v1';

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-eng',
    name: 'Product & Engineering',
    emoji: '⚡',
    color: '#0075de',
    description: 'Sprint backlogs, architecture docs, and technical debt',
  },
  {
    id: 'proj-design',
    name: 'Design System',
    emoji: '🎨',
    color: '#ffb110',
    description: 'Notion style tokens, component library, and visual polish',
  },
  {
    id: 'proj-habits',
    name: 'Daily Habits & Mindset',
    emoji: '🌱',
    color: '#f64932',
    description: 'Continuous focus, morning review, and deep work routines',
  },
  {
    id: 'proj-growth',
    name: 'Growth & Research',
    emoji: '📖',
    color: '#097fe8',
    description: 'Books, technical articles, and customer interviews',
  },
];

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 6);
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const threeDaysAgo = addDays(today, -3);

  return [
    {
      id: 'task-1',
      title: 'Resolve critical OAuth session token refresh edge case',
      description: 'Ensure token re-issue does not interrupt background sync for mobile webview clients. Write unit tests for exponential backoff.',
      priority: 'p1',
      status: 'in_progress',
      projectId: 'proj-eng',
      tags: ['auth', 'urgent', 'backend'],
      dueDate: today,
      dueTime: '14:00',
      estimatedMinutes: 45,
      recurrence: {
        frequency: 'none',
        interval: 1,
        streak: 0,
        bestStreak: 0,
      },
      subtasks: [
        { id: 'st-1-1', title: 'Trace token expiry event emitter', completed: true },
        { id: 'st-1-2', title: 'Implement mutex lock during token exchange', completed: true },
        { id: 'st-1-3', title: 'Verify offline queue handling', completed: false },
        { id: 'st-1-4', title: 'Deploy staging hotfix verification', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 1,
    },
    {
      id: 'task-2',
      title: 'Morning workspace standup & priority triaging',
      description: 'Review blocked items, scan support escalations, and align top 3 needle-moving tasks for the day.',
      priority: 'p2',
      status: 'todo',
      projectId: 'proj-habits',
      tags: ['routine', 'focus'],
      dueDate: today,
      dueTime: '09:00',
      estimatedMinutes: 20,
      recurrence: {
        frequency: 'daily',
        interval: 1,
        streak: 8,
        bestStreak: 14,
        lastCompletedDate: yesterday,
        nextDueDate: tomorrow,
      },
      subtasks: [
        { id: 'st-2-1', title: 'Clear notification queue', completed: true },
        { id: 'st-2-2', title: 'Star top 3 deliverables for today', completed: false },
        { id: 'st-2-3', title: 'Confirm async unblockers for team', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 2,
    },
    {
      id: 'task-3',
      title: 'Refactor Notion style tokens into strict CSS custom properties',
      description: 'Implement #f6f5f4 warm canvas, 1px solid hairline borders, and zero-drop-shadow cards across all views.',
      priority: 'p2',
      status: 'todo',
      projectId: 'proj-design',
      tags: ['design-system', 'css', 'polish'],
      dueDate: tomorrow,
      dueTime: '17:00',
      estimatedMinutes: 90,
      recurrence: {
        frequency: 'none',
        interval: 1,
        streak: 0,
        bestStreak: 0,
      },
      subtasks: [
        { id: 'st-3-1', title: 'Audit card borders for rgba(0,0,0,0.08)', completed: true },
        { id: 'st-3-2', title: 'Apply negative tracking to display headers', completed: false },
        { id: 'st-3-3', title: 'Verify responsive 12px border radius', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 3,
    },
    {
      id: 'task-4',
      title: 'Weekly engineering architecture & backlog grooming',
      description: 'Review performance traces, prune inactive tags, and schedule upcoming sprint issues.',
      priority: 'p2',
      status: 'todo',
      projectId: 'proj-eng',
      tags: ['architecture', 'sprint'],
      dueDate: nextWeek,
      dueTime: '15:30',
      estimatedMinutes: 60,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [5], // Friday
        streak: 4,
        bestStreak: 7,
        lastCompletedDate: addDays(today, -7),
      },
      subtasks: [
        { id: 'st-4-1', title: 'Review memory profiling graphs', completed: false },
        { id: 'st-4-2', title: 'Assign spike owners for Q4 roadmaps', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 4,
    },
    {
      id: 'task-5',
      title: 'Deep work reading: High Output Management & System Scaling',
      description: 'Read 30 pages of chapter on Task Relevant Maturity and document core insights in team notebook.',
      priority: 'p3',
      status: 'review',
      projectId: 'proj-growth',
      tags: ['reading', 'leadership'],
      dueDate: today,
      estimatedMinutes: 35,
      recurrence: {
        frequency: 'weekdays',
        interval: 1,
        streak: 11,
        bestStreak: 18,
        lastCompletedDate: yesterday,
      },
      subtasks: [
        { id: 'st-5-1', title: 'Read pages 140-170', completed: true },
        { id: 'st-5-2', title: 'Write 3 actionable synthesis notes', completed: true },
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 5,
    },
    {
      id: 'task-6',
      title: 'Audit multi-cloud telemetry and provision storage quotas',
      description: 'Check Postgres IOPS limits and configure auto-scaling triggers for document blob stores.',
      priority: 'p3',
      status: 'todo',
      projectId: 'proj-eng',
      tags: ['cloud', 'devops'],
      dueDate: addDays(today, 4),
      estimatedMinutes: 45,
      recurrence: {
        frequency: 'monthly',
        interval: 1,
        streak: 2,
        bestStreak: 3,
      },
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 6,
    },
    {
      id: 'task-7',
      title: 'Update team product design system changelog',
      description: 'Document button micro-interaction guidelines and typography scale updates.',
      priority: 'p4',
      status: 'todo',
      projectId: 'proj-design',
      tags: ['documentation'],
      dueDate: addDays(today, 5),
      estimatedMinutes: 30,
      recurrence: {
        frequency: 'none',
        interval: 1,
        streak: 0,
        bestStreak: 0,
      },
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 7,
    },
    // Historical completed tasks for rich analytics
    {
      id: 'task-c1',
      title: 'Conduct weekly retrospective & ship beta build v2.4',
      description: 'Summarized team wins, updated release notes, and pushed to staging.',
      priority: 'p1',
      status: 'completed',
      projectId: 'proj-eng',
      tags: ['release', 'sprint'],
      dueDate: yesterday,
      estimatedMinutes: 60,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        streak: 5,
        bestStreak: 5,
      },
      subtasks: [
        { id: 'st-c1-1', title: 'Run CI test suite', completed: true },
        { id: 'st-c1-2', title: 'Notify QA channel', completed: true },
      ],
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      order: 101,
    },
    {
      id: 'task-c2',
      title: 'Daily physical training & mobility session',
      description: '45-minute strength routine and 15-minute mobility work.',
      priority: 'p2',
      status: 'completed',
      projectId: 'proj-habits',
      tags: ['health', 'routine'],
      dueDate: yesterday,
      estimatedMinutes: 60,
      recurrence: {
        frequency: 'daily',
        interval: 1,
        streak: 12,
        bestStreak: 20,
      },
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 35).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      order: 102,
    },
    {
      id: 'task-c3',
      title: 'Setup automated linting & TypeScript strict mode rules',
      description: 'Added strict null checks and banned any types across core packages.',
      priority: 'p2',
      status: 'completed',
      projectId: 'proj-eng',
      tags: ['tooling'],
      dueDate: twoDaysAgo,
      estimatedMinutes: 40,
      recurrence: {
        frequency: 'none',
        interval: 1,
        streak: 0,
        bestStreak: 0,
      },
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      order: 103,
    },
    {
      id: 'task-c4',
      title: 'Review user feedback on drag-and-drop kanban interactions',
      description: 'Synthesized 14 customer interview recordings regarding column reordering.',
      priority: 'p3',
      status: 'completed',
      projectId: 'proj-growth',
      tags: ['feedback', 'ux'],
      dueDate: threeDaysAgo,
      estimatedMinutes: 50,
      recurrence: {
        frequency: 'none',
        interval: 1,
        streak: 0,
        bestStreak: 0,
      },
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 80).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
      order: 104,
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return getInitialTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadProjectsFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      saveProjectsToStorage(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load projects from localStorage', err);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjectsToStorage(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
}

export function loadSyncState(): SyncState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNC);
    if (!raw) {
      const initialSync: SyncState = {
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        syncRoomId: 'workspace-notion-focus-01',
        isOfflineMode: false,
        pendingChanges: 0,
        serverPingMs: 32,
        logs: [
          {
            id: 'log-1',
            timestamp: new Date().toLocaleTimeString(),
            action: 'Vault handshake established',
            status: 'success',
            itemCount: 11,
          },
        ],
      };
      saveSyncState(initialSync);
      return initialSync;
    }
    return JSON.parse(raw);
  } catch (err) {
    return {
      status: 'synced',
      lastSyncedAt: new Date().toISOString(),
      syncRoomId: 'workspace-notion-focus-01',
      isOfflineMode: false,
      pendingChanges: 0,
      serverPingMs: 32,
      logs: [],
    };
  }
}

export function saveSyncState(state: SyncState): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save sync state', err);
  }
}

export interface BackupSnapshot {
  id: string;
  name: string;
  timestamp: string;
  taskCount: number;
  data: {
    tasks: Task[];
    projects: Project[];
  };
}

export function loadSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSnapshot(name: string, tasks: Task[], projects: Project[]): BackupSnapshot {
  const snapshots = loadSnapshots();
  const newSnapshot: BackupSnapshot = {
    id: `snap-${Date.now()}`,
    name,
    timestamp: new Date().toLocaleString(),
    taskCount: tasks.length,
    data: { tasks, projects },
  };
  const updated = [newSnapshot, ...snapshots.slice(0, 9)];
  localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(updated));
  return newSnapshot;
}
