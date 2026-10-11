import type { CategorySlug } from '../api/categories';
import type { GameSort } from '../api/games';
import { closeMobileMenu, isAuthPending } from './authDialog';
import { appSession } from './session';
import { showSnackbar } from '../components/Snackbar';

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
let lastPublishedUrl = '';

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
    game: url.searchParams.get('game')?.trim() || null,
    auth: mode,
  };
}

function routeUrl(route: RouteState): string {
  const params = new URLSearchParams(location.search);
  for (const key of ['category', 'sort', 'page', 'game', 'auth']) params.delete(key);
  if (route.page === 'library') {
    if (route.categorySpecified || route.category !== 'all') params.set('category', route.category);
    if (route.sort !== 'rating-desc') params.set('sort', route.sort);
    if (route.libraryPage !== 1) params.set('page', String(route.libraryPage));
  }
  if (route.game) params.set('game', route.game);
  if (route.auth) params.set('auth', route.auth);
  const query = params.toString();
  return `${base}${route.path}${query ? `?${query}` : ''}${location.hash}`;
}

/** Clean only auth; preserve unknown query parameters, public state and hash in the same entry. */
export function guardAuthenticatedAuth(): boolean {
  const url = new URL(location.href);
  if (!url.searchParams.has('auth') || !appSession.check()) return false;
  url.searchParams.delete('auth');
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
  lastPublishedUrl = `${location.pathname}${location.search}${location.hash}`;
  showSnackbar('You are already authenticated.', 'success');
  return true;
}

function publish(): void {
  guardAuthenticatedAuth();
  lastPublishedUrl = `${location.pathname}${location.search}${location.hash}`;
  const route = currentRoute();
  listeners.forEach((listener) => listener(route));
}

export function subscribeRoute(listener: (route: RouteState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateRoute(change: Partial<RouteState>, replace = false): void {
  if (isAuthPending()) return;
  const session = appSession.check();
  if (change.auth && session) {
    if (!guardAuthenticatedAuth()) showSnackbar('You are already authenticated.', 'success');
    return;
  }
  const url = routeUrl({
    ...currentRoute(),
    ...change,
    categorySpecified:
      Object.hasOwn(change, 'category') ||
      change.categorySpecified ||
      currentRoute().categorySpecified,
  });
  if (url === `${location.pathname}${location.search}${location.hash}`) return;
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  publish();
}

export function initNavigation(): void {
  if (!guardAuthenticatedAuth()) history.replaceState(null, '', routeUrl(currentRoute()));
  lastPublishedUrl = `${location.pathname}${location.search}${location.hash}`;
  window.addEventListener('popstate', () => {
    // Native Back must also keep pending authentication visible. This lock lasts only for the request.
    if (isAuthPending()) {
      history.replaceState(null, '', lastPublishedUrl);
      return;
    }
    appSession.check();
    if (!guardAuthenticatedAuth()) history.replaceState(null, '', routeUrl(currentRoute()));
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
