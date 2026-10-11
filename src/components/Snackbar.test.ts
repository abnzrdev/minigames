// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
describe('Snackbar feedback lifecycle', () => {
  let show: (typeof import('./Snackbar'))['showSnackbar'];
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.replaceChildren();
    show = (await import('./Snackbar')).showSnackbar;
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.replaceChildren();
  });
  it('renders messages as text and dismisses after exactly 3500 ms', () => {
    show('<img src=x onerror=bad()>', 'error');
    const bar = document.querySelector('.snackbar')!;
    expect(bar.getAttribute('role')).toBe('status');
    expect(bar.textContent).toContain('<img src=x onerror=bad()>');
    expect(bar.querySelector('img')).toBeNull();
    expect(bar.classList.contains('snackbar--error')).toBe(true);
    vi.advanceTimersByTime(3499);
    expect(bar.classList.contains('snackbar--visible')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(bar.classList.contains('snackbar--visible')).toBe(false);
  });
  it('reuses a single notification and restarts its timer on replacement', () => {
    show('First', 'error');
    vi.advanceTimersByTime(3000);
    show('Second', 'success');
    expect(document.querySelectorAll('.snackbar')).toHaveLength(1);
    const bar = document.querySelector('.snackbar')!;
    expect(bar.textContent).toContain('Second');
    expect(bar.classList.contains('snackbar--error')).toBe(false);
    vi.advanceTimersByTime(500);
    expect(bar.classList.contains('snackbar--visible')).toBe(true);
    bar.querySelector<HTMLButtonElement>('button')!.click();
    expect(bar.classList.contains('snackbar--visible')).toBe(false);
  });
  it('hosts feedback in the topmost modal and moves it back when that modal closes', () => {
    const first = document.createElement('dialog'),
      second = document.createElement('dialog');
    first.open = true;
    second.open = true;
    document.body.append(first, second);
    show('Modal feedback', 'success');
    expect(second.querySelector('.snackbar')).not.toBeNull();
    second.open = false;
    second.dispatchEvent(new Event('close'));
    expect(document.body.querySelector(':scope > .snackbar')).not.toBeNull();
    show('Next modal', 'error');
    expect(first.querySelector('.snackbar')).not.toBeNull();
    first.dispatchEvent(new Event('close'));
    expect(document.body.querySelector(':scope > .snackbar')).not.toBeNull();
  });
});
