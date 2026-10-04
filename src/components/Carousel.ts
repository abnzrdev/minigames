import accentBar from '../assets/games/Yellow Accent Bar.svg';
import arrowPrev from '../assets/games/Frame (1).svg';
import arrowNext from '../assets/games/Frame.svg';
import favoriteIcon from '../assets/games/favorite.svg';
import starIcon from '../assets/games/star.svg';
import { cardImageUrl, fetchFeaturedGames, type FeaturedGame } from '../api/games';
import { openGameDetailsDialog } from './GameDetails';
import { showSnackbar } from './Snackbar';

const COPIES = 3;
const AUTOPLAY_MS = 4000;

interface Frame {
  center: number;
  side: number;
  peek: number;
  gap: number;
  desktop: boolean;
  infoMin: number;
  slideMs: number;
  swipe: number;
}

interface CarouselSlide {
  title: string;
  slug: string;
  likes: string;
  rating: string;
  image: string;
}

function frameFor(section: HTMLElement, viewport: HTMLElement): Frame {
  const styles = getComputedStyle(section);

  const read = (name: string): number => Number.parseFloat(styles.getPropertyValue(name));

  const peek = read('--carousel-peek');
  const fit = read('--carousel-fit');

  let center = read('--carousel-center');

  if (fit > 0) {
    center = Math.min(center, viewport.clientWidth - peek * fit - read('--carousel-gutter'));
  }

  return {
    center,
    side: read('--carousel-side'),
    peek,
    gap: read('--carousel-gap'),
    desktop: fit === 0,
    infoMin: read('--carousel-info'),
    slideMs: read('--carousel-ms'),
    swipe: read('--carousel-swipe'),
  };
}

function widthFor(distance: number, frame: Frame): number {
  const steps = Math.abs(distance);

  if (steps === 0) {
    return frame.center;
  }

  if (steps === 1 && frame.desktop) {
    return frame.side;
  }

  return frame.peek;
}

function formatLikesCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }

  const tenths = Math.floor(count / 100) / 10;

  return `${tenths.toFixed(1)}K`;
}

function toCarouselSlide(game: FeaturedGame): CarouselSlide {
  return {
    title: game.name,
    slug: game.slug,
    image: cardImageUrl(game.cardImage),
    rating: game.rating.toFixed(1),
    likes: formatLikesCount(game.likesCount),
  };
}

async function loadFeaturedSlides(): Promise<CarouselSlide[]> {
  const games = await fetchFeaturedGames();

  return games.map(toCarouselSlide);
}

function createCardsHtml(slides: CarouselSlide[]): string {
  return Array.from({ length: COPIES }, (_, copy) =>
    slides
      .map(
        (slide) => `
            <button
              type="button"
              class="carousel__card"
              data-copy="${copy}"
              data-slug="${slide.slug}"
            >
              <img
                class="carousel__card-image"
                src="${slide.image}"
                alt=""
                draggable="false"
              />

              <span class="carousel__card-overlay">
                <span class="carousel__card-title">
                  ${slide.title}
                </span>

                <span class="carousel__card-meta">
                  <span class="carousel__card-stat">
                    <img
                      src="${starIcon}"
                      width="24"
                      height="24"
                      alt=""
                    />
                    ${slide.rating}
                  </span>

                  <span class="carousel__card-stat">
                    <img
                      src="${favoriteIcon}"
                      width="24"
                      height="24"
                      alt=""
                    />
                    ${slide.likes}
                  </span>
                </span>
              </span>
            </button>
          `
      )
      .join('')
  ).join('');
}

function createLoadingHtml(): string {
  return `
    <div
      class="carousel__loading"
      aria-label="Loading featured games"
    >
      <div class="carousel__skeleton"></div>
      <div class="carousel__skeleton"></div>
      <div class="carousel__skeleton"></div>
    </div>
  `;
}

function createEmptyHtml(): string {
  return `
    <div
      class="carousel__state carousel__state--empty"
    >
      <p>
        No featured games are available right now.
      </p>
    </div>
  `;
}

function createErrorHtml(): string {
  return `
    <div
      class="carousel__state carousel__state--error"
    >
      <p>
        Featured games could not be loaded.
      </p>

      <button
        type="button"
        class="carousel__retry"
      >
        Retry
      </button>
    </div>
  `;
}

