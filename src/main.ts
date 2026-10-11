import './styles/main.scss';
import { renderAuthDialog } from './components/AuthDialog';
import { renderCarousel } from './components/Carousel';
import { renderFooter } from './components/Footer';
import { initGameDetails, renderGameDetails } from './components/GameDetails';
import { renderGameDev } from './components/GameDev';
import { applyHeaderPage, renderHeader } from './components/Header';
import { renderHero } from './components/Hero';
import { renderLeaderboard } from './components/Leaderboard';
import { renderLibraryBody } from './components/LibraryBody';
import { renderLibraryPagination } from './components/LibraryPagination';
import { renderLibraryFilterBar } from './components/LibraryFilterBar';
import { renderLibraryHero } from './components/LibraryHero';
import { renderNotFound } from './components/NotFound';
import { initAuthDialog } from './utils/authDialog';
import { currentPage, initNavigation, subscribeRoute, type AppPage } from './utils/navigation';
// Initialize Firebase Authentication when MiniGames starts.
import './config/firebase';

function renderHomePage(): HTMLElement {
  const main = document.createElement('main');
  main.className = 'home-page';
  main.setAttribute('aria-label', 'Home');
  main.appendChild(renderHero());
  main.appendChild(renderCarousel());
  main.appendChild(renderLeaderboard());
  main.appendChild(renderGameDev());
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
  if (page === 'not-found') return renderNotFound();
  return page === 'library' ? renderLibraryPage() : renderHomePage();
}

const app = document.getElementById('app');
if (app) {
  initNavigation();
  const content = document.createElement('div');
  content.id = 'page-content';

  app.replaceChildren();
  app.appendChild(renderHeader());
  app.appendChild(content);
  app.appendChild(renderFooter());
  app.appendChild(renderAuthDialog());
  app.appendChild(renderGameDetails());
  initAuthDialog();
  initGameDetails();

  function show(page: AppPage): void {
    applyHeaderPage(page);
    content.replaceChildren(pageView(page));
  }

  let renderedPage = currentPage();
  subscribeRoute((route) => {
    if (route.page !== renderedPage) {
      renderedPage = route.page;
      show(route.page);
    }
  });
  show(currentPage());
}
