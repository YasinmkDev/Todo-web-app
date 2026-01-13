import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  Project,
  ViewMode,
  GroupBy,
  FilterOptions,
  SyncState,
  Priority,
  RecurrenceFrequency,
} from './types/todo';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadProjectsFromStorage,
  saveProjectsToStorage,
  loadSyncState,
  saveSyncState,
  loadSnapshots,
  BackupSnapshot,
} from './services/storage';
import { advanceRecurringTask } from './utils/recurrence';
import { isOverdue, isToday, getTodayDateString, addDays } from './utils/dates';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { QuickAddBar } from './components/QuickAddBar';
import { ListView } from './components/ListView';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { CharacterMark, HandDrawnSquiggle } from './components/CharacterMark';
import { Menu, Filter, Sparkles, Plus, Flame, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  // Primary State
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStorage());
  const [syncState, setSyncState] = useState<SyncState>(() => loadSyncState());
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => loadSnapshots());

  // Navigation & View State
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    priority: 'all',
    status: 'all',
    projectId: 'all',
    recurringOnly: false,
    dateRange: 'all',
    tag: 'all',
  });

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Synchronize tasks to localStorage and record sync state
  const persistTasks = useCallback((newTasks: Task[], actionDescription?: string) => {
    setTasks(newTasks);
    saveTasksToStorage(newTasks);

    setSyncState((prev) => {
      const isOffline = prev.isOfflineMode;
      const nextPending = isOffline ? prev.pendingChanges + 1 : 0;
      const newLog = actionDescription
        ? {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: isOffline ? `[Offline Cached] ${actionDescription}` : actionDescription,
            status: isOffline ? ('warning' as const) : ('success' as const),
            itemCount: newTasks.length,
          }
        : null;

      const updatedLogs = newLog ? [newLog, ...prev.logs.slice(0, 19)] : prev.logs;
      const nextState: SyncState = {
        ...prev,
        pendingChanges: nextPending,
        status: isOffline ? 'offline' : 'synced',
        lastSyncedAt: isOffline ? prev.lastSyncedAt : new Date().toISOString(),
        logs: updatedLogs,
      };
      saveSyncState(nextState);
      return nextState;
    });
  }, []);

  const persistProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
    saveProjectsToStorage(newProjects);
  }, []);

  // Keyboard shortcut listeners: N for new task, Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenNewTaskModal();
      } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSyncModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects]);

  // Handle Complete / Uncomplete with Recurrence Cycle
  const handleToggleComplete = (task: Task) => {
    if (task.status === 'completed') {
      // Uncomplete task
      const updated: Task = {
        ...task,
        status: 'todo',
        completedAt: null,
        updatedAt: new Date().toISOString(),
      };
      const newTasks = tasks.map((t) => (t.id === task.id ? updated : t));
      persistTasks(newTasks, `Reopened "${task.title}"`);
    } else {
      // Completing task
      if (task.recurrence && task.recurrence.frequency !== 'none') {
        // Advance recurring task cycle: generates completed record + next scheduled instance
        const { completedInstance, nextInstance } = advanceRecurringTask(task);
        const newTasks = [
          nextInstance,
          completedInstance,
          ...tasks.filter((t) => t.id !== task.id),
        ];
        persistTasks(
          newTasks,
          `Completed recurring task "${task.title}" (Streak: ${nextInstance.recurrence.streak}d)`
        );
      } else {
        // Standard one-off task completion
        const updated: Task = {
          ...task,
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const newTasks = tasks.map((t) => (t.id === task.id ? updated : t));
        persistTasks(newTasks, `Completed "${task.title}"`);
      }
    }
  };

  // Add new task
  const handleAddTask = (taskData: {
    title: string;
    priority: Priority;
    projectId: string;
    dueDate: string | null;
    recurrenceFrequency: RecurrenceFrequency;
    tags: string[];
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: '',
      priority: taskData.priority,
      status: 'todo',
      projectId: taskData.projectId,
      tags: taskData.tags,
      dueDate: taskData.dueDate,
      estimatedMinutes: 30,
      recurrence: {
        frequency: taskData.recurrenceFrequency,
        interval: 1,
        streak: 0,
        bestStreak: 0,
      },
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      order: 0,
    };

    const newTasks = [newTask, ...tasks];
    persistTasks(newTasks, `Created task "${newTask.title}"`);
  };

  // Update existing task
  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    persistTasks(newTasks, `Updated task "${updatedTask.title}"`);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const newTasks = tasks.filter((t) => t.id !== taskId);
    persistTasks(newTasks, `Deleted task "${taskToDelete?.title || taskId}"`);
  };

  // Duplicate task
  const handleDuplicateTask = (task: Task) => {
    const dup: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'todo',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recurrence: {
        ...task.recurrence,
        streak: 0,
      },
      subtasks: task.subtasks.map((st) => ({
        ...st,
        id: `st-${Date.now()}-${Math.random()}`,
        completed: false,
      })),
      order: task.order + 1,
    };
    persistTasks([dup, ...tasks], `Duplicated task "${task.title}"`);
  };

  // Reorder tasks in list
  const handleReorderTasks = (reorderedTasks: Task[]) => {
    persistTasks(reorderedTasks, 'Reordered task hierarchy');
  };

  // Open modal for brand new task
  const handleOpenNewTaskModal = (defaultDueDate?: string, defaultStatus?: string) => {
    const blankTask: Task = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      priority: 'p2',
      status: (defaultStatus as any) || 'todo',
      projectId: projects[0]?.id || 'proj-eng',
      tags: [],
      dueDate: defaultDueDate || getTodayDateString(),
      dueTime: '12:00',
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
      order: 0,
    };
    setSelectedTask(blankTask);
    setIsTaskModalOpen(true);
  };

  // Add project
  const handleAddProject = (newProj: { name: string; emoji: string; color: string }) => {
    const created: Project = {
      id: `proj-${Date.now()}`,
      name: newProj.name,
      emoji: newProj.emoji,
      color: newProj.color,
    };
    const updated = [...projects, created];
    persistProjects(updated);
  };

  // Cloud Sync Controls
  const handleTriggerSync = () => {
    setSyncState((prev) => ({ ...prev, status: 'syncing' }));

    setTimeout(() => {
      setSyncState((prev) => {
        const next: SyncState = {
          ...prev,
          status: 'synced',
          lastSyncedAt: new Date().toISOString(),
          pendingChanges: 0,
          serverPingMs: Math.floor(Math.random() * 20) + 24,
          logs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              action: `Vault bidirectional handshake synced (${tasks.length} items)`,
              status: 'success',
              itemCount: tasks.length,
            },
            ...prev.logs.slice(0, 19),
          ],
        };
        saveSyncState(next);
        return next;
      });
    }, 600);
  };

  const handleToggleOffline = () => {
    setSyncState((prev) => {
      const isNowOffline = !prev.isOfflineMode;
      const next: SyncState = {
        ...prev,
        isOfflineMode: isNowOffline,
        status: isNowOffline ? 'offline' : 'synced',
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: isNowOffline ? 'Simulating offline network disconnect' : 'Reconnected online to Cloud Vault',
            status: isNowOffline ? 'warning' : 'info',
            itemCount: tasks.length,
          },
          ...prev.logs.slice(0, 19),
        ],
      };
      saveSyncState(next);
      return next;
    });
  };

  const handleChangeSyncRoom = (roomId: string) => {
    if (!roomId.trim()) return;
    setSyncState((prev) => {
      const next: SyncState = {
        ...prev,
        syncRoomId: roomId.trim(),
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: `Switched vault partition to "${roomId.trim()}"`,
            status: 'info',
            itemCount: tasks.length,
          },
          ...prev.logs.slice(0, 19),
        ],
      };
      saveSyncState(next);
      return next;
    });
  };

  const handleRestoreSnapshot = (snapshot: BackupSnapshot) => {
    if (window.confirm(`Restore snapshot "${snapshot.name}"? This will replace current tasks.`)) {
      setTasks(snapshot.data.tasks);
      saveTasksToStorage(snapshot.data.tasks);
      if (snapshot.data.projects) {
        setProjects(snapshot.data.projects);
        saveProjectsToStorage(snapshot.data.projects);
      }
      setIsSyncModalOpen(false);
    }
  };

  const handleImportData = (data: { tasks: Task[]; projects: Project[] }) => {
    setTasks(data.tasks);
    saveTasksToStorage(data.tasks);
    if (data.projects) {
      setProjects(data.projects);
      saveProjectsToStorage(data.projects);
    }
  };

  const handleNewSnapshotCreated = (snap: BackupSnapshot) => {
    setSnapshots([snap, ...snapshots]);
  };

  // Filter & Compute tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesTag = t.tags.some((tag) => tag.toLowerCase().includes(query.replace('#', '')));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Priority
      if (filters.priority !== 'all' && t.priority !== filters.priority) {
        return false;
      }

      // Status
      if (filters.status === 'completed' && t.status !== 'completed') return false;
      if (filters.status === 'uncompleted' && t.status === 'completed') return false;

      // Project
      if (filters.projectId !== 'all' && t.projectId !== filters.projectId) {
        return false;
      }

      // Recurring only
      if (filters.recurringOnly && t.recurrence.frequency === 'none') {
        return false;
      }

      // Date Range
      if (filters.dateRange === 'today') {
        if (!isToday(t.dueDate)) return false;
      } else if (filters.dateRange === 'overdue') {
        if (t.status === 'completed' || !isOverdue(t.dueDate)) return false;
      } else if (filters.dateRange === 'upcoming') {
        if (!t.dueDate || isOverdue(t.dueDate)) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Counts for sidebar badges
  const taskCounts = useMemo(() => {
    const counts = {
      all: tasks.filter((t) => t.status !== 'completed').length,
      today: tasks.filter((t) => t.status !== 'completed' && isToday(t.dueDate)).length,
      recurring: tasks.filter((t) => t.recurrence.frequency !== 'none').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      p1: tasks.filter((t) => t.status !== 'completed' && t.priority === 'p1').length,
      p2: tasks.filter((t) => t.status !== 'completed' && t.priority === 'p2').length,
      p3: tasks.filter((t) => t.status !== 'completed' && t.priority === 'p3').length,
      p4: tasks.filter((t) => t.status !== 'completed' && t.priority === 'p4').length,
      byProject: {} as Record<string, number>,
    };

    projects.forEach((p) => {
      counts.byProject[p.id] = tasks.filter(
        (t) => t.projectId === p.id && t.status !== 'completed'
      ).length;
    });

    return counts;
  }, [tasks, projects]);

  return (
    <div className="min-h-screen bg-[#f6f5f4] text-black flex flex-col font-sans selection:bg-[#ffb110]/30">
      {/* Top 3-Zone Navigation */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        syncState={syncState}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenNewTaskModal={() => handleOpenNewTaskModal()}
      />

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          projects={projects}
          filterOptions={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          onAddProject={handleAddProject}
          taskCounts={taskCounts}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 space-y-6">
          {/* Mobile menu trigger + View title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg bg-white border border-black/[0.08] text-black/70 hover:text-black"
                title="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-black flex items-center gap-2">
                    <span>
                      {currentView === 'board'
                        ? 'Kanban Board'
                        : currentView === 'list'
                        ? 'Master Notebook List'
                        : currentView === 'calendar'
                        ? 'Schedule & Deadlines'
                        : 'Performance Analytics'}
                    </span>
                  </h1>

                  {/* Filter active chip if applied */}
                  {(filters.priority !== 'all' ||
                    filters.recurringOnly ||
                    filters.projectId !== 'all' ||
                    filters.search) && (
                    <button
                      onClick={() =>
                        setFilters({
                          search: '',
                          priority: 'all',
                          status: 'all',
                          projectId: 'all',
                          recurringOnly: false,
                          dateRange: 'all',
                          tag: 'all',
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-[#0075de] bg-[#e6f3fe] hover:bg-[#d6ebfc] px-2 py-0.5 rounded-full transition-colors"
                    >
                      <span>Filtered</span>
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-black/50 font-editorial mt-0.5">
                  Warm paper notebook · {filteredTasks.length} items shown
                </p>
              </div>
            </div>

            {/* Quick stats in header */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-black/[0.08]">
                <Flame className="w-3.5 h-3.5 text-[#f64932]" />
                <span className="text-black/60">Habits:</span>
                <span className="font-mono font-semibold tabular-nums text-black">
                  {taskCounts.recurring}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-black/[0.08]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-black/60">Done:</span>
                <span className="font-mono font-semibold tabular-nums text-black">
                  {taskCounts.completed}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Notion Hero banner if list or board view */}
          {currentView !== 'analytics' && (
            <div className="bg-white rounded-xl border border-black/[0.08] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-black/45 font-editorial">
                  <span>Afternoon Light Session</span>
                  <span>·</span>
                  <span className="font-mono text-[11px]">Vault: {syncState.syncRoomId}</span>
                </div>
                <h2 className="text-base sm:text-lg font-medium text-black flex flex-wrap items-center gap-1.5">
                  <span>Where focus and tasks</span>
                  {/* Signature Notion Hero Highlight Pill from design.md */}
                  <span className="bg-[#f6d5b8] text-black px-2.5 py-0.5 rounded-full text-sm font-semibold inline-block">
                    Flow
                  </span>
                  <span>into quiet momentum.</span>
                </h2>
              </div>

              {/* Character Marks Row: 4 illustrated faces with colored borders */}
              <div className="flex items-center -space-x-1.5 shrink-0">
                <CharacterMark type="thinker" color="blue" size="md" />
                <CharacterMark type="creator" color="coral" size="md" />
                <CharacterMark type="reader" color="yellow" size="md" />
                <CharacterMark type="focus" color="sky" size="md" />
              </div>
            </div>
          )}

          {/* Quick Add Bar */}
          {currentView !== 'analytics' && (
            <QuickAddBar
              projects={projects}
              defaultProjectId={filters.projectId !== 'all' ? filters.projectId : undefined}
              onAddTask={handleAddTask}
            />
          )}

          {/* Main View Switcher */}
          {currentView === 'board' && (
            <KanbanBoard
              tasks={filteredTasks}
              projects={projects}
              groupByMode={groupBy === 'priority' ? 'priority' : 'status'}
              onUpdateTask={handleUpdateTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onQuickAdd={(colKey) => {
                if (groupBy === 'priority') {
                  handleOpenNewTaskModal(undefined, undefined);
                } else {
                  handleOpenNewTaskModal(undefined, colKey);
                }
              }}
            />
          )}

          {currentView === 'list' && (
            <ListView
              tasks={filteredTasks}
              projects={projects}
              groupBy={groupBy}
              onUpdateTask={handleUpdateTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onReorderTasks={handleReorderTasks}
              onQuickAddWithGroup={(groupKey) => {
                if (groupBy === 'status') {
                  handleOpenNewTaskModal(undefined, groupKey);
                } else {
                  handleOpenNewTaskModal();
                }
              }}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              projects={projects}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onAddTaskForDate={(dateStr) => {
                handleOpenNewTaskModal(dateStr);
              }}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView tasks={tasks} projects={projects} />
          )}
        </main>
      </div>

      {/* Task Inspection & Edit Modal */}
      <TaskModal
        task={selectedTask}
        projects={projects}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSaveTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Cloud Sync & Vault Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncState={syncState}
        tasks={tasks}
        projects={projects}
        snapshots={snapshots}
        onTriggerSync={handleTriggerSync}
        onToggleOffline={handleToggleOffline}
        onChangeSyncRoom={handleChangeSyncRoom}
        onRestoreSnapshot={handleRestoreSnapshot}
        onImportData={handleImportData}
        onNewSnapshotCreated={handleNewSnapshotCreated}
      />
    </div>
  );
}
