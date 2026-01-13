import React, { useState } from 'react';
import { Priority, RecurrenceFrequency, Project } from '../types/todo';
import { getTodayDateString, addDays } from '../utils/dates';
import { Calendar, Repeat, Flag, Folder, Plus, ArrowRight } from 'lucide-react';

interface QuickAddBarProps {
  projects: Project[];
  defaultProjectId?: string;
  onAddTask: (taskData: {
    title: string;
    priority: Priority;
    projectId: string;
    dueDate: string | null;
    recurrenceFrequency: RecurrenceFrequency;
    tags: string[];
  }) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  projects,
  defaultProjectId,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('p2');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || projects[0]?.id || 'proj-eng');
  const [dueDate, setDueDate] = useState<string | null>(getTodayDateString());
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>('none');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    // Parse potential tags like #tag and priority like !p1
    let finalTitle = cleanTitle;
    let finalPriority = priority;
    const tags: string[] = [];

    const tagMatches = cleanTitle.match(/#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach(tag => tags.push(tag.replace('#', '')));
      finalTitle = finalTitle.replace(/#\w+/g, '').trim();
    }

    if (finalTitle.includes('!urgent') || finalTitle.includes('!p1')) {
      finalPriority = 'p1';
      finalTitle = finalTitle.replace(/!urgent|!p1/g, '').trim();
    } else if (finalTitle.includes('!high') || finalTitle.includes('!p2')) {
      finalPriority = 'p2';
      finalTitle = finalTitle.replace(/!high|!p2/g, '').trim();
    }

    onAddTask({
      title: finalTitle || cleanTitle,
      priority: finalPriority,
      projectId,
      dueDate,
      recurrenceFrequency: recurrence,
      tags,
    });

    setTitle('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const priorityColors: Record<Priority, string> = {
    p1: 'text-[#f64932]',
    p2: 'text-[#ffb110]',
    p3: 'text-[#097fe8]',
    p4: 'text-[#757575]',
    none: 'text-black/30',
  };

  return (
    <div className="bg-white rounded-xl border border-black/[0.08] p-3 shadow-none transition-all">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center text-black/40">
          <Plus className="w-4 h-4 stroke-[2]" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task... (Type #tag for tags, press Enter to save)"
          className="flex-1 bg-transparent text-sm text-black placeholder:text-black/40 outline-none"
        />

        <button
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            title.trim()
              ? 'bg-[#0075de] text-white hover:bg-[#097fe8]'
              : 'bg-black/[0.04] text-black/30 cursor-not-allowed'
          }`}
        >
          <span>Add</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Expanded quick option trays */}
      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Project picker */}
            <div className="flex items-center gap-1 bg-black/[0.03] px-2 py-1 rounded-md text-black/70">
              <Folder className="w-3 h-3 text-black/50" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                aria-label="Assign to project"
                className="bg-transparent text-xs text-black/80 outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority quick selector */}
            <div className="flex items-center gap-1 bg-black/[0.03] px-2 py-1 rounded-md">
              <Flag className={`w-3 h-3 ${priorityColors[priority]}`} />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                aria-label="Set task priority"
                className="bg-transparent text-xs text-black/80 outline-none cursor-pointer"
              >
                <option value="p1">P1 Urgent</option>
                <option value="p2">P2 High</option>
                <option value="p3">P3 Medium</option>
                <option value="p4">P4 Low</option>
                <option value="none">No Priority</option>
              </select>
            </div>

            {/* Due date presets */}
            <div className="flex items-center gap-1 bg-black/[0.03] px-2 py-1 rounded-md">
              <Calendar className="w-3 h-3 text-black/50" />
              <select
                value={dueDate || 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'none') setDueDate(null);
                  else if (val === 'today') setDueDate(getTodayDateString());
                  else if (val === 'tomorrow') setDueDate(addDays(getTodayDateString(), 1));
                  else if (val === 'next_week') setDueDate(addDays(getTodayDateString(), 7));
                  else setDueDate(val);
                }}
                aria-label="Set due date"
                className="bg-transparent text-xs text-black/80 outline-none cursor-pointer"
              >
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="next_week">Next Week</option>
                <option value="none">No Due Date</option>
              </select>
            </div>

            {/* Recurrence Rule */}
            <div className="flex items-center gap-1 bg-black/[0.03] px-2 py-1 rounded-md">
              <Repeat className="w-3 h-3 text-[#ffb110]" />
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceFrequency)}
                aria-label="Set recurrence frequency"
                className="bg-transparent text-xs text-black/80 outline-none cursor-pointer"
              >
                <option value="none">No Recurrence</option>
                <option value="daily">Repeats Daily</option>
                <option value="weekdays">Weekdays (Mon–Fri)</option>
                <option value="weekly">Repeats Weekly</option>
                <option value="monthly">Repeats Monthly</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-black/40">
            Tip: Press Enter to add
          </div>
        </div>
      )}
    </div>
  );
};
