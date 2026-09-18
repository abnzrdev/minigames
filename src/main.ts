import './styles/main.scss';
import { renderHeader } from './components/Header';
import { renderHero } from './components/Hero';

const app = document.getElementById('app');
if (app) {
  app.innerHTML = '';
  app.appendChild(renderHeader());
  app.appendChild(renderHero());
}
