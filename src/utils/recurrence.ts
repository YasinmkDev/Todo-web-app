import { RecurrenceRule, Task } from '../types/todo';
import { getTodayDateString, addDays } from './dates';

export function calculateNextDueDate(rule: RecurrenceRule, baseDate?: string): string {
  const reference = baseDate || getTodayDateString();
  const [y, m, d] = reference.split('-').map(Number);
  const current = new Date(y, m - 1, d);

  const interval = Math.max(1, rule.interval || 1);

  switch (rule.frequency) {
    case 'daily': {
      return addDays(reference, interval);
    }
    case 'weekdays': {
      // Find next Monday-Friday
      let nextDate = new Date(current);
      nextDate.setDate(nextDate.getDate() + 1);
      while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      return formatDate(nextDate);
    }
    case 'weekly': {
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        // Find next day in the list
        for (let offset = 1; offset <= 14; offset++) {
          const testDate = new Date(current);
          testDate.setDate(testDate.getDate() + offset);
          if (rule.daysOfWeek.includes(testDate.getDay())) {
            return formatDate(testDate);
          }
        }
      }
      return addDays(reference, 7 * interval);
    }
    case 'monthly': {
      const nextDate = new Date(current);
      nextDate.setMonth(nextDate.getMonth() + interval);
      return formatDate(nextDate);
    }
    case 'yearly': {
      const nextDate = new Date(current);
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      return formatDate(nextDate);
    }
    default:
      return reference;
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatRecurrenceLabel(rule: RecurrenceRule): string {
  if (rule.frequency === 'none') return 'Does not repeat';
  const interval = rule.interval || 1;

  if (rule.frequency === 'daily') {
    return interval === 1 ? 'Every day' : `Every ${interval} days`;
  }
  if (rule.frequency === 'weekdays') {
    return 'Every weekday (Mon–Fri)';
  }
  if (rule.frequency === 'weekly') {
    if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = rule.daysOfWeek.map(d => dayNames[d]).join(', ');
      return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
    }
    return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
  }
  if (rule.frequency === 'monthly') {
    return interval === 1 ? 'Every month' : `Every ${interval} months`;
  }
  if (rule.frequency === 'yearly') {
    return interval === 1 ? 'Every year' : `Every ${interval} years`;
  }
  return 'Repeats';
}

/**
 * Handle completing a recurring task:
 * Returns the completed historical entry and the updated task for next cycle
 */
export function advanceRecurringTask(task: Task): { completedInstance: Task; nextInstance: Task } {
  const now = new Date().toISOString();
  const today = getTodayDateString();

  const newStreak = (task.recurrence.streak || 0) + 1;
  const bestStreak = Math.max(newStreak, task.recurrence.bestStreak || 0);
  const nextDue = calculateNextDueDate(task.recurrence, task.dueDate || today);

  // Completed record for analytics & history
  const completedInstance: Task = {
    ...task,
    id: `${task.id}-completed-${Date.now()}`,
    status: 'completed',
    completedAt: now,
    updatedAt: now,
  };

  // Next occurrence that remains active in the queue
  const nextInstance: Task = {
    ...task,
    status: 'todo',
    dueDate: nextDue,
    completedAt: null,
    updatedAt: now,
    subtasks: task.subtasks.map(st => ({ ...st, completed: false })), // reset subtasks for next round
    recurrence: {
      ...task.recurrence,
      streak: newStreak,
      bestStreak: bestStreak,
      lastCompletedDate: today,
      nextDueDate: calculateNextDueDate(task.recurrence, nextDue),
    },
  };

  return { completedInstance, nextInstance };
}
