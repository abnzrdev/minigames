// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../utils/appSession';
const state = vi.hoisted(() => ({ listeners: [] as Array<(session: AppSession | null) => void> }));
vi.mock('../utils/session', () => ({
  appSession: {
    subscribe: (listener: (session: AppSession | null) => void) => {
      state.listeners.push(listener);
      listener(null);
      return () => {};
    },
  },
}));
vi.mock('../utils/navigation', () => ({ bindPageLinks: vi.fn(), currentPage: () => 'home' }));
vi.mock('../utils/authDialog', () => ({
  closeMobileMenu: vi.fn(),
  openAuthDialog: vi.fn(),
  toggleMobileMenu: vi.fn(),
}));
import { renderHeaderProfile } from './HeaderProfile';
import { renderHeader } from './Header';

describe('header profile DOM', () => {
  const profile: AppSession = {
    displayName: 'Alice Smith',
    email: 'alice@example.com',
    authenticatedAt: 1,
  };
  beforeEach(() => {
    document.body.replaceChildren();
    state.listeners.length = 0;
  });

  it('renders names safely as text and supplies initials when the photo is missing', () => {
    const root = renderHeaderProfile({ ...profile, displayName: '<img src=x onerror=attack()>' });
    expect(root.querySelector('.header__profile-name')?.textContent).toBe(
      '<img src=x onerror=attack()>'
    );
    expect(root.querySelectorAll('img')).toHaveLength(0);
    expect(
      renderHeaderProfile(profile).querySelector('.header__avatar-fallback')?.textContent
    ).toBe('AS');
  });

  it('hides the fallback after a photo loads and restores it on load failure', () => {
    const root = renderHeaderProfile({ ...profile, avatarUrl: 'https://example.com/avatar.png' });
    const image = root.querySelector<HTMLImageElement>('.header__avatar-photo')!;
    const fallback = root.querySelector<HTMLElement>('.header__avatar-fallback')!;
    expect(image.src).toBe('https://example.com/avatar.png');
    image.dispatchEvent(new Event('load'));
    expect(fallback.hidden).toBe(true);
    image.dispatchEvent(new Event('error'));
    expect(root.querySelector('.header__avatar-photo')).toBeNull();
    expect(fallback.hidden).toBe(false);
    expect(fallback.textContent).toBe('AS');
  });

  it('shows a generic icon when the selected name contains no letters or digits', () => {
    const root = renderHeaderProfile({ ...profile, displayName: '!!!' });
    expect(root.querySelector('.header__avatar-fallback img')).not.toBeNull();
    expect(root.querySelector('.header__profile-name')?.textContent).toBe('!!!');
  });

  it('uses email local part and generic name fallbacks', () => {
    expect(
      renderHeaderProfile({ ...profile, displayName: '' }).querySelector('.header__profile-name')
        ?.textContent
    ).toBe('alice');
    expect(
      renderHeaderProfile({ ...profile, displayName: '', email: '' }).querySelector(
        '.header__profile-name'
      )?.textContent
    ).toBe('Player');
  });

  it('replaces guest controls in desktop and menu, then restores them on session reset', () => {
    const header = renderHeader();
    document.body.append(header);
    state.listeners.forEach((listener) => listener(profile));
    expect(header.querySelectorAll('.header__profile')).toHaveLength(2);
    expect(header.querySelector<HTMLElement>('.header__toolbar')?.hidden).toBe(true);
    expect(header.querySelector<HTMLElement>('.header__auth--menu')?.hidden).toBe(true);
    expect(header.querySelector('.header__profile--menu .header__profile-name')?.textContent).toBe(
      'Alice Smith'
    );
    state.listeners.forEach((listener) => listener({ ...profile, displayName: 'Bob' }));
    expect(header.querySelectorAll('.header__profile')).toHaveLength(2);
    expect(header.querySelector('.header__profile--bar .header__profile-name')?.textContent).toBe(
      'Bob'
    );
    state.listeners.forEach((listener) => listener(null));
    expect(header.querySelectorAll('.header__profile')).toHaveLength(0);
    expect(header.querySelector<HTMLElement>('.header__toolbar')?.hidden).toBe(false);
    expect(header.querySelector<HTMLElement>('.header__auth--menu')?.hidden).toBe(false);
  });
});
