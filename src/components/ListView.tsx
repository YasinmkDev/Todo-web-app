import React, { useState } from 'react';
import { Task, Project, GroupBy } from '../types/todo';
import { TaskCard } from './TaskCard';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  projects: Project[];
  groupBy: GroupBy;
  onUpdateTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onReorderTasks: (reorderedTasks: Task[]) => void;
  onQuickAddWithGroup: (groupValue: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  projects,
  groupBy,
  onToggleComplete,
  onDeleteTask,
  onDuplicateTask,
  onSelectTask,
  onReorderTasks,
  onQuickAddWithGroup,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const projectMap = React.useMemo(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleDragStart = (_e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnTask = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTask.id) return;

    const sourceIndex = tasks.findIndex((t) => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex((t) => t.id === targetTask.id);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [moved] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(targetIndex, 0, moved);

    // Update order values
    const ordered = newTasks.map((t, idx) => ({ ...t, order: idx + 1 }));
    onReorderTasks(ordered);
    setDraggedTaskId(null);
  };

  // Group tasks
  const groupedData = React.useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: 'All Tasks', items: tasks, color: '#0075de' }];
    }

    if (groupBy === 'status') {
      const statusMap: Record<string, { title: string; color: string }> = {
        todo: { title: 'To Do', color: '#615d59' },
        in_progress: { title: 'In Progress', color: '#0075de' },
        review: { title: 'In Review', color: '#ffb110' },
        completed: { title: 'Completed', color: '#16a34a' },
      };
      return Object.entries(statusMap).map(([statusKey, meta]) => ({
        key: statusKey,
        title: meta.title,
        color: meta.color,
        items: tasks.filter((t) => t.status === statusKey),
      }));
    }

    if (groupBy === 'priority') {
      const priorityMap: Record<string, { title: string; color: string }> = {
        p1: { title: 'P1 Urgent', color: '#f64932' },
        p2: { title: 'P2 High', color: '#ffb110' },
        p3: { title: 'P3 Medium', color: '#097fe8' },
        p4: { title: 'P4 Low', color: '#757575' },
        none: { title: 'No Priority', color: '#a0a0a0' },
      };
      return Object.entries(priorityMap).map(([priorityKey, meta]) => ({
        key: priorityKey,
        title: meta.title,
        color: meta.color,
        items: tasks.filter((t) => t.priority === priorityKey),
      }));
    }

    if (groupBy === 'project') {
      return projects.map((p) => ({
        key: p.id,
        title: `${p.emoji} ${p.name}`,
        color: p.color,
        items: tasks.filter((t) => t.projectId === p.id),
      }));
    }

    return [{ key: 'all', title: 'Tasks', items: tasks, color: '#0075de' }];
  }, [groupBy, tasks, projects]);

  return (
    <div className="space-y-6 pb-12">
      {groupedData.map((group) => {
        const isCollapsed = collapsedGroups[group.key];

        return (
          <div key={group.key} className="space-y-2">
            {/* Group Header */}
            {groupBy !== 'none' && (
              <div className="flex items-center justify-between py-1.5 px-1 border-b border-black/[0.06]">
                <button
                  onClick={() => toggleGroupCollapse(group.key)}
                  className="flex items-center gap-2 text-xs font-semibold text-black/80 hover:text-black transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-black/40" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-black/40" />
                  )}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span>{group.title}</span>
                  <span className="font-mono text-[11px] text-black/40 tabular-nums">
                    ({group.items.length})
                  </span>
                </button>

                <button
                  onClick={() => onQuickAddWithGroup(group.key)}
                  className="p-1 rounded text-black/40 hover:text-black hover:bg-black/[0.04] transition-colors"
                  title="Add task in this group"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Group Content */}
            {!isCollapsed && (
              <div className="space-y-2">
                {group.items.map((task) => (
                  <div
                    key={task.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnTask(e, task)}
                  >
                    <TaskCard
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
                  </div>
                ))}

                {group.items.length === 0 && (
                  <div className="py-4 text-center text-xs text-black/35 rounded-xl border border-dashed border-black/[0.06]">
                    No tasks in {group.title}. Click + above to add one.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
