// Date formatting and helper utilities

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  
  const today = getTodayDateString();
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - nowDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays > 1 && diffDays <= 6) {
    return targetDate.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr < getTodayDateString();
}

export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
