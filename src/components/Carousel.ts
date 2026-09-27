import accentBar from '../assets/games/Yellow Accent Bar.svg';
import arrowPrev from '../assets/games/Frame (1).svg';
import arrowNext from '../assets/games/Frame.svg';
import favoriteIcon from '../assets/games/favorite.svg';
import starIcon from '../assets/games/star.svg';
import { getNewGamesCarouselSlides } from '../data/carouselFromSeed';
import type { NewGamesCarouselSlide } from '../data/newGamesCarousel';

const SLIDES: NewGamesCarouselSlide[] = getNewGamesCarouselSlides();

function cardClass(variant: NewGamesCarouselSlide['variant']): string {
  if (variant === 'featured') {
    return ' carousel__card--featured';
  }
  if (variant === 'peek') {
    return ' carousel__card--peek';
  }
  return ' carousel__card--standard';
}

export function renderCarousel(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'carousel';
  section.id = 'new-games';
  section.setAttribute('aria-labelledby', 'new-games-heading');

  const cardsHtml = SLIDES.map(
    (slide) => `
      <article class="carousel__card${cardClass(slide.variant)}" role="listitem">
        <img class="carousel__card-image" src="${slide.image}" alt="${slide.title}" />
        <div class="carousel__card-overlay">
          <h3 class="carousel__card-title">${slide.title}</h3>
          <div class="carousel__card-meta">
            <span class="carousel__card-stat">
              <img src="${starIcon}" width="24" height="24" alt="" />
              ${slide.rating}
            </span>
            <span class="carousel__card-stat">
              <img src="${favoriteIcon}" width="24" height="24" alt="" />
              ${slide.likes}
            </span>
          </div>
        </div>
      </article>
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
          <button type="button" class="carousel__arrow" aria-label="Previous slide" tabindex="-1">
            <img src="${arrowPrev}" width="48" height="48" alt="" />
          </button>
          <button type="button" class="carousel__arrow carousel__arrow--next" aria-label="Next slide" tabindex="-1">
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

  return section;
}
