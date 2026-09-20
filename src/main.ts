import './styles/main.scss';
import { renderHeader } from './components/Header';
import { renderHero } from './components/Hero';
import { renderCarousel } from './components/Carousel';
import { renderLeaderboard } from './components/Leaderboard';
import { renderGameDev } from './components/GameDev';
import { renderFooter } from './components/Footer';

const app = document.getElementById('app');
if (app) {
  app.innerHTML = '';
  app.appendChild(renderHeader());
  app.appendChild(renderHero());
  app.appendChild(renderCarousel());
  app.appendChild(renderLeaderboard());
  app.appendChild(renderGameDev());
  app.appendChild(renderFooter());
}
