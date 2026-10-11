// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeaturedGame } from '../api/games';
const mocks = vi.hoisted(() => ({ featured: vi.fn(), details: vi.fn(), snackbar: vi.fn() }));
vi.mock('../api/games', async (original) => ({
  ...(await original<typeof import('../api/games')>()),
  fetchFeaturedGames: mocks.featured,
}));
vi.mock('./GameDetails', () => ({ openGameDetailsDialog: mocks.details }));
vi.mock('./Snackbar', () => ({ showSnackbar: mocks.snackbar }));
import { renderCarousel } from './Carousel';
const slides: FeaturedGame[] = [
  { slug: 'alpha', name: 'Alpha', cardImage: 'a.webp', rating: 4.5, likesCount: 2000 },
  { slug: 'beta', name: 'Beta', cardImage: 'b.webp', rating: 3.2, likesCount: 8 },
  { slug: 'gamma', name: 'Gamma', cardImage: 'c.webp', rating: 5, likesCount: 1200 },
];
describe('native featured carousel', () => {
  let root: HTMLElement, section: HTMLElement;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    document.body.innerHTML = '<main id="page-content"></main>';
    root = document.getElementById('page-content')!;
    mocks.featured.mockResolvedValue(slides);
  });
  afterEach(async () => {
    root.replaceChildren();
    await Promise.resolve();
    vi.clearAllTimers();
    vi.useRealTimers();
  });
  function mount(): void {
    section = renderCarousel();
    // jsdom has no SCSS layout engine; these controlled dimensions emulate the token-driven frame.
    for (const [name, value] of Object.entries({
      center: 400,
      side: 300,
      peek: 100,
      gap: 16,
      fit: 0,
      gutter: 24,
      info: 200,
      ms: 200,
      swipe: 50,
    }))
      section.style.setProperty('--carousel-' + name, String(value));
    Object.defineProperty(section.querySelector('.carousel__viewport'), 'clientWidth', {
      value: 1000,
      configurable: true,
    });
    root.append(section);
  }
  async function loaded(): Promise<void> {
    await vi.waitFor(() => expect(section.querySelectorAll('.carousel__card')).toHaveLength(9));
    await vi.advanceTimersByTimeAsync(20);
  }
  function active(): number {
    return [...section.querySelectorAll('.carousel__dot')].findIndex((e) =>
      e.classList.contains('carousel__dot--active')
    );
  }
  function arrow(step: number): void {
    section.querySelector<HTMLButtonElement>(`[data-step="${step}"]`)!.click();
  }
  function pointer(target: EventTarget, type: string, x: number, button = 0): void {
    target.dispatchEvent(new MouseEvent(type, { button, clientX: x, bubbles: true }));
  }
  it('renders API slides and accessible visible cards, opens the chosen Details', async () => {
    mount();
    expect(section.querySelector('[aria-label="Loading featured games"]')).not.toBeNull();
    await loaded();
    expect(section.textContent).toContain('2.0K');
    expect(section.textContent).toContain('4.5');
    expect(section.querySelector('.carousel__track')?.getAttribute('style')).toContain(
      'translate3d'
    );
    const cards = section.querySelectorAll<HTMLButtonElement>('.carousel__card');
    expect(cards[3].style.width).toBe('400px');
    expect(cards[2].style.width).toBe('300px');
    expect(cards[0].tabIndex).toBe(-1);
    cards[3].click();
    expect(mocks.details).toHaveBeenCalledWith('alpha');
  });
  it('prevents overlapping movement, loops both directions and keeps logical dots correct', async () => {
    mount();
    await loaded();
    arrow(1);
    arrow(1);
    expect(active()).toBe(1);
    await vi.advanceTimersByTimeAsync(200);
    arrow(1);
    await vi.advanceTimersByTimeAsync(200);
    arrow(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(active()).toBe(0);
    arrow(-1);
    await vi.advanceTimersByTimeAsync(200);
    expect(active()).toBe(2);
    expect(section.querySelectorAll('.carousel__card[tabindex="0"]').length).toBeGreaterThan(0);
  });
  it('autoplays after four seconds and clears timers/listeners on unmount', async () => {
    mount();
    await loaded();
    await vi.advanceTimersByTimeAsync(4000);
    expect(active()).toBe(1);
    root.replaceChildren();
    await Promise.resolve();
    const transform = section.querySelector<HTMLElement>('.carousel__track')!.style.transform;
    await vi.advanceTimersByTimeAsync(12000);
    expect(section.querySelector<HTMLElement>('.carousel__track')!.style.transform).toBe(transform);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('swipes once, suppresses the accompanying click and resumes after short gestures/cancellation', async () => {
    mount();
    await loaded();
    const viewport = section.querySelector('.carousel__viewport')!,
      card = section.querySelector<HTMLButtonElement>('.carousel__card[data-copy="1"]')!;
    pointer(viewport, 'pointerdown', 200);
    pointer(window, 'pointerup', 100);
    card.click();
    expect(active()).toBe(1);
    expect(mocks.details).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    pointer(viewport, 'pointerdown', 100);
    pointer(window, 'pointerup', 200);
    await vi.advanceTimersByTimeAsync(200);
    expect(active()).toBe(0);
    pointer(viewport, 'pointerdown', 100);
    pointer(window, 'pointerup', 110);
    expect(active()).toBe(0);
    pointer(viewport, 'pointerdown', 100);
    window.dispatchEvent(new Event('pointercancel'));
    await vi.advanceTimersByTimeAsync(4000);
    expect(active()).toBe(1);
  });
  it('ignores non-primary gestures and recalculates widths when the mobile frame changes', async () => {
    mount();
    await loaded();
    const viewport = section.querySelector('.carousel__viewport')!;
    pointer(viewport, 'pointerdown', 200, 2);
    pointer(window, 'pointerup', 100);
    expect(active()).toBe(0);
    section.style.setProperty('--carousel-fit', '2');
    Object.defineProperty(viewport, 'clientWidth', { value: 500 });
    window.dispatchEvent(new Event('resize'));
    expect(section.querySelectorAll<HTMLButtonElement>('.carousel__card')[3].style.width).toBe(
      '276px'
    );
    expect(section.querySelectorAll<HTMLButtonElement>('.carousel__card')[2].style.width).toBe(
      '100px'
    );
  });
  it('shows error feedback, retries read-only and handles an empty response', async () => {
    mocks.featured.mockRejectedValueOnce(Error('offline'));
    mount();
    await vi.waitFor(() => expect(section.querySelector('.carousel__retry')).not.toBeNull());
    expect(section.textContent).toContain('could not be loaded');
    section.querySelector<HTMLButtonElement>('.carousel__retry')!.click();
    await loaded();
    expect(mocks.snackbar).toHaveBeenCalledWith('Featured games loaded successfully.', 'success');
    root.replaceChildren();
    await Promise.resolve();
    mocks.featured.mockResolvedValue([]);
    mount();
    await vi.waitFor(() => expect(section.textContent).toContain('No featured games'));
    expect(section.querySelectorAll('.carousel__dot')).toHaveLength(0);
  });
  it('does not render a response after removal', async () => {
    let resolve: (games: FeaturedGame[]) => void = () => {};
    mocks.featured.mockReturnValue(
      new Promise<FeaturedGame[]>((r) => {
        resolve = r;
      })
    );
    mount();
    root.replaceChildren();
    resolve(slides);
    await Promise.resolve();
    await Promise.resolve();
    expect(section.querySelector('.carousel__card')).toBeNull();
  });
});
