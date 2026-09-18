export function renderHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';

  header.innerHTML = ` 
        <a href="#" class="header__logo">🎮 MiniGames</a> 
        <nav class="header__nav" id="header__nav"> 
            <a href="#games" class="header__link">Games</a> 
            <a href="#leaderboard" class="header__link">Leaderboard</a> 
            <a href="#about" class="header__link">About</a>
            <button class="header__auth-btn" id="auth-btn">Sign In</button>
        </nav>  

        <button class="header__burger" id="burger-btn" aria-label="Toggle navigation">☰</button>
    `;

  const burgerBtn = header.querySelector<HTMLButtonElement>('#burger-btn');
  const nav = header.querySelector<HTMLElement>('#header__nav');

  burgerBtn?.addEventListener('click', () => {
    nav?.classList.toggle('header__nav--open');
  });

  return header;
}
