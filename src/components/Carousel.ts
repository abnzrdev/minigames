interface GameCard {
    id: string
    title: string;
    category: string;
    description: string;
    icon: string;
}

const CAROUSEL_GAMES: GameCard[] = [ 
    { 
        id: 'tic-tac-toe', 
        title: 'Tic-Tac-Toe', 
        category: 'Puzzle',
        description: 'Classic 3x3 strategy game. Play solo against the AI or challenge a friend locally!', 
        icon: '❌⭕',
    },

    { 
        id: 'memory-matrix', 
        title: 'Memory Cards',
        category: 'Memory',
        description: 'Test your cognitive recall by matching hidden card pairs in the shortest time.',
        icon: '🃏',
    },

    { 
        id: 'snake', 
        title: 'Snake Retro',
        category: 'Arcade', 
        description: 'Guide the snake, devour apples, and grow without crashing into the borders!',
        icon: '🐍',
    },
];

export function renderCarousel(): HTMLElement {
    const section = document.createElement('section');
  
    section.className = 'carousel';
    section.id = 'carousel';
  
    const cardsHtml = CAROUSEL_GAMES.map(
      (game) => `
        <article>
          <div>
            <div>
              <span aria-hidden="true">${game.icon}</span>
              <span>${game.category}</span>
            </div>
  
            <h3>${game.title}</h3>
            <p>${game.description}</p>
          </div>
  
          <a href="#play-${game.id}">Play Now</a>
        </article>
      `,
    ).join('');
  
    section.innerHTML = `
      <div>
        <h2>Featured Games</h2>
        <div></div>
      </div>
  
      <div>
        ${cardsHtml}
      </div>
    `;
  
    return section;
}