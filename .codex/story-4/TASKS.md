# Story 4 — Batch 1

Prerequisite: PR #30 MERGED at 90dbaa5. Provider enabled status confirmed by owner; Console provider state not independently inspected. Deadline unverified and nonblocking under user override.

## RSS-QS-4-4-1 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-1-unit-testing-tooling.md
- Status: MERGED
- Branch: `test-tooling`
- Dependencies: Firebase PR #30 merged
- Acceptance criteria: Framework devDependencies; TypeScript discovery; DOM only if needed; meaningful tests.
- Tests: 1 suite / 5 tests passed; screenshot: evidence/test-tooling.png; commits: 77e4222, 686612c; PR: https://github.com/abnzrdev/minigames/pull/31; merge: 99331af (GitHub MERGED).

## RSS-QS-4-4-2 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-2-test-coverage-scripts.md
- Status: MERGED
- Branch: `test-coverage-scripts`
- Dependencies: RSS-QS-4-4-1 PR merged
- Acceptance criteria: Test and coverage scripts; terminal summary; all application logic; commented exclusions.
- Tests: 2 suites / 15 passed, statements 4.07%; screenshot: evidence/test-coverage-scripts.png; commits: 74fbd7b, 7920e2d; PR: https://github.com/abnzrdev/minigames/pull/32; merge: fa60e1b (GitHub MERGED).

## RSS-QS-4-2-3 (3 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-3-comment-avatar-styling.md
- Status: MERGED
- Branch: `comment-avatar`
- Dependencies: RSS-QS-4-4-2 PR merged
- Acceptance criteria: Random avatar-random tokens; stable mounted commenter colors; uppercase trimmed initial.
- Tests: 21 tests passed, 4.94% statements; screenshots https://github.com/user-attachments/assets/14cefa24-9f51-4b00-929b-0aee75b1f96d; commits 37ebbfb, ae5639b; PR https://github.com/abnzrdev/minigames/pull/34; merge 12a654e (GitHub MERGED)

## RSS-QS-4-3-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-2-session-persistence-expiration.md
- Status: MERGED
- Branch: `session-persistence`
- Dependencies: RSS-QS-4-2-3 PR merged
- Acceptance criteria: Five-minute fixed session; namespaced storage; profile validation; restore without renewal; signOut and Guest reset; one expiration Snackbar; navigation/protected-action checks; dialog restoration.
- Tests: 49 tests passed, 12.38% statements; evidence https://github.com/user-attachments/assets/5453b1dc-a4b6-4512-9c13-8655ee9d9f8e and https://github.com/user-attachments/assets/6db154f9-f218-439c-b394-406f6c3c8460; commits 0a5decc, 2d3f7df, f93635b, 611db03, aa2b883; PR https://github.com/abnzrdev/minigames/pull/35; merge c7da49f (GitHub MERGED)

## RSS-QS-4-1-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-1-2-auth-registration-api.md
- Status: MERGED
- Branch: `email-password-auth`
- Dependencies: RSS-QS-4-3-2 PR merged
- Acceptance criteria: Firebase login/register; displayName; duplicate prevention; pending input/action/close locks; recovery; session success; required feedback.
- Tests: 65 tests passed, 28.34% statements; evidence screenshots attached to PR; commits f0c569a, b6e2ce5, 8b6cea5, f844cb6, df42572; PR https://github.com/abnzrdev/minigames/pull/36; merge dab8dfe (GitHub MERGED)

## RSS-QS-4-3-1 (30 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-1-authenticated-header-profile.md
- Status: IN_PROGRESS
- Branch: `authenticated-header`
- Dependencies: RSS-QS-4-1-2 PR merged
- Acceptance criteria: Header/mobile profile; safe name fallbacks; photo failure fallback; Unicode initials; 375/768/1920 checks.
- Tests: 84 tests passed, 33.03% statements; screenshots evidence/header-375.png, header-768.png, header-1920.png, header-menu-375.png, header-menu-768.png, header-photo.png, header-broken-photo.png; commits 8d5d4eb, a5228cd, ac156d7; PR pending

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

## Already completed before this batch

- RSS-QS-4-1-1: Auth Forms Real-time Validation, PR #29 MERGED (30 points). Not reimplemented.
- RSS-QS-4-1-3: Firebase setup, PR #30 MERGED at 90dbaa5 (50 points). Existing prerequisite reviewed; not counted in new batch total.