function createDotsHtml(count: number): string {
  return Array.from(
    { length: count },
    (_, index) =>
      `<span class="carousel__dot${index === 0 ? ' carousel__dot--active' : ''}"></span>`
  ).join('');
}

function initCarouselInteractions(section: HTMLElement, slides: CarouselSlide[]): () => void {
  const viewportNode = section.querySelector('.carousel__viewport');

  const trackNode = section.querySelector('.carousel__track');

  const cards = [...section.querySelectorAll<HTMLButtonElement>('.carousel__card')];

  const dots = [...section.querySelectorAll<HTMLElement>('.carousel__dot')];

  if (!(viewportNode instanceof HTMLElement) || !(trackNode instanceof HTMLElement)) {
    return () => undefined;
  }

  const viewport = viewportNode;
  const track = trackNode;

  const count = slides.length;

  let cursor = count;
  let moving = false;
  let remaining = AUTOPLAY_MS;
  let startedAt = 0;
  let timer = 0;
  let movementTimer = 0;
  let holding = false;
  let swiped = false;
  let pointerStartX = 0;
  let slideMs = 0;
  let swipePx = 0;

  function logicalIndex(): number {
    return ((cursor % count) + count) % count;
  }

  function place(animate: boolean): void {
    const frame = frameFor(section, viewport);

    slideMs = frame.slideMs;
    swipePx = frame.swipe;

    track.classList.toggle('carousel__track--instant', !animate);

    cards.forEach((card) => {
      card.classList.toggle('carousel__card--instant', !animate);
    });

    let offset = 0;
    let activeStart = 0;
    let activeWidth = frame.center;

    cards.forEach((card, index) => {
      const width = widthFor(index - cursor, frame);

      card.style.width = `${width}px`;

      card.style.marginRight = index === cards.length - 1 ? '0' : `${frame.gap}px`;

      card.classList.toggle('carousel__card--info', width >= frame.infoMin);

      card.tabIndex = Math.abs(index - cursor) > 2 ? -1 : 0;

      if (index === cursor) {
        activeStart = offset;
        activeWidth = width;
      }

      offset += width + (index === cards.length - 1 ? 0 : frame.gap);
    });

    const shift = viewport.clientWidth / 2 - (activeStart + activeWidth / 2);

    track.style.transform = `translate3d(${shift}px, 0, 0)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('carousel__dot--active', index === logicalIndex());
    });
  }

  function snapToMiddle(): void {
    if (cursor >= count * 2 || cursor < count) {
      cursor = count + logicalIndex();

      place(false);
    }
  }

  function clearTimer(): void {
    window.clearTimeout(timer);
  }

  function arm(delay: number): void {
    clearTimer();

    remaining = delay;
    startedAt = performance.now();

    timer = window.setTimeout(() => {
      move(1);
    }, delay);
  }

  function pauseTimer(): void {
    remaining = Math.max(0, remaining - (performance.now() - startedAt));

    clearTimer();
  }

  function move(step: number): void {
    if (moving) {
      return;
    }

    moving = true;
    cursor += step;

    place(true);

    movementTimer = window.setTimeout(() => {
      moving = false;
      snapToMiddle();
    }, slideMs);

    arm(AUTOPLAY_MS);
  }

  const stepButtons = [...section.querySelectorAll<HTMLButtonElement>('[data-step]')];

  const stepHandlers = stepButtons.map((button) => {
    const handler = (): void => {
      move(Number(button.dataset.step));
    };

    button.addEventListener('click', handler);

    return {
      button,
      handler,
    };
  });

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (swiped || moving) {
        swiped = false;
        return;
      }

      const slug = card.dataset.slug;

      if (!slug) {
        return;
      }

      openGameDetailsDialog(slug);
    });
  });

  const handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || moving) {
      return;
    }

    holding = true;
    swiped = false;

    pointerStartX = event.clientX;

    pauseTimer();

    viewport.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent): void => {
    if (!holding) {
      return;
    }

    holding = false;

    const delta = event.clientX - pointerStartX;

    if (Math.abs(delta) >= swipePx) {
      swiped = true;

      window.setTimeout(() => {
        swiped = false;
      }, 0);

      move(delta < 0 ? 1 : -1);

      return;
    }

    arm(remaining);
  };

  const handlePointerCancel = (): void => {
    if (!holding) {
      return;
    }

    holding = false;

    arm(remaining);
  };

  const handleResize = (): void => {
    place(false);
  };

  viewport.addEventListener('pointerdown', handlePointerDown);

  viewport.addEventListener('pointerup', handlePointerUp);

  viewport.addEventListener('pointercancel', handlePointerCancel);

  window.addEventListener('resize', handleResize);

  const frameId = requestAnimationFrame(() => {
    if (!section.isConnected) {
      return;
    }

    place(false);
    arm(AUTOPLAY_MS);
  });

  return (): void => {
    clearTimer();

    window.clearTimeout(movementTimer);

    cancelAnimationFrame(frameId);

    window.removeEventListener('resize', handleResize);

    viewport.removeEventListener('pointerdown', handlePointerDown);

    viewport.removeEventListener('pointerup', handlePointerUp);

    viewport.removeEventListener('pointercancel', handlePointerCancel);

    stepHandlers.forEach(({ button, handler }) => {
      button.removeEventListener('click', handler);
    });
  };
}

export function renderCarousel(): HTMLElement {
  const section = document.createElement('section');

  section.className = 'carousel';
  section.id = 'new-games';

  section.setAttribute('aria-labelledby', 'new-games-heading');

  section.innerHTML = `
    <div
      class="layout-container carousel__header-wrap"
    >
      <header class="carousel__header">
        <div class="carousel__title">
          <img
            src="${accentBar}"
            width="8"
            height="32"
            alt=""
            class="carousel__accent"
          />

          <h2
            class="carousel__heading"
            id="new-games-heading"
          >
            New Games
          </h2>
        </div>

        <div class="carousel__nav">
          <button
            type="button"
            class="carousel__arrow"
            data-step="-1"
            aria-label="Previous slide"
          >
            <img
              src="${arrowPrev}"
              width="48"
              height="48"
              alt=""
            />
          </button>

          <button
            type="button"
            class="carousel__arrow carousel__arrow--next"
            data-step="1"
            aria-label="Next slide"
          >
            <img
              src="${arrowNext}"
              width="48"
              height="48"
              alt=""
            />
          </button>
        </div>
      </header>
    </div>

    <div class="carousel__viewport">
      <div
        class="carousel__track"
        role="list"
      >
        ${createLoadingHtml()}
      </div>
    </div>

    <div class="layout-container">
      <div
        class="carousel__dots"
        aria-hidden="true"
      ></div>
    </div>
  `;

  const trackNode = section.querySelector<HTMLElement>('.carousel__track');

  const dotsNode = section.querySelector<HTMLElement>('.carousel__dots');

  if (!trackNode || !dotsNode) {
    return section;
  }

  const track = trackNode;
  const dots = dotsNode;

  let cleanupInteractions: (() => void) | null = null;

  let recoveringFromError = false;

  async function loadCarousel(): Promise<void> {
    cleanupInteractions?.();

    cleanupInteractions = null;

    track.style.transform = '';
    track.innerHTML = createLoadingHtml();

    dots.innerHTML = '';

    try {
      const slides = await loadFeaturedSlides();

      if (!section.isConnected) {
        return;
      }

      if (slides.length === 0) {
        track.innerHTML = createEmptyHtml();

        return;
      }

      track.innerHTML = createCardsHtml(slides);

      dots.innerHTML = createDotsHtml(slides.length);

      cleanupInteractions = initCarouselInteractions(section, slides);

      if (recoveringFromError) {
        showSnackbar('Featured games loaded successfully.', 'success');

        recoveringFromError = false;
      }
    } catch {
      if (!section.isConnected) {
        return;
      }

      recoveringFromError = true;

      track.innerHTML = createErrorHtml();

      dots.innerHTML = '';

      showSnackbar('Could not load featured games.', 'error');

      const retryButton = track.querySelector<HTMLButtonElement>('.carousel__retry');

      retryButton?.addEventListener(
        'click',
        () => {
          void loadCarousel();
        },
        { once: true }
      );
    }
  }

  const page = document.getElementById('page-content');

  if (page) {
    const observer = new MutationObserver(() => {
      if (!section.isConnected) {
        cleanupInteractions?.();

        observer.disconnect();
      }
    });

    observer.observe(page, {
      childList: true,
    });
  }

  void loadCarousel();

  return section;
}
