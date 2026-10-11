# Evidence

## Firebase PR #30 audit — 11.10.2026

- Existing uploaded screenshot: https://github.com/user-attachments/assets/f33f85c1-2710-467e-880a-58f6f5fd9f4d
- Local inspected copy: evidence/pr-30-firebase-project.png. Shows Firebase project dashboard, not provider settings. This was downloaded existing evidence, not a newly captured screenshot.
- Review checkout: ../minigames-pr30-review, origin/firebase-setup at 70b4ceb6fa0a5d63efb904264c7a86f26157afac.
- `npm ci`: passed; reported four high severity findings. No forced audit fixes used.
- `npm run lint`: passed, including design-token check.
- `npm run build`: passed; TypeScript and Vite, 58 modules.
- `npm run format:check`: initially failed on 47 files from Windows CRLF checkout; passed after LF normalization in isolated review copy. No source formatting commit made.
- `git diff origin/story-4...HEAD --check`: passed.
- Test/coverage scripts: not yet configured, not run.
- CodeRabbit: SUCCESS. No additional CI checks shown in PR rollup.
- Public URL https://abnzrdev.github.io/minigames/ returned HTTP 200. Latest successful Pages action: story-3 at 3b1c4ea851cb5fdcfab97dad7335769b96cbcc71; Story 4 is not deployed.
- Runtime browser and Story 3 interaction regression checks: not performed; prerequisite remains blocked.


## Task 1
- npx vitest run: 1 suite, 5 tests passed. Genuine captured process output: evidence/test-tooling.txt and browser screenshot evidence/test-tooling.png (execution-output view, not simulated terminal).
- npm run lint, npm run format:check, npm run build, git diff --check: passed. Vite development server started successfully.

## Task 2
- evidence/test-coverage-scripts.png and .txt: genuine coverage execution output. Uploaded: https://github.com/user-attachments/assets/72ed9f32-c758-4aed-935a-6601837cdbed.
- lint, format:check, build, test, test:coverage, working-tree and branch diff checks passed. 2 suites / 15 tests; statements 4.07%.
- Task 1 uploaded evidence: https://github.com/user-attachments/assets/0406f921-28ab-43f7-b0b3-6105e4cef19d.

## Task 3
- evidence/comment-avatar.png: actual running app with explicitly labeled browser comment fixtures. Real API returned empty lists for six inspected games; no comments were submitted. Fixture response injected only by local Playwright route interception. Repeated Alice comments share color, initials checked against rendered names.
- evidence/story4-deployment.png: public Library/Auth deep link on deployed Story 4. Pages run 38114331752 served commit 9faa334.
- lint, format, build, test, coverage and diff checks passed: 21 tests, statements 4.94%.

## Task 4
- Local app screenshots: evidence/session-expiration.png (expired-session Auth plus Snackbar), evidence/session-guest-restored.png (same Game Details restored in Guest Mode). An isolated profile fixture was created through the app-session API; no real Firebase login is claimed for Task 4.
- Browser automation modified only the custom session timestamp, verified no reload renewal and preserved details DOM; corrupt JSON safely cleared. Unit tests mock storage and Firebase signOut.
- All required checks passed: 5 suites / 49 tests; statements 12.38%.

## Task 5
- Actual local Firebase screenshots: evidence/auth-pending.png, auth-registration-success.png, auth-error.png, auth-login-success.png. Passwords masked. Isolated test account deleted afterward.
- Real network: accounts:signUp 200, accounts:lookup 200, accounts:update 200, accounts:signInWithPassword 400 (wrong password), accounts:signInWithPassword 200, accounts:lookup 200. Operation/status only; no token or password recorded.
- Browser validated pending Escape lock, username update, failure unlock/retry and successful session creation. Unit tests also cover duplicate submissions, all inputs/actions, close/backdrop/Escape locks, registration profile failure and prior-signOut ordering.
- lint, format:check, build, test, coverage and diff checks passed: 7 suites / 65 tests; statements 28.34%. Story 3 Home/Auth validation/Escape/Library smoke passed without page errors.

## Task 6
- Genuine local screenshots: evidence/header-375.png, header-768.png, header-1920.png; mobile menus header-menu-375.png and header-menu-768.png; header-photo.png and header-broken-photo.png. Isolated localStorage profile fixtures, not claimed as Firebase photos. Loaded photo uses an existing official game image fixture.
- Responsive capture waits for real menu transitions to settle. Name/initial/photo/fallback states and no overflow verified at all required widths.
- All required commands passed: 9 suites / 84 tests; statements 33.03%, branches 34.95%, functions 32.19%, lines 32.60%.
- Story 3 regression screenshot: evidence/story3-library-regression.png. Browser recorded real server query strings for page=2, category=puzzle and sort=name-desc; verified Back/reload, Details error/retry/Escape, carousel navigation and not-found. Error scenario used an explicitly injected HTTP 500 then real API retry.
