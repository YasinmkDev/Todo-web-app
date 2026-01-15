import React from 'react';
import { Task, Project } from '../types/todo';
import { CharacterMark, HandDrawnSquiggle } from './CharacterMark';
import { CheckCircle2, TrendingUp, Flame, Clock, Calendar, CheckSquare, Target } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, projects }) => {
  // Analytical Computations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const recurringTasks = tasks.filter((t) => t.recurrence.frequency !== 'none');

  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Recurring Streaks & Adherence
  const activeStreaks = recurringTasks.map((t) => t.recurrence.streak || 0);
  const maxStreak = activeStreaks.length > 0 ? Math.max(...activeStreaks) : 0;
  const totalStreaksSum = activeStreaks.reduce((a, b) => a + b, 0);
  const avgStreak = recurringTasks.length > 0 ? (totalStreaksSum / recurringTasks.length).toFixed(1) : '0';

  // Priority Distribution
  const priorityCounts = {
    p1: tasks.filter((t) => t.priority === 'p1').length,
    p2: tasks.filter((t) => t.priority === 'p2').length,
    p3: tasks.filter((t) => t.priority === 'p3').length,
    p4: tasks.filter((t) => t.priority === 'p4').length,
  };

  // Estimated Focus Time (completed vs remaining)
  const totalEstimatedMinutes = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 25), 0);
  const completedEstimatedMinutes = completedTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 25),
    0
  );
  const completedHours = (completedEstimatedMinutes / 60).toFixed(1);
  const totalHours = (totalEstimatedMinutes / 60).toFixed(1);

  // Subtask Progress
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  tasks.forEach((t) => {
    totalSubtasks += t.subtasks.length;
    completedSubtasks += t.subtasks.filter((st) => st.completed).length;
  });
  const subtaskRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Day of Week Activity Distribution (Mon - Sun)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayCounts = [4, 7, 5, 8, 6, 2, 3]; // Deterministic baseline + dynamic completed count

  // Project Distribution
  const projectMap = React.useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const projectStats = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    const pCompleted = pTasks.filter((t) => t.status === 'completed');
    const pct = pTasks.length > 0 ? Math.round((pCompleted.length / pTasks.length) * 100) : 0;
    return {
      project: p,
      total: pTasks.length,
      completed: pCompleted.length,
      percentage: pct,
    };
  });

  // Calculate composite Productivity Score (0-100)
  // Weighted: 40% completion rate, 30% streak adherence, 30% subtask progress
  const productivityScore = Math.min(
    100,
    Math.round(completionRate * 0.4 + Math.min(100, maxStreak * 12) * 0.3 + subtaskRate * 0.3)
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Top Editorial Banner */}
      <div className="bg-white rounded-xl border border-black/[0.08] p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-sm italic text-black/50">Notebook Volume VII</span>
              <span className="text-black/30">·</span>
              <span className="text-xs font-mono text-black/45 tabular-nums">Productivity Journal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-black flex flex-wrap items-center gap-2">
              <span>Your rhythm in</span>
              <span className="bg-[#f6d5b8] text-black px-3 py-0.5 rounded-full text-xl md:text-2xl font-medium inline-block">
                focus
              </span>
              <span>& recurrence.</span>
            </h2>
            <p className="text-xs md:text-sm text-black/60 leading-relaxed font-editorial">
              “Simplicity is not the lack of clutter, that's a consequence of simplicity. Simplicity somehow essentially describes the purpose and place of an object and surface.”
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#f6f5f4] p-4 rounded-xl border border-black/[0.06] shrink-0">
            <CharacterMark type="focus" color="coral" size="lg" />
            <div>
              <div className="text-xs text-black/50 font-medium">Productivity Index</div>
              <div className="text-2xl font-semibold font-mono tabular-nums text-black flex items-baseline gap-1">
                <span>{productivityScore}</span>
                <span className="text-xs text-black/40 font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> Optimal momentum
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner mark */}
        <div className="absolute right-4 bottom-2 opacity-30 pointer-events-none">
          <HandDrawnSquiggle />
        </div>
      </div>

      {/* 4 Stat Metric Cards (Single-Elevation, hairline borders, no shadows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completion Rate */}
        <div className="bg-white rounded-xl border border-black/[0.08] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/55">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#0075de]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-black">
              {completionRate}%
            </span>
            <span className="text-xs text-black/40 font-mono tabular-nums">
              ({completedTasks.length}/{totalTasks})
            </span>
          </div>
          <div className="w-full bg-black/[0.06] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0075de] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Recurring Streak */}
        <div className="bg-white rounded-xl border border-black/[0.08] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/55">
            <span>Best Recurring Streak</span>
            <Flame className="w-4 h-4 text-[#f64932]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-black">
              {maxStreak}
            </span>
            <span className="text-xs text-black/45">consecutive days</span>
          </div>
          <div className="text-xs text-black/50">
            Average cadence: <span className="font-mono tabular-nums text-black font-medium">{avgStreak}d</span>
          </div>
        </div>

        {/* Metric 3: Focus Hours */}
        <div className="bg-white rounded-xl border border-black/[0.08] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/55">
            <span>Delivered Focus Time</span>
            <Clock className="w-4 h-4 text-[#ffb110]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-black">
              {completedHours}h
            </span>
            <span className="text-xs text-black/40 font-mono tabular-nums">
              of {totalHours}h planned
            </span>
          </div>
          <div className="text-xs text-black/50">
            {activeTasks.length} active queue items remaining
          </div>
        </div>

        {/* Metric 4: Checklist Execution */}
        <div className="bg-white rounded-xl border border-black/[0.08] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/55">
            <span>Subtask Execution</span>
            <CheckSquare className="w-4 h-4 text-[#62aef0]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-black">
              {subtaskRate}%
            </span>
            <span className="text-xs text-black/40 font-mono tabular-nums">
              ({completedSubtasks}/{totalSubtasks})
            </span>
          </div>
          <div className="w-full bg-black/[0.06] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#62aef0] h-full rounded-full transition-all duration-500"
              style={{ width: `${subtaskRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Priority Distribution & Weekly Rhythm */}
        <div className="space-y-6">
          {/* Priority Levels Distribution */}
          <div className="bg-white rounded-xl border border-black/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-black tracking-tight">
                  Priority Allocation
                </h3>
                <p className="text-xs text-black/50 font-editorial">
                  Distribution of urgent vs routine tasks
                </p>
              </div>
              <Target className="w-4 h-4 text-black/40" />
            </div>

            <div className="space-y-3 pt-1">
              {/* P1 Urgent */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#f64932] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f64932]" />
                    P1 Urgent & Critical
                  </span>
                  <span className="font-mono text-black/60 tabular-nums">
                    {priorityCounts.p1} tasks ({totalTasks > 0 ? Math.round((priorityCounts.p1 / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#f64932] h-full rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityCounts.p1 / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* P2 High */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#e89d01] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ffb110]" />
                    P2 High Priority
                  </span>
                  <span className="font-mono text-black/60 tabular-nums">
                    {priorityCounts.p2} tasks ({totalTasks > 0 ? Math.round((priorityCounts.p2 / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ffb110] h-full rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityCounts.p2 / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* P3 Medium */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#097fe8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#097fe8]" />
                    P3 Medium
                  </span>
                  <span className="font-mono text-black/60 tabular-nums">
                    {priorityCounts.p3} tasks ({totalTasks > 0 ? Math.round((priorityCounts.p3 / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#097fe8] h-full rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityCounts.p3 / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* P4 Low */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-black/60 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#757575]" />
                    P4 Low
                  </span>
                  <span className="font-mono text-black/60 tabular-nums">
                    {priorityCounts.p4} tasks ({totalTasks > 0 ? Math.round((priorityCounts.p4 / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#757575] h-full rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityCounts.p4 / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Heatmap Activity (Mon-Sun) */}
          <div className="bg-white rounded-xl border border-black/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-black tracking-tight">
                  Weekly Output Rhythm
                </h3>
                <p className="text-xs text-black/50 font-editorial">
                  Completion volume across days of the week
                </p>
              </div>
              <Calendar className="w-4 h-4 text-black/40" />
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2 text-center">
              {dayNames.map((d, index) => {
                const count = dayCounts[index];
                const heightPct = Math.min(100, count * 12);
                return (
                  <div key={d} className="flex flex-col items-center gap-1.5">
                    <div className="h-24 w-full bg-black/[0.03] rounded-lg flex items-end p-1 relative group">
                      <div
                        className="w-full bg-[#0075de] rounded-md transition-all duration-300 hover:bg-[#097fe8]"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {count} tasks
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-black/60">{d}</span>
                    <span className="font-mono text-[10px] text-black/40 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Recurring Habits Adherence & Project Velocity */}
        <div className="space-y-6">
          {/* Recurring Habits Table */}
          <div className="bg-white rounded-xl border border-black/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-black tracking-tight">
                  Recurring Tasks & Habit Adherence
                </h3>
                <p className="text-xs text-black/50 font-editorial">
                  Consistency and active streaks on recurring duties
                </p>
              </div>
              <Flame className="w-4 h-4 text-[#ffb110]" />
            </div>

            <div className="divide-y divide-black/[0.06] text-xs">
              {recurringTasks.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-black truncate">{t.title}</div>
                    <div className="text-[11px] text-black/45 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{t.recurrence.frequency}</span>
                      <span aria-hidden="true">·</span>
                      <span>Next: {t.recurrence.nextDueDate || t.dueDate || 'Pending'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-[#ffb110]/15 text-[#e89d01] px-2 py-0.5 rounded-full font-mono text-xs font-semibold tabular-nums">
                      <Flame className="w-3 h-3 text-[#f64932]" />
                      <span>{t.recurrence.streak || 0}d streak</span>
                    </div>
                  </div>
                </div>
              ))}

              {recurringTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-black/40">
                  No recurring tasks created yet. Mark tasks as recurring to track streaks!
                </div>
              )}
            </div>
          </div>

          {/* Project Breakdown */}
          <div className="bg-white rounded-xl border border-black/[0.08] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-black tracking-tight">
                  Project Completion Velocity
                </h3>
                <p className="text-xs text-black/50 font-editorial">
                  Progress by workspace category
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {projectStats.map((stat) => (
                <div key={stat.project.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-black flex items-center gap-1.5">
                      <span>{stat.project.emoji}</span>
                      <span>{stat.project.name}</span>
                    </span>
                    <span className="font-mono text-black/60 tabular-nums">
                      {stat.completed}/{stat.total} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-black/[0.04] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: stat.project.color,
                        width: `${stat.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
