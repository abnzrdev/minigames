# Story 4 — Batch 1 history and Batch 2

Prerequisite: PR #30 MERGED at 90dbaa5. Provider enabled status confirmed by owner; Console provider state not independently inspected. Deadline unverified and nonblocking under user override.

## RSS-QS-4-4-1 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-1-unit-testing-tooling.md
- Status: MERGED
- Branch: `test-tooling`
- Dependencies: Firebase PR #30 merged
- Acceptance criteria: Framework devDependencies; TypeScript discovery; DOM only if needed; meaningful tests.
- Tests: 5 tests passed; statements Not configured; screenshots attached in https://github.com/abnzrdev/minigames/pull/31; commits 77e4222, 686612c; PR https://github.com/abnzrdev/minigames/pull/31; merge 99331af3fcc634420bd8acd982601f7202acff35 (GitHub MERGED into story-4)

## RSS-QS-4-4-2 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-2-test-coverage-scripts.md
- Status: MERGED
- Branch: `test-coverage-scripts`
- Dependencies: RSS-QS-4-4-1 PR merged
- Acceptance criteria: Test and coverage scripts; terminal summary; all application logic; commented exclusions.
- Tests: 15 tests passed; statements 4.07%; screenshots attached in https://github.com/abnzrdev/minigames/pull/32; commits 74fbd7b, 7920e2d; PR https://github.com/abnzrdev/minigames/pull/32; merge fa60e1b75b731665417f38fc22069459a692a657 (GitHub MERGED into story-4)

## RSS-QS-4-2-3 (3 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-3-comment-avatar-styling.md
- Status: MERGED
- Branch: `comment-avatar`
- Dependencies: RSS-QS-4-4-2 PR merged
- Acceptance criteria: Random avatar-random tokens; stable mounted commenter colors; uppercase trimmed initial.
- Tests: 21 tests passed; statements 4.94%; screenshots attached in https://github.com/abnzrdev/minigames/pull/34; commits 37ebbfb, ae5639b; PR https://github.com/abnzrdev/minigames/pull/34; merge 12a654ea7c7542b33030f1a29c052e60647a49d2 (GitHub MERGED into story-4)

## RSS-QS-4-3-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-2-session-persistence-expiration.md
- Status: MERGED
- Branch: `session-persistence`
- Dependencies: RSS-QS-4-2-3 PR merged
- Acceptance criteria: Five-minute fixed session; namespaced storage; profile validation; restore without renewal; signOut and Guest reset; one expiration Snackbar; navigation/protected-action checks; dialog restoration.
- Tests: 49 tests passed; statements 12.38%; screenshots attached in https://github.com/abnzrdev/minigames/pull/35; commits 0a5decc, 2d3f7df, f93635b, 611db03, aa2b883; PR https://github.com/abnzrdev/minigames/pull/35; merge c7da49fe53959ccb3b92f727ee0aab9a20be34b7 (GitHub MERGED into story-4)

## RSS-QS-4-1-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-1-2-auth-registration-api.md
- Status: MERGED
- Branch: `email-password-auth`
- Dependencies: RSS-QS-4-3-2 PR merged
- Acceptance criteria: Firebase login/register; displayName; duplicate prevention; pending input/action/close locks; recovery; session success; required feedback.
- Tests: 65 tests passed; statements 28.34%; screenshots attached in https://github.com/abnzrdev/minigames/pull/36; commits f0c569a, b6e2ce5, 8b6cea5, f844cb6, df42572; PR https://github.com/abnzrdev/minigames/pull/36; merge dab8dfe28fcdef172813aedc819cabc6511d753f (GitHub MERGED into story-4)

## RSS-QS-4-3-1 (30 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-1-authenticated-header-profile.md
- Status: MERGED
- Branch: `authenticated-header`
- Dependencies: RSS-QS-4-1-2 PR merged
- Acceptance criteria: Header/mobile profile; safe name fallbacks; photo failure fallback; Unicode initials; 375/768/1920 checks.
- Tests: 84 tests passed; statements 33.03%; screenshots attached in https://github.com/abnzrdev/minigames/pull/37; commits 8d5d4eb, a5228cd, ac156d7, 5310031; PR https://github.com/abnzrdev/minigames/pull/37; merge ed28a8306b920b49363395c79430821bf593acb6 (GitHub MERGED into story-4)

## DEFERRED — NOT AUTHORIZED IN THIS BATCH

- RSS-QS-4-1-4: Google OAuth.
- RSS-QS-4-4-4: Final coverage target.
- Story 4 final cross-check submission. Never merge story-level cross-check PRs, including #28.

## Already completed before this batch

- RSS-QS-4-1-1: Auth Forms Real-time Validation, PR #29 MERGED (30 points). Not reimplemented.
- RSS-QS-4-1-3: Firebase setup, PR #30 MERGED at 90dbaa5 (50 points). Existing prerequisite reviewed; not counted in new batch total.

# Batch 2 — six authorized tasks

## RSS-QS-4-3-3 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-3-logout-guest-mode-reset.md
- Status: IN_PROGRESS
- Branch: logout-guest-mode
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: pending; screenshots: pending; commits: pending; PR: pending; merge: pending.

## RSS-QS-4-3-4 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-4-auth-dialog-url-guard.md
- Status: NOT_STARTED
- Branch: auth-url-guard
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: pending; screenshots: pending; commits: pending; PR: pending; merge: pending.

## RSS-QS-4-2-1 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-1-favorites-api.md
- Status: NOT_STARTED
- Branch: favorites-api
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: pending; screenshots: pending; commits: pending; PR: pending; merge: pending.

## RSS-QS-4-2-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-2-comment-submission-form.md
- Status: NOT_STARTED
- Branch: comment-submission
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: pending; screenshots: pending; commits: pending; PR: pending; merge: pending.

## RSS-QS-4-2-4 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-4-like-comment-api.md
- Status: NOT_STARTED
- Branch: comment-likes
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: pending; screenshots: pending; commits: pending; PR: pending; merge: pending.

## RSS-QS-4-4-3 (35 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-3-successful-test-execution.md
- Status: NOT_STARTED
- Branch: passing-tests
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: pending; screenshots: pending; commits: pending; PR: pending; merge: pending.
