import React, { useState } from 'react';
import { Task, Project, Priority, Status, RecurrenceFrequency, Subtask } from '../types/todo';
import { calculateNextDueDate, formatRecurrenceLabel } from '../utils/recurrence';
import { getTodayDateString, addDays } from '../utils/dates';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  Repeat,
  Flag,
  Folder,
  Tag,
  Plus,
  Check,
  Flame,
  CheckSquare,
} from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  projects,
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
}) => {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<Status>(task.status);
  const [projectId, setProjectId] = useState(task.projectId);
  const [dueDate, setDueDate] = useState<string | null>(task.dueDate);
  const [dueTime, setDueTime] = useState<string | null>(task.dueTime || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(task.estimatedMinutes || 30);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Recurrence rule state
  const [recFrequency, setRecFrequency] = useState<RecurrenceFrequency>(
    task.recurrence?.frequency || 'none'
  );
  const [recInterval, setRecInterval] = useState<number>(task.recurrence?.interval || 1);
  const [recDaysOfWeek, setRecDaysOfWeek] = useState<number[]>(task.recurrence?.daysOfWeek || []);

  // Subtasks state
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;

    const updatedRecurrence = {
      ...task.recurrence,
      frequency: recFrequency,
      interval: recInterval,
      daysOfWeek: recDaysOfWeek,
      nextDueDate:
        recFrequency !== 'none'
          ? calculateNextDueDate(
              {
                ...task.recurrence,
                frequency: recFrequency,
                interval: recInterval,
                daysOfWeek: recDaysOfWeek,
              },
              dueDate || getTodayDateString()
            )
          : undefined,
    };

    const updated: Task = {
      ...task,
      title: title.trim(),
      description,
      priority,
      status,
      projectId,
      dueDate,
      dueTime: dueTime || null,
      estimatedMinutes,
      tags,
      recurrence: updatedRecurrence,
      subtasks,
      updatedAt: new Date().toISOString(),
      completedAt: status === 'completed' && !task.completedAt ? new Date().toISOString() : task.completedAt,
    };

    onSaveTask(updated);
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const toggleDayOfWeek = (day: number) => {
    if (recDaysOfWeek.includes(day)) {
      setRecDaysOfWeek(recDaysOfWeek.filter((d) => d !== day));
    } else {
      setRecDaysOfWeek([...recDaysOfWeek, day]);
    }
  };

  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-black/[0.08] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-[#f6f5f4]/50">
          <div className="flex items-center gap-2 text-xs text-black/50">
            <span>Edit Task</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-black/40">{task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Delete this task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-1.5 text-black/40 hover:text-[#f64932] hover:bg-[#f64932]/10 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-black/40 hover:text-black hover:bg-black/[0.05] rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Title input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full text-xl font-semibold text-black placeholder:text-black/30 outline-none bg-transparent"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs py-2 border-y border-black/[0.06]">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-black/50 flex items-center gap-1.5 shrink-0">
                <CheckSquare className="w-3.5 h-3.5" />
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-md px-2 py-1.5 text-xs text-black outline-none font-medium cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-black/50 flex items-center gap-1.5 shrink-0">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-md px-2 py-1.5 text-xs text-black outline-none font-medium cursor-pointer"
              >
                <option value="p1">P1 Urgent (Vermillion)</option>
                <option value="p2">P2 High (Marigold)</option>
                <option value="p3">P3 Medium (Sky Blue)</option>
                <option value="p4">P4 Low (Slate)</option>
                <option value="none">No Priority</option>
              </select>
            </div>

            {/* Project */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-black/50 flex items-center gap-1.5 shrink-0">
                <Folder className="w-3.5 h-3.5" />
                Project
              </span>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-md px-2 py-1.5 text-xs text-black outline-none font-medium cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date & Time */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-black/50 flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </span>
              <div className="flex-1 flex gap-1">
                <input
                  type="date"
                  value={dueDate || ''}
                  onChange={(e) => setDueDate(e.target.value || null)}
                  className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-md px-2 py-1 text-xs text-black outline-none font-mono"
                />
                <input
                  type="time"
                  value={dueTime || ''}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-20 bg-black/[0.03] border border-black/[0.06] rounded-md px-1 py-1 text-xs text-black outline-none font-mono"
                />
              </div>
            </div>

            {/* Estimated Minutes */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-black/50 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                Estimate
              </span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-24 bg-black/[0.03] border border-black/[0.06] rounded-md px-2 py-1.5 text-xs text-black outline-none font-mono tabular-nums"
                />
                <span className="text-black/40">minutes</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-3">
              <span className="w-24 text-black/50 flex items-center gap-1.5 shrink-0">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </span>
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag and hit Enter..."
                  className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-md px-2 py-1.5 text-xs text-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Active Tags display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs text-black/70">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-[#f6f5f4] border border-black/[0.08] px-2 py-0.5 rounded text-[11px] flex items-center gap-1"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-[#f64932] transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Recurrence Settings Section */}
          <div className="bg-[#f6f5f4]/80 rounded-xl p-4 border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#ffb110]" />
                <span className="text-xs font-semibold text-black uppercase tracking-wider">
                  Recurring Task Rule
                </span>
              </div>
              {task.recurrence.streak > 0 && (
                <div className="flex items-center gap-1 text-xs font-mono text-[#e89d01]">
                  <Flame className="w-3.5 h-3.5 text-[#f64932]" />
                  <span>Streak: {task.recurrence.streak} days</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-black/50 block mb-1">Frequency</label>
                <select
                  value={recFrequency}
                  onChange={(e) => setRecFrequency(e.target.value as RecurrenceFrequency)}
                  className="w-full bg-white border border-black/[0.08] rounded-md px-2 py-1.5 text-xs text-black outline-none"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays (Mon–Fri)</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {recFrequency !== 'none' && recFrequency !== 'weekdays' && (
                <div>
                  <label className="text-black/50 block mb-1">Repeat Every</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={recInterval}
                      onChange={(e) => setRecInterval(Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-white border border-black/[0.08] rounded-md px-2 py-1 text-xs font-mono tabular-nums outline-none"
                    />
                    <span className="text-black/60 capitalize">{recFrequency.replace('ly', 's')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Days Picker */}
            {recFrequency === 'weekly' && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-black/50">Repeat on specific days:</span>
                <div className="flex gap-1">
                  {weekDayNames.map((d, index) => {
                    const isSelected = recDaysOfWeek.includes(index);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDayOfWeek(index)}
                        className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${
                          isSelected
                            ? 'bg-[#0075de] text-white'
                            : 'bg-white border border-black/[0.08] text-black/70 hover:bg-black/[0.04]'
                        }`}
                      >
                        {d[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {recFrequency !== 'none' && (
              <div className="text-[11px] text-black/60 italic pt-1">
                {formatRecurrenceLabel({
                  frequency: recFrequency,
                  interval: recInterval,
                  daysOfWeek: recDaysOfWeek,
                  streak: task.recurrence?.streak || 0,
                  bestStreak: task.recurrence?.bestStreak || 0,
                })}
              </div>
            )}
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-black">
              <span className="uppercase tracking-wider">Subtasks & Checklist</span>
              <span className="font-mono text-black/45 tabular-nums">
                {subtasks.filter((s) => s.completed).length}/{subtasks.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-black/[0.02] border border-black/[0.04] text-xs group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      st.completed
                        ? 'bg-[#0075de] border-[#0075de] text-white'
                        : 'border-black/30 hover:border-[#0075de] bg-white'
                    }`}
                  >
                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <span
                    className={`flex-1 break-words ${
                      st.completed ? 'line-through text-black/40' : 'text-black'
                    }`}
                  >
                    {st.title}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 text-black/30 hover:text-[#f64932] p-1 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask step..."
                className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-md px-3 py-1.5 text-xs text-black placeholder:text-black/35 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-black/[0.05] hover:bg-black/[0.09] text-xs font-medium text-black rounded-md transition-colors"
              >
                Add Step
              </button>
            </div>
          </div>

          {/* Markdown/Description Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black uppercase tracking-wider">
              Notes & Specifications
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add rich context, meeting notes, links, or task requirements..."
              className="w-full bg-[#f6f5f4]/50 border border-black/[0.08] rounded-xl p-3 text-xs leading-relaxed text-black placeholder:text-black/35 outline-none resize-y"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-[#f6f5f4]/50 flex items-center justify-between">
          <div className="text-[11px] text-black/40">
            Press Esc to cancel
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-black/70 hover:text-black rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#0075de] hover:bg-[#097fe8] rounded-lg transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
