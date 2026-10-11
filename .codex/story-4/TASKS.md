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

- RSS-QS-4-1-4: Google OAuth was deferred in Batches 1/2; authorized in Batch 3 below.
- RSS-QS-4-4-4: Coverage target was deferred in Batches 1/2; authorized in Batch 3 below.
- Story 4 final cross-check submission. Never merge story-level cross-check PRs, including #28.

## Already completed before this batch

- RSS-QS-4-1-1: Auth Forms Real-time Validation, PR #29 MERGED (30 points). Not reimplemented.
- RSS-QS-4-1-3: Firebase setup, PR #30 MERGED at 90dbaa5 (50 points). Existing prerequisite reviewed; not counted in new batch total.

# Batch 2 — six authorized tasks

## RSS-QS-4-3-3 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-3-logout-guest-mode-reset.md
- Status: MERGED
- Branch: logout-guest-mode
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: 87 passed, 33.35% statements; screenshots attached in PR; commits 7572326, ca46fff, 6864429, 0f81847; PR https://github.com/abnzrdev/minigames/pull/38; merge 845c4ce2819f1d898f1a0836076092b4259f3c30 (GitHub MERGED)

## RSS-QS-4-3-4 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-3-4-auth-dialog-url-guard.md
- Status: MERGED
- Branch: auth-url-guard
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: 93 passed, 34.90% statements; screenshots attached in PR; commits cd9ab97, 266a808, 10b9201; PR https://github.com/abnzrdev/minigames/pull/39; merge af700b4c26e2e7430ad09f44ca189a4d0bf19b43 (GitHub MERGED)

## RSS-QS-4-2-1 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-1-favorites-api.md
- Status: MERGED
- Branch: favorites-api
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: 105 passed, 39.59% statements; screenshots attached in PR; commits deb4408, f55298b, 99105ae, 012ca17, 3d48b88; PR https://github.com/abnzrdev/minigames/pull/40; merge 846a68f416b0bdda0c2e55096a7a6eb3630eaa60 (GitHub MERGED)

## RSS-QS-4-2-2 (20 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-2-comment-submission-form.md
- Status: MERGED
- Branch: comment-submission
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: 124 passed, 45% statements; screenshots attached; commits 904576a, 2215dec, a501aa0, 59ee926, 43e3277; PR https://github.com/abnzrdev/minigames/pull/41; merge aba9c4d82db0dd5ec90eaabd955e71c6f74b4d8a (GitHub MERGED)

## RSS-QS-4-2-4 (15 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-2-4-like-comment-api.md
- Status: MERGED
- Branch: comment-likes
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: 133 passed, 47.21% statements; screenshots attached; commits f26a430, 28a007e, e974f61; PR https://github.com/abnzrdev/minigames/pull/42; merge c56835c8c3444ce5c40409393654c594ff849354 (GitHub MERGED)

## RSS-QS-4-4-3 (35 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-3-successful-test-execution.md
- Status: MERGED
- Branch: passing-tests
- Dependencies: preceding task PR merged; Batch 1 complete.
- Tests: 133 passed in both commands, 47.21% statements; screenshots attached; commits 5ebce2e, 4766dbe; PR https://github.com/abnzrdev/minigames/pull/43; merge 0d1090cb440315108c384ec77b0f59495bb19e52 (GitHub MERGED); CI 38123193612 and 38123297038 SUCCESS

# Batch 3 - two authorized tasks

## RSS-QS-4-1-4 (40 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-1-4-google-oauth.md
- Status: EXTERNALLY_BLOCKED
- Branch: google-oauth
- Dependencies: verified story-4 at 0d1090c; required Google provider/domain configuration and real sign-in before merge.
- Acceptance: enabled provider; working controls; all-actions/input pending lock; dismissal/navigation lock; shared session/profile/close on success; retry/cancel/error and Snackbar.
- Tests: 154 passed, 48.42% statements; frontend verified, real OAuth unverified; commits 99e9cf8, cb3ba8c, f4aec5d; screenshots captured; provider/domain/Console blocker; PR pending; unmerged

## RSS-QS-4-4-4 (80 points)

- Official specification: https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/minigames/tasks/story-4/RSS-QS-4-4-4-code-coverage-target.md
- Status: NOT_STARTED
- Branch: test-coverage-target
- Dependencies: OAuth PR resolved or explicitly externally blocked; independent tests can proceed from story-4.
- Acceptance: actual aggregate statements >=80%; meaningful observable behavior; mocked external services; no denominator manipulation; threshold enforced after genuine coverage reached.
- Tests: baseline 133 passed, 47.21% statements; final coverage/commits/PR/merge/evidence pending.
