import accentBar from '../assets/games/Yellow Accent Bar.svg';
import arrowPrev from '../assets/games/Frame (1).svg';
import arrowNext from '../assets/games/Frame.svg';
import favoriteIcon from '../assets/games/favorite.svg';
import starIcon from '../assets/games/star.svg';
import { openGameDetailsDialog } from './GameDetails';
import { getNewGamesCarouselSlides } from '../data/carouselFromSeed';

const SLIDES = getNewGamesCarouselSlides();
const AUTOPLAY_MS = 4000;
const SWIPE_PX = 48;
const DESKTOP_QUERY = '(min-width: 1024px)';

function wrapIndex(index: number): number {
  const count = SLIDES.length;
  return ((index % count) + count) % count;
}

function slotFor(index: number, active: number): number {
  let distance = index - active;
  const half = Math.floor(SLIDES.length / 2);
  if (distance > half) {
    distance -= SLIDES.length;
  }
  if (distance < -half) {
    distance += SLIDES.length;
  }
  return distance;
}

export function renderCarousel(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'carousel';
  section.id = 'new-games';
  section.setAttribute('aria-labelledby', 'new-games-heading');

  const cardsHtml = SLIDES.map(
    (slide, index) => `
      <button type="button" class="carousel__card" data-index="${index}">
        <img class="carousel__card-image" src="${slide.image}" alt="" draggable="false" />
        <span class="carousel__card-overlay">
          <span class="carousel__card-title">${slide.title}</span>
          <span class="carousel__card-meta">
            <span class="carousel__card-stat">
              <img src="${starIcon}" width="24" height="24" alt="" />
              ${slide.rating}
            </span>
            <span class="carousel__card-stat">
              <img src="${favoriteIcon}" width="24" height="24" alt="" />
              ${slide.likes}
            </span>
          </span>
        </span>
      </button>
    `
  ).join('');

  section.innerHTML = `
    <div class="layout-container carousel__header-wrap">
      <header class="carousel__header">
        <div class="carousel__title">
          <img src="${accentBar}" width="8" height="32" alt="" class="carousel__accent" />
          <h2 class="carousel__heading" id="new-games-heading">New Games</h2>
        </div>
        <div class="carousel__nav">
          <button type="button" class="carousel__arrow" data-step="-1" aria-label="Previous slide">
            <img src="${arrowPrev}" width="48" height="48" alt="" />
          </button>
          <button type="button" class="carousel__arrow carousel__arrow--next" data-step="1" aria-label="Next slide">
            <img src="${arrowNext}" width="48" height="48" alt="" />
          </button>
        </div>
      </header>
    </div>

    <div class="carousel__viewport">
      <div class="carousel__track" role="list">
        ${cardsHtml}
      </div>
    </div>

    <div class="layout-container">
      <div class="carousel__dots" aria-hidden="true">
        <span class="carousel__dot carousel__dot--active"></span>
        <span class="carousel__dot"></span>
        <span class="carousel__dot"></span>
      </div>
    </div>
  `;

  const viewport = section.querySelector('.carousel__viewport');
  const cards = [...section.querySelectorAll<HTMLButtonElement>('.carousel__card')];
  const dots = [...section.querySelectorAll<HTMLElement>('.carousel__dot')];
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  let active = 0;
  let remaining = AUTOPLAY_MS;
  let startedAt = 0;
  let timer = 0;
  let holding = false;
  let swiped = false;
  let pointerStartX = 0;

  function visibleRadius(): number {
    return desktopQuery.matches ? 2 : 1;
  }

  function paint(): void {
    const radius = visibleRadius();
    cards.forEach((card, index) => {
      const slot = slotFor(index, active);
      const hidden = Math.abs(slot) > radius;
      card.dataset.slot = String(slot);
      card.toggleAttribute('data-hidden', hidden);
      card.tabIndex = hidden ? -1 : 0;
      card.setAttribute('aria-hidden', String(hidden));
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('carousel__dot--active', index === active % dots.length);
    });
  }

  function clearTimer(): void {
    window.clearTimeout(timer);
  }

  function arm(delay: number): void {
    clearTimer();
    remaining = delay;
    startedAt = performance.now();
    timer = window.setTimeout(() => {
      go(1);
    }, delay);
  }

  function pauseTimer(): void {
    remaining = Math.max(0, remaining - (performance.now() - startedAt));
    clearTimer();
  }

  function go(step: number): void {
    active = wrapIndex(active + step);
    paint();
    arm(AUTOPLAY_MS);
  }

  section.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const step = Number(button.dataset.step);
      go(step);
    });
  });

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (swiped || card.hasAttribute('data-hidden')) {
        swiped = false;
        return;
      }
      openGameDetailsDialog();
    });
  });

  if (viewport instanceof HTMLElement) {
    viewport.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }
      holding = true;
      swiped = false;
      pointerStartX = event.clientX;
      pauseTimer();
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointerup', (event) => {
      if (!holding) {
        return;
      }
      holding = false;
      const delta = event.clientX - pointerStartX;
      if (Math.abs(delta) >= SWIPE_PX) {
        swiped = true;
        window.setTimeout(() => {
          swiped = false;
        }, 0);
        go(delta < 0 ? 1 : -1);
        return;
      }
      arm(remaining);
    });

    viewport.addEventListener('pointercancel', () => {
      if (!holding) {
        return;
      }
      holding = false;
      arm(remaining);
    });
  }

  desktopQuery.addEventListener('change', paint);

  const page = document.getElementById('page-content');
  if (page) {
    const observer = new MutationObserver(() => {
      if (!section.isConnected) {
        clearTimer();
        desktopQuery.removeEventListener('change', paint);
        observer.disconnect();
      }
    });
    observer.observe(page, { childList: true });
  }

  paint();
  arm(AUTOPLAY_MS);

  return section;
}
