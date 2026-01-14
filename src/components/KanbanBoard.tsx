import React, { useState } from 'react';
import { Task, Project, Status, Priority } from '../types/todo';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  groupByMode: 'status' | 'priority';
  onUpdateTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onQuickAdd: (columnKey: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  projects,
  groupByMode,
  onUpdateTask,
  onToggleComplete,
  onDeleteTask,
  onDuplicateTask,
  onSelectTask,
  onQuickAdd,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);

  const projectMap = React.useMemo(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  const handleDragStart = (_e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (activeDropColumn !== colKey) {
      setActiveDropColumn(colKey);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColKey: string) => {
    e.preventDefault();
    setActiveDropColumn(null);
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task) return;

    if (groupByMode === 'status') {
      const targetStatus = targetColKey as Status;
      if (task.status !== targetStatus) {
        const isNowCompleted = targetStatus === 'completed';
        onUpdateTask({
          ...task,
          status: targetStatus,
          completedAt: isNowCompleted ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      const targetPriority = targetColKey as Priority;
      if (task.priority !== targetPriority) {
        onUpdateTask({
          ...task,
          priority: targetPriority,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    setDraggedTaskId(null);
  };

  // Define columns based on groupByMode
  const columns = groupByMode === 'status'
    ? [
        { key: 'todo', title: 'To Do', color: '#615d59' },
        { key: 'in_progress', title: 'In Progress', color: '#0075de' },
        { key: 'review', title: 'In Review', color: '#ffb110' },
        { key: 'completed', title: 'Completed', color: '#16a34a' },
      ]
    : [
        { key: 'p1', title: 'P1 Urgent', color: '#f64932' },
        { key: 'p2', title: 'P2 High', color: '#ffb110' },
        { key: 'p3', title: 'P3 Medium', color: '#097fe8' },
        { key: 'p4', title: 'P4 Low', color: '#757575' },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-12">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => {
          if (groupByMode === 'status') return t.status === col.key;
          return t.priority === col.key;
        });

        const isDropTarget = activeDropColumn === col.key;

        return (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            className={`flex flex-col min-h-[480px] rounded-xl transition-colors ${
              isDropTarget ? 'bg-[#e6f3fe]/50 outline-2 outline-dashed outline-[#0075de]/40' : 'bg-transparent'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-xs font-semibold text-black tracking-tight uppercase">
                  {col.title}
                </h3>
                <span className="font-mono text-xs text-black/40 tabular-nums">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onQuickAdd(col.key)}
                className="p-1 rounded text-black/40 hover:text-black hover:bg-black/[0.05] transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Cards Column */}
            <div className="flex-1 space-y-2.5">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={projectMap.get(task.projectId)}
                  onToggleComplete={onToggleComplete}
                  onClick={onSelectTask}
                  onDelete={onDeleteTask}
                  onDuplicate={onDuplicateTask}
                  isDragging={draggedTaskId === task.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="p-6 text-center rounded-xl border border-dashed border-black/[0.08] text-xs text-black/35 select-none">
                  Drop tasks here or click + to add
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
