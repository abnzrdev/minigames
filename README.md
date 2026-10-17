# MiniGames — RS School Qualifying Stage

A responsive **game-discovery frontend** built as a coursework project for [RS School (The Rolling Scopes School)](https://rs.school/), within its **Qualifying Stage MiniGames assignments**.

**[Project demo](https://abnzrdev.github.io/minigames/)** · **[Application source (`story-4` branch)](https://github.com/abnzrdev/minigames/tree/story-4)** · **[Story 4 review PR](https://github.com/abnzrdev/minigames/pull/46)**

> **Coursework status:** The application was developed across Stories 1–4. The full application code is on the story branches, not the default `main` branch; course review pull requests remain open. The demo and test evidence are documented in the linked PR. This README does not imply an official course grade or certificate.

## What it does

MiniGames presents a catalog-style interface for discovering games, not a repository of independently playable game implementations.

- **Home:** responsive navigation, featured-games carousel, leaderboard, and developer section.
- **Library:** game cards, category filters, sorting, pagination, and game-details views.
- **API integration:** featured games, library listings, leaderboards, details, favorites, and comments with loading, empty, error, and retry states.
- **Authentication:** login/register dialog, Firebase email/password and Google sign-in integration, client-side session expiry, and guarded actions.
- **Interactions:** responsive dialogs, protected favorites and comment actions, feedback, and error handling.

Feature work and review evidence are traceable through the story pull requests below.

## Technology

TypeScript · Vite · Sass/SCSS · Firebase Authentication · REST APIs · Vitest · ESLint · Prettier · GitHub Actions · GitHub Pages.

## Run locally

The latest coursework implementation is on `story-4`, **not** on `main`.

```bash
git clone https://github.com/abnzrdev/minigames.git
cd minigames
git switch story-4
npm ci
npm run dev
```

The application uses Node.js 24 for its documented test workflow. Some authentication and remote API operations require the applicable service configuration and connectivity.

```bash
npm run build
npm run lint
npm test
npm run test:coverage
```

These commands are defined in `story-4/package.json`; the project PRs record prior test and deployment results. This README update does not claim that the tests were rerun.

## Course assignments and review

| Stage | Main focus | Review |
| --- | --- | --- |
| Story 1 | Responsive home layout and authentication dialog UI | [PR #8](https://github.com/abnzrdev/minigames/pull/8) |
| Story 2 | Game library, details dialog, and interactive carousel | [PR #15](https://github.com/abnzrdev/minigames/pull/15) |
| Story 3 | REST API data, navigation, and library interactions | [PR #28](https://github.com/abnzrdev/minigames/pull/28) |
| Story 4 | Authentication, guarded actions, comments, and test coverage | [PR #46](https://github.com/abnzrdev/minigames/pull/46) |

Assignments originate from the [RS School Qualifying Stage MiniGames tasks](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/minigames). RS School is the course organizer; this repository contains my coursework implementation. Any self-assessed scores shown in PRs are **not official grading results**.

**Author:** [Abenezer Alemayehu](https://github.com/abnzrdev).
