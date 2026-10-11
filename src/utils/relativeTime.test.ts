import { describe, expect, it } from 'vitest';
import { relativeTime } from './relativeTime';

describe('comment relative time', () => {
  const now = Date.UTC(2026, 9, 11);
  const minute = 60_000;

  it('handles invalid dates, future dates and sub-minute ages', () => {
    expect(relativeTime('invalid', now)).toBe('just now');
    expect(relativeTime(new Date(now + minute).toISOString(), now)).toBe('just now');
    expect(relativeTime(new Date(now - minute + 1).toISOString(), now)).toBe('just now');
  });

  it.each([
    [minute, '1 min ago'],
    [minute * 60, '1 hour ago'],
    [minute * 120, '2 hours ago'],
    [minute * 1440, '1 day ago'],
    [minute * 1440 * 7, '1 week ago'],
    [minute * 1440 * 28, '1 month ago'],
    [minute * 1440 * 60, '2 months ago'],
    [minute * 1440 * 364, '11 months ago'],
    [minute * 1440 * 365, '1 year ago'],
  ])('formats an age of %i ms as %s', (age, label) => {
    expect(relativeTime(new Date(now - age).toISOString(), now)).toBe(label);
  });
});
