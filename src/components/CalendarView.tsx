import React, { useState } from 'react';
import { Task, Project } from '../types/todo';
import { getTodayDateString } from '../utils/dates';
import { ChevronLeft, ChevronRight, Plus, Repeat } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onAddTaskForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onAddTaskForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const projectMap = React.useMemo(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = getTodayDateString();

  // Create grid cells
  const cells: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remainingCells = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Map tasks by date
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  const priorityColor = (p: string) => {
    if (p === 'p1') return '#f64932';
    if (p === 'p2') return '#ffb110';
    if (p === 'p3') return '#097fe8';
    return '#757575';
  };

  return (
    <div className="bg-white rounded-xl border border-black/[0.08] p-4 shadow-none pb-8">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-black tracking-tight">{monthName}</h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-black/[0.04] text-black/70 hover:bg-black/[0.08] hover:text-black transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-black/[0.04] transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-black/[0.04] transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday columns */}
      <div className="grid grid-cols-7 gap-px mb-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-1 text-xs font-medium text-black/40">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-black/[0.08] rounded-lg overflow-hidden border border-black/[0.08]">
        {cells.map((cell) => {
          const dayTasks = tasksByDate[cell.dateStr] || [];

          return (
            <div
              key={cell.dateStr}
              onClick={() => onAddTaskForDate(cell.dateStr)}
              className={`min-h-[96px] p-1.5 flex flex-col justify-between transition-colors cursor-pointer group ${
                cell.isCurrentMonth ? 'bg-white hover:bg-[#f6f5f4]/80' : 'bg-[#faf9f8] text-black/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono tabular-nums inline-flex items-center justify-center w-5 h-5 rounded-full ${
                    cell.isToday
                      ? 'bg-[#0075de] text-white font-semibold'
                      : cell.isCurrentMonth
                      ? 'text-black/80'
                      : 'text-black/30'
                  }`}
                >
                  {cell.dayNum}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTaskForDate(cell.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-black/40 hover:text-black p-0.5 rounded transition-opacity"
                  title="Add task on this date"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Tasks for this day */}
              <div className="mt-1 space-y-1 flex-1">
                {dayTasks.slice(0, 3).map((t) => {
                  const proj = projectMap.get(t.projectId);
                  return (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(t);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[11px] truncate flex items-center gap-1 border border-black/[0.04] transition-all hover:border-black/20 ${
                        t.status === 'completed'
                          ? 'line-through text-black/35 bg-black/[0.02]'
                          : 'text-black/85 bg-[#f6f5f4]'
                      }`}
                      title={`${t.title} (${proj?.name || 'General'})`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: priorityColor(t.priority) }}
                      />
                      {t.recurrence.frequency !== 'none' && (
                        <Repeat className="w-2.5 h-2.5 text-[#ffb110] shrink-0" />
                      )}
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-black/45 font-mono pl-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
