import type { CategorySlug } from '../api/categories';
import type { GameSort } from '../api/games';
import { closeMobileMenu } from './authDialog';

export type AppPage = 'home' | 'library' | 'not-found';
export type AuthMode = 'login' | 'register';

export interface RouteState {
  page: AppPage;
  path: string;
  category: CategorySlug;
  categorySpecified: boolean;
  sort: GameSort;
  libraryPage: number;
  game: string | null;
  auth: AuthMode | null;
}

const categories: CategorySlug[] = ['all', 'puzzle', 'card', 'match', 'farm', 'strategy', 'arcade'];
const sorts: GameSort[] = ['rating-desc', 'rating-asc', 'name-asc', 'name-desc'];
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const listeners = new Set<(route: RouteState) => void>();

export function currentRoute(): RouteState {
  const url = new URL(window.location.href);
  const path =
    base && url.pathname.startsWith(`${base}/`)
      ? url.pathname.slice(base.length)
      : url.pathname === base
        ? '/'
        : url.pathname;
  const page =
    path === '/' || path === '/home' ? 'home' : path === '/library' ? 'library' : 'not-found';
  const category = url.searchParams.get('category') as CategorySlug;
  const sort = url.searchParams.get('sort') as GameSort;
  const pageValue = url.searchParams.get('page') ?? '1';
  const libraryPage = /^\d+$/.test(pageValue) ? Number(pageValue) : 1;
  const auth = url.searchParams.get('auth');
  const mode = auth === 'login' || auth === 'register' ? auth : null;
  return {
    page,
    path,
    category: page === 'library' && categories.includes(category) ? category : 'all',
    categorySpecified: page === 'library' && categories.includes(category),
    sort: page === 'library' && sorts.includes(sort) ? sort : 'rating-desc',
    libraryPage:
      page === 'library' && Number.isSafeInteger(libraryPage) && libraryPage > 0 ? libraryPage : 1,
    game: mode ? null : url.searchParams.get('game')?.trim() || null,
    auth: mode,
  };
}

function routeUrl(route: RouteState): string {
  const params = new URLSearchParams();
  if (route.page === 'library') {
    if (route.categorySpecified || route.category !== 'all') params.set('category', route.category);
    if (route.sort !== 'rating-desc') params.set('sort', route.sort);
    if (route.libraryPage !== 1) params.set('page', String(route.libraryPage));
  }
  if (route.game) params.set('game', route.game);
  if (route.auth) params.set('auth', route.auth);
  const query = params.toString();
  return `${base}${route.path}${query ? `?${query}` : ''}`;
}

function publish(): void {
  const route = currentRoute();
  listeners.forEach((listener) => listener(route));
}

export function subscribeRoute(listener: (route: RouteState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateRoute(change: Partial<RouteState>, replace = false): void {
  const url = routeUrl({
    ...currentRoute(),
    ...change,
    categorySpecified:
      Object.hasOwn(change, 'category') ||
      change.categorySpecified ||
      currentRoute().categorySpecified,
  });
  if (url === `${location.pathname}${location.search}`) return;
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  publish();
}

export function initNavigation(): void {
  history.replaceState(null, '', routeUrl(currentRoute()));
  window.addEventListener('popstate', () => {
    history.replaceState(null, '', routeUrl(currentRoute()));
    closeMobileMenu();
    publish();
  });
}

export function currentPage(): AppPage {
  return currentRoute().page;
}

export function navigateTo(next: AppPage): void {
  closeMobileMenu();
  updateRoute({ page: next, path: next === 'home' ? '/' : `/${next}`, game: null, auth: null });
}

export function navigateLibrary(
  change: Partial<Pick<RouteState, 'category' | 'sort' | 'libraryPage'>>
): void {
  updateRoute({ ...change, libraryPage: change.libraryPage ?? 1 });
}

export function bindPageLinks(root: ParentNode): void {
  root.querySelectorAll<HTMLAnchorElement>('[data-target]').forEach((link) => {
    const target = link.dataset.target;
    if (target !== 'home' && target !== 'library') return;
    link.href = `${base}${target === 'home' ? '/' : '/library'}`;
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      navigateTo(target);
    });
  });
}
