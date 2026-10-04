export function relativeTime(value: string, now = Date.now()): string {
  const elapsed = Math.max(0, now - new Date(value).getTime());
  if (!Number.isFinite(elapsed) || elapsed < 60_000) {
    return 'just now';
  }
  const minute = 60_000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  if (elapsed >= week * 4 && elapsed < year) {
    const count = Math.min(11, Math.max(1, Math.floor(elapsed / month)));
    return `${count} month${count === 1 ? '' : 's'} ago`;
  }
  const units: Array<[number, string]> = [
    [year, 'year'],
    [week, 'week'],
    [day, 'day'],
    [hour, 'hour'],
  ];
  for (const [duration, label] of units) {
    if (elapsed >= duration) {
      const count = Math.floor(elapsed / duration);
      return `${count} ${label}${count === 1 ? '' : 's'} ago`;
    }
  }
  return `${Math.floor(elapsed / minute)} min ago`;
}
