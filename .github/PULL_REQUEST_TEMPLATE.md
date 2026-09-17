# 📝 Pull Request: MiniGames Story 1

## 🚀 Story / Task
- **Task Link:** [MiniGames Story 1](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/story-1.md)
- **Target Branch:** `main`
- **Feature Branch:** `feat/story-1`

---

## 📝 Summary of Changes
- **Environment & Tooling Setup:** Configured Vite bundler with Vanilla TypeScript, ESLint, Prettier, Husky Git hooks, Sass (design tokens & breakpoints), and Single Page Application (SPA) architecture.
- **Adaptive Home Page Layout:** Implemented responsive Home page across Mobile (≤768px), Tablet, and Desktop viewports (Header, Burger menu, Hero section, static Game Carousel, Leaderboard table, Game Dev promo, and Footer).
- **Auth Dialog Modal:** Created accessible Auth Modal dialog with open/close triggers, backdrop overlay, smooth transitions, Login/Registration tab switcher, and semantic form markup.

---

## 🧪 Self-Evaluation Checklist (+294 / +294)

### 1. Repository Setup (25/25 pts)
- [x] GitHub repository set up with `README.md`, `.gitignore`, and required dependencies (+10)
- [x] Scalable, modular folder structure created (`src/assets`, `src/components`, `src/pages`, `src/styles`, `src/utils`) (+10)
- [x] Pull Request template created under `.github/PULL_REQUEST_TEMPLATE.md` (+5)

### 2. Development Environment & Scripts (73/73 pts)
- [x] Bundler configured supporting dev & production build modes (`npm run dev`, `npm run build`) (+10)
- [x] TypeScript configured with strict typing (`tsconfig.json`) (+5)
- [x] ESLint configured (`.eslintrc.json`) (+5)
- [x] Prettier configured (`.prettierrc`, `.prettierignore`) (+5)
- [x] Husky Git hooks initialized for pre-commit linting & formatting checks (+8)
- [x] Sass initialized with design tokens, breakpoints, and shared mixins (+10)
- [x] SPA architecture implemented (+20)
- [x] NPM script for ESLint (`npm run lint`) (+5)
- [x] NPM script for Prettier (`npm run format`) (+5)

### 3. Adaptive Layout: Home Page (130/130 pts)
- [x] Unauthenticated Site Header (+15)
- [x] Mobile Burger Menu (≤768px) (+25)
- [x] Hero Section (+15)
- [x] Static Layout of Carousel/Slider Section (+25)
- [x] Leaderboard Table Section (+15)
- [x] "Are You a Game Developer?" Section (+15)
- [x] Footer (+20)

### 4. Auth Dialog Layout (50/50 pts)
- [x] Auth dialog trigger, fixed position, and backdrop overlay (+10)
- [x] Open/close animations and dismiss handlers (+10)
- [x] Login/Registration tab switcher with block transitions (+10)
- [x] Semantic form markup and input types (+10)
- [x] Responsive visual quality and interactive UI states (+10)

### 5. Global Layout & Quality Checks (16/16 pts)
- [x] Global semantic and layout validation (+12)
- [x] Favicon added (+4)

---

## 🛡️ Code Quality & Penalty Verification
- [x] PR remains **OPEN** (not merged) for cross-check review
- [x] No `console.log` statements present in production code
- [x] No explicit `any` types used in TypeScript
- [x] Zero ESLint and Prettier errors (`npm run lint` & `npm run format:check` pass cleanly)
- [x] All styling relies on design tokens / constants (no magic values)
