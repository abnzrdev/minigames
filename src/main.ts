import './styles/main.scss';
import { renderHeader } from './components/Header';
import { renderLibraryHero } from './components/LibraryHero';

const app = document.getElementById('app');
if (app) {
  app.replaceChildren();
  app.appendChild(renderHeader());
  app.appendChild(renderLibraryHero());
}
