import { closeMobileMenu } from './authDialog';

export type AppPage = 'home' | 'library';

let page: AppPage = 'library';
const listeners = new Set<(next: AppPage) => void>();

export function currentPage(): AppPage {
  return page;
}

export function subscribePage(listener: (next: AppPage) => void): void {
  listeners.add(listener);
}

export function navigateTo(next: AppPage): void {
  closeMobileMenu();
  if (next === page) {
    return;
  }

  page = next;
  listeners.forEach((listener) => {
    listener(page);
  });
}

export function bindPageLinks(root: ParentNode): void {
  root.querySelectorAll<HTMLAnchorElement>('[data-target]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.dataset.target;
      if (target === 'home' || target === 'library') {
        navigateTo(target);
      }
    });
  });
}
