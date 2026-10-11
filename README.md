
## Story 4 app session

The app stores one profile JSON object under localStorage key `minigames:minigames-rsschool:app-session`. Fields: displayName, email, authenticatedAt (Date.now() milliseconds), and optional avatarUrl. Lifetime is exactly five minutes from successful authentication. Reloads and navigation do not renew the timestamp. Firebase identity is separate and never restores the app UI on its own; no passwords or Firebase tokens are stored in this record.

Review expiration by changing authenticatedAt to Date.now() - 300000, then reloading, navigating, or trying a protected action. Only this key is removed. Expiration clears UI state and calls Firebase signOut. Blocked actions are never replayed automatically; Game Details is restored when Auth closes.

## Unit tests

Use Node.js 24 and install the locked dependencies with `npm ci`. Run `npm test` for all TypeScript unit tests, or `npm run test:coverage` for the same suite plus terminal, HTML and JSON coverage reports in `coverage/`. Both commands exit nonzero on assertion failures. Vitest discovers `src/**/*.test.ts`; DOM suites opt into jsdom. Firebase and network boundaries are mocked in unit tests.

The Story 4 verification workflow runs lint, formatting, build and both test commands on pull requests and pushes to `story-4`, preserving coverage as a GitHub Actions artifact for 14 days. Batch 2 baseline on 11.10.2026: 133 tests across 16 suites, zero failures and 47.21% statements. Batch 3 coverage verification: 188 tests across 23 suites, zero failures and 93.88% statements (1736/1849). The existing application include/exclusion patterns remain unchanged; an aggregate 80% statement threshold now fails coverage regressions. Google OAuth is implemented in a separate unmerged PR and is not included in these deployed-branch metrics.
