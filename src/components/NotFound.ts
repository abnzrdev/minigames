import { navigateTo } from '../utils/navigation';

export function renderNotFound(): HTMLElement {
  const main = document.createElement('main');
  main.className = 'not-found layout-container';
  main.setAttribute('aria-labelledby', 'not-found-title');
  main.innerHTML = `
    <h1 id="not-found-title">404 — Page Not Found</h1>
    <p>The requested URL does not exist.</p>
    <button type="button" class="not-found__home">Return to Home Page</button>
  `;
  main.querySelector('button')?.addEventListener('click', () => navigateTo('home'));
  return main;
}
