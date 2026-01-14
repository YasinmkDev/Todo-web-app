import React from 'react';
import { Task, Project } from '../types/todo';
import { formatDueDate, isOverdue, isToday } from '../utils/dates';
import { Check, GripVertical, Repeat, CheckSquare, MoreHorizontal, Trash2, Copy, Flame } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onToggleComplete: (task: Task) => void;
  onClick: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  onToggleComplete,
  onClick,
  onDelete,
  onDuplicate,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isCompleted = task.status === 'completed';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const isRecurring = task.recurrence && task.recurrence.frequency !== 'none';
  const overdue = !isCompleted && isOverdue(task.dueDate);
  const dueToday = !isCompleted && isToday(task.dueDate);

  const priorityMeta = {
    p1: { label: 'P1 Urgent', color: '#f64932', textClass: 'text-[#f64932] font-semibold' },
    p2: { label: 'P2 High', color: '#ffb110', textClass: 'text-[#e89d01] font-medium' },
    p3: { label: 'P3 Medium', color: '#097fe8', textClass: 'text-[#097fe8]' },
    p4: { label: 'P4 Low', color: '#757575', textClass: 'text-black/50' },
    none: { label: '', color: 'transparent', textClass: 'text-black/30' },
  }[task.priority];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering if clicked on menu or checkbox
    if ((e.target as HTMLElement).closest('.stop-propagation')) return;
    onClick(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={handleCardClick}
      className={`group relative bg-white rounded-xl border border-black/[0.08] p-3.5 transition-all cursor-pointer select-none hover:border-black/20 ${
        isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'
      } ${isCompleted ? 'bg-black/[0.015]' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag handle */}
        <div
          className="mt-0.5 text-black/25 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing stop-propagation"
          title="Drag to organize"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 stop-propagation ${
            isCompleted
              ? 'bg-[#0075de] border-[#0075de] text-white'
              : 'border-black/25 hover:border-[#0075de] bg-transparent'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm leading-snug break-words ${
                isCompleted
                  ? 'line-through text-black/40 font-normal'
                  : 'text-black font-medium'
              }`}
            >
              {task.title}
            </h4>

            {/* Overflow card menu */}
            <div className="relative shrink-0 stop-propagation">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="opacity-0 group-hover:opacity-100 text-black/40 hover:text-black p-0.5 rounded transition-opacity"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 top-5 z-20 w-32 bg-white rounded-lg border border-black/[0.08] shadow-lg py-1 text-xs text-black"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(task);
                      setMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-black/[0.04]"
                  >
                    <Copy className="w-3 h-3" /> Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 text-[#f64932] hover:bg-[#f64932]/10"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description preview if present */}
          {task.description && !isCompleted && (
            <p className="mt-1 text-xs text-black/55 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Unboxed Metadata Row with typographic dots · */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/60">
            {/* Priority Indicator */}
            {task.priority !== 'none' && (
              <span className={`flex items-center gap-1 ${priorityMeta.textClass}`}>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: priorityMeta.color }}
                />
                {priorityMeta.label}
              </span>
            )}

            {/* Project */}
            {project && (
              <>
                {task.priority !== 'none' && <span className="text-black/30" aria-hidden="true">·</span>}
                <span className="text-black/70 flex items-center gap-1">
                  <span>{project.emoji}</span>
                  <span className="truncate max-w-[120px]">{project.name}</span>
                </span>
              </>
            )}

            {/* Due date */}
            {task.dueDate && (
              <>
                <span className="text-black/30" aria-hidden="true">·</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    overdue
                      ? 'text-[#f64932] font-medium'
                      : dueToday
                      ? 'text-[#e89d01] font-medium'
                      : 'text-black/60'
                  }`}
                >
                  {formatDueDate(task.dueDate)}
                </span>
              </>
            )}

            {/* Recurring info */}
            {isRecurring && (
              <>
                <span className="text-black/30" aria-hidden="true">·</span>
                <span
                  className="flex items-center gap-1 text-[#ffb110] font-medium"
                  title={`Repeats ${task.recurrence.frequency} (Streak: ${task.recurrence.streak || 0})`}
                >
                  <Repeat className="w-3 h-3" />
                  <span className="capitalize">{task.recurrence.frequency}</span>
                  {task.recurrence.streak > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums text-[#e89d01]">
                      <Flame className="w-2.5 h-2.5 text-[#f64932]" />
                      {task.recurrence.streak}
                    </span>
                  )}
                </span>
              </>
            )}

            {/* Subtasks progress */}
            {hasSubtasks && (
              <>
                <span className="text-black/30" aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-black/50 text-[11px] font-mono tabular-nums">
                  <CheckSquare className="w-3 h-3" />
                  <span>
                    {completedSubtasks}/{task.subtasks.length}
                  </span>
                </span>
              </>
            )}

            {/* Tags preview */}
            {task.tags && task.tags.length > 0 && (
              <>
                <span className="text-black/30" aria-hidden="true">·</span>
                <span className="text-black/45 text-[11px]">
                  {task.tags.map((t) => `#${t}`).join(' ')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
