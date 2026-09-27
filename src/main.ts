import './styles/main.scss';
import { renderHeader } from './components/Header';
import { renderLibraryBody } from './components/LibraryBody';
import { renderLibraryFilterBar } from './components/LibraryFilterBar';
import { renderLibraryHero } from './components/LibraryHero';

const app = document.getElementById('app');
if (app) {
  app.replaceChildren();
  app.appendChild(renderHeader());
  app.appendChild(renderLibraryHero());
  app.appendChild(renderLibraryFilterBar());
  app.appendChild(renderLibraryBody());
}
