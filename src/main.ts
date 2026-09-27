import './styles/main.scss';
import { renderFooter } from './components/Footer';
import { applyHeaderPage, renderHeader } from './components/Header';
import { renderLibraryBody } from './components/LibraryBody';
import { renderLibraryPagination } from './components/LibraryPagination';
import { renderLibraryFilterBar } from './components/LibraryFilterBar';
import { renderLibraryHero } from './components/LibraryHero';
import { currentPage, subscribePage, type AppPage } from './utils/navigation';

function renderHomePage(): HTMLElement {
  const main = document.createElement('main');
  main.className = 'home-page';
  main.setAttribute('aria-label', 'Home');
  return main;
}

function renderLibraryPage(): HTMLElement {
  const main = document.createElement('main');
  main.className = 'library-page';
  main.setAttribute('aria-label', 'Library');
  main.appendChild(renderLibraryHero());
  main.appendChild(renderLibraryFilterBar());
  main.appendChild(renderLibraryBody());
  main.appendChild(renderLibraryPagination());
  return main;
}

function pageView(page: AppPage): HTMLElement {
  return page === 'library' ? renderLibraryPage() : renderHomePage();
}

const app = document.getElementById('app');
if (app) {
  const content = document.createElement('div');
  content.id = 'page-content';

  app.replaceChildren();
  app.appendChild(renderHeader());
  app.appendChild(content);
  app.appendChild(renderFooter());

  function show(page: AppPage): void {
    applyHeaderPage(page);
    content.replaceChildren(pageView(page));
  }

  subscribePage(show);
  show(currentPage());
}
