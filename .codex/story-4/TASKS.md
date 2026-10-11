# Story 4 — Batch 1

Prerequisite: PR #30 MERGED at 90dbaa5. Provider enabled status confirmed by owner; Console provider state not independently inspected. Deadline unverified and nonblocking under user override.

## RSS-QS-4-4-1 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-1-unit-testing-tooling.md
- Status: IN_PROGRESS
- Branch: `test-tooling` (not created)
- Dependencies: Firebase PR #30 merged
- Acceptance criteria: Framework devDependencies; TypeScript discovery; DOM only if needed; meaningful tests.
- Tests: not run; screenshots: none; commits: none; PR: none; merge: none.

## RSS-QS-4-4-2 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-2-test-coverage-scripts.md
- Status: NOT_STARTED
- Branch: `test-coverage-scripts` (not created)
- Dependencies: RSS-QS-4-4-1 PR merged
- Acceptance criteria: Test and coverage scripts; terminal summary; all application logic; commented exclusions.
- Tests: not run; screenshots: none; commits: none; PR: none; merge: none.

## RSS-QS-4-2-3 (3 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-3-comment-avatar-styling.md
- Status: NOT_STARTED
- Branch: `comment-avatar` (not created)
- Dependencies: RSS-QS-4-4-2 PR merged
- Acceptance criteria: Random avatar-random tokens; stable mounted commenter colors; uppercase trimmed initial.
- Tests: not run; screenshots: none; commits: none; PR: none; merge: none.

## RSS-QS-4-3-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-2-session-persistence-expiration.md
- Status: NOT_STARTED
- Branch: `session-persistence` (not created)
- Dependencies: RSS-QS-4-2-3 PR merged
- Acceptance criteria: Five-minute fixed session; namespaced storage; profile validation; restore without renewal; signOut and Guest reset; one expiration Snackbar; navigation/protected-action checks; dialog restoration.
- Tests: not run; screenshots: none; commits: none; PR: none; merge: none.

## RSS-QS-4-1-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-1-2-auth-registration-api.md
- Status: NOT_STARTED
- Branch: `email-password-auth` (not created)
- Dependencies: RSS-QS-4-3-2 PR merged
- Acceptance criteria: Firebase login/register; displayName; duplicate prevention; pending input/action/close locks; recovery; session success; required feedback.
- Tests: not run; screenshots: none; commits: none; PR: none; merge: none.

## RSS-QS-4-3-1 (30 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-1-authenticated-header-profile.md
- Status: NOT_STARTED
- Branch: `authenticated-header` (not created)
- Dependencies: RSS-QS-4-1-2 PR merged
- Acceptance criteria: Header/mobile profile; safe name fallbacks; photo failure fallback; Unicode initials; 375/768/1920 checks.
- Tests: not run; screenshots: none; commits: none; PR: none; merge: none.

## DEFERRED — NOT AUTHORIZED IN THIS BATCH

- RSS-QS-4-1-4: Google OAuth.
- RSS-QS-4-2-1: Favorites.
- RSS-QS-4-2-2: Comment submission.
- RSS-QS-4-2-4: Comment likes.
- RSS-QS-4-3-3: Logout.
- RSS-QS-4-3-4: Auth URL/UI guards.
- RSS-QS-4-4-3: Final successful test execution task.
- RSS-QS-4-4-4: Final coverage target.
- Story 4 final cross-check submission. Never merge story-level cross-check PRs, including #28.

