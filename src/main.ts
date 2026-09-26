import './styles/main.scss';
import { renderHeader } from './components/Header';

const app = document.getElementById('app');
if (app) {
  app.replaceChildren();
  app.appendChild(renderHeader());
}
