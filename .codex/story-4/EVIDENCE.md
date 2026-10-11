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

## Final public and integrated verification
- Pages run 38115314350 SUCCESS for ed28a83; public profile/menu at 375/768/1920, loaded/broken image, safe text, generic icon, Guest reset and no overflow passed.
- Public screenshots locally: header-public-375.png, header-public-768.png, header-public-1920.png, header-public-menu-375.png, header-public-menu-768.png, header-public-photo.png, header-public-broken-photo.png.
- Completed local app real Firebase registration/profile header and wrong-password retry verified; screenshots auth-final-*.png. Disposable test account deleted, credentials not retained.
- header-375: https://github.com/user-attachments/assets/bcf68ba8-a1b6-46e3-916a-373ea798ea6a
- header-768: https://github.com/user-attachments/assets/c5ffd1e1-778f-40e0-9696-c20f55935cfe
- header-1920: https://github.com/user-attachments/assets/5b983403-3811-4f03-8c19-f2aa8e208889
- header-menu-375: https://github.com/user-attachments/assets/4a161d8f-31b0-4dfc-8d8e-7e6ed0b17acc
- header-menu-768: https://github.com/user-attachments/assets/2fba0079-2f45-46a6-9027-70d98cd4b95d
- header-photo: https://github.com/user-attachments/assets/32637cf3-6abc-4946-a2a3-cf0037f2d90b
- header-broken-photo: https://github.com/user-attachments/assets/a4e32958-9b11-49ba-863a-5e46b077fb1a
- Public 375px profile: https://github.com/user-attachments/assets/10ecdfba-652e-4085-8bdb-84adf32f81f9
- Public 1920px profile: https://github.com/user-attachments/assets/59f7b4ae-9c36-45bb-a1f0-a4795fc13294
- Real Firebase registration updates completed profile header: https://github.com/user-attachments/assets/59edcae9-0e92-4958-8b1a-d843a15f66bd

## Batch 2 Task 1 — logout
- Actual local screenshots: logout-details.png, logout-mobile.png, logout-guest.png, logout-pending.png, logout-error.png. Profile storage fixture; failure screenshot uses explicitly injected Firebase signOut rejection at the session boundary. Production source is unmodified by the browser harness.
- 87 tests passed, coverage 33.35%; lint/format/build/tests/coverage/diff checks passed.

## Batch 2 Task 2 — Auth URL guard
- Genuine local screenshots: auth-guard-direct.png, auth-guard-history.png, auth-guard-expired.png. Isolated valid/expired profile storage fixtures.
- Browser verified path/query/hash preservation, no extra history entry, one active dialog, valid user guard and expired Guest Back/Forward/Details restoration.
- All required checks passed: 10 suites / 93 tests; statements 34.90%.

## Batch 2 Task 3 — favorites
- Genuine screenshots: favorite-pending.png, favorite-success.png, favorite-rejected.png, favorite-unknown.png, favorite-expired.png.
- Isolated profile identity tested against real backend: favorite POST 200 add and 200 remove, restoring original false state. Error scenarios explicitly intercepted as 400 and aborted response. Read-only recovery never sent another POST; Guest/expired actions sent none.
- Required checks passed: 12 suites / 105 tests; statements 39.59%.
## Batch 2 Task 4 - comment submission
- Actual local screenshots in .codex/story-4/evidence/: comment-invalid.png, comment-pending.png, comment-success.png, comment-error.png, comment-unknown.png, comment-expired.png. Browser storage profile fixture; real backend POST 201 and personalized latest-three GET 200. Explicit 400 and aborted-response fixtures cover failure recovery. No automatic POST retry; Guest/expiration produced no protected request.
- Verified Enter/Shift+Enter, 501-character rejection, disabled pending controls, empty-after-success, server total 3 and three latest rows, safe textContent rendering, draft preservation, Guest hiding. All required checks passed: 124 tests, 45% statements. Story 3 browser regression passed.
## Batch 2 Task 5 - comment likes
- Genuine local screenshots: like-pending.png, like-success.png, like-rejected.png, like-unknown.png, like-expired.png, like-guest.png in .codex/story-4/evidence/. Uploaded with task PR.
- Real backend like/unlike returned 200/200; isolated profile identity was restored to original false/count. Personalized reload returned active state. Explicit browser 403/aborted and late-response fixtures tested recovery without repeated toggle or expired UI resurrection. Guest/expired protected requests: zero.
- All required checks passed: 16 suites / 133 tests; 47.21% statements. Story 3 regression passed, no page errors.
## Batch 2 Task 6 - passing tests
- Actual process-output screenshots: .codex/story-4/evidence/passing-tests.png and passing-tests-coverage.png, with corresponding .txt logs. These display captured command stdout/stderr, timestamps and exit codes; they are not simulated terminal output. Both commands exited 0, all 133 tests / 16 suites passed. Coverage: statements 47.21%, branches 49.94%, functions 43.24%, lines 46.94%.
- All six required verification commands passed. Additional real Firebase regression: signUp/update/signIn 200, wrong-password signIn 400, recovery 200; isolated test account deleted. Original Batch 1 authentication evidence files were refreshed locally but Task 6 evidence is test output. CI verification pending PR creation.
## Final Batch 2 deployment and CI
- PR CI: https://github.com/abnzrdev/minigames/actions/runs/38123193612; final push CI: https://github.com/abnzrdev/minigames/actions/runs/38123297038. Both SUCCESS. Actual filtered CI output screenshot passing-tests-ci.png uploaded to PR #43.
- Pages: https://github.com/abnzrdev/minigames/actions/runs/38123297013 SUCCESS at 0d1090cb440315108c384ec77b0f59495bb19e52. Downloaded artifact in ignored evidence/final-pages-artifact; public /minigames/assets/index-CQE-xXpV.js matches artifact SHA-256 exactly.
- Genuine public screenshots batch2-public-375.png, batch2-public-768.png, batch2-public-1920.png, batch2-public-guest.png, batch2-public-expired.png uploaded to PR #43. Public profile storage fixtures used, no fabricated Firebase pages or credentials.
- Public verified responsive composer max-height/internal scrolling, no horizontal overflow, active-user Auth guard preserving query/hash, logout removes only app key, expired likes send no POST, Guest composer hidden, Details restored after Auth close, Library deep link works, no page errors. Exact uploaded screenshot URLs and per-task histories are in BATCH2_REVIEW.md.
- Batch 2 artifacts and original process logs remain at C:/Users/abnzr/minigames/minigames-batch1/.codex/story-4/evidence/. Uploaded GitHub images and exact per-task full histories are linked in BATCH2_REVIEW.md; local source images are excluded from production and commits.

## Batch 3 initial evidence
- Genuine baseline process output: evidence/batch3-baseline.png and .txt (133 passing tests, 47.21% statements).
- Public client configuration inspection: evidence/google-project-config.json; HTTP 200, authorizedDomains localhost, minigames-rsschool.firebaseapp.com, minigames-rsschool.web.app. abnzrdev.github.io missing. Provider status not inferred from Email/Password.
- OAuth actual screenshots: google-control.png, google-pending-real.png, google-canceled-real.png (real SDK popup and cancellation); google-console-access.png (Console authentication required). google-pending-mocked.png, google-failure-mocked.png, google-success-mocked.png show explicitly mocked boundary behavior, never labeled real Google authorization. Browser JSON and public project/provider probe JSON remain in ignored evidence/. Provider probe: HTTP 400 OPERATION_NOT_ALLOWED, identity provider configuration not found.

## Batch 3 coverage target evidence
- Genuine process output screenshots/logs: coverage-target-baseline.png/.txt (47.21%, 133 tests); coverage-target-tests.png/.txt (188 tests); coverage-target-final.png/.txt (93.88%, 23 suites / 188 tests, all included files shown). Coverage JSON audit in evidence/coverage-exclusion-audit.json.
- Baseline/final statement denominator identical: 1849. Include src/**/*.ts unchanged; only tests/declarations excluded, with existing rationale comments. New aggregate statement threshold 80 enforced. OAuth code remains separately unmerged and is not represented as part of the deployed-branch coverage metric.
- OAuth PR #44 CI SUCCESS: https://github.com/abnzrdev/minigames/actions/runs/38125658088. Actual screenshot links are in PR; production Google success unverified.


## Batch 3 final verification — 11.10.2026
Coverage PR #45 confirmed MERGED into story-4 at 339627026af6fba1f4332fda29a01d1b8880310b. 188 tests / 23 suites pass, 93.88% statements; all mandatory checks pass. Pages run 38126742045 and final CI 38126742059 SUCCESS. Served JS matches deployed artifact byte-for-byte. OAuth PR #44 remains OPEN DRAFT, UNMERGED; normal base sync 18e16c1f6fbc130ac72f9059fc48b4af5f560318 passes 209 tests / 94.22%, CI 38126893973 SUCCESS. Google provider/domain and real authorization remain mandatory external blockers. Final report BATCH-3-REVIEW.md records results and evidence. No final cross-check created; #28 remains open. Final local records intentionally uncommitted; no direct story-4 commit.

OAuth #44 evidence (mocked images explicitly labeled):
- [google-control](https://github.com/user-attachments/assets/372f6abe-3fe3-4c6a-908b-73aa9a47111b)
- [google-pending-real](https://github.com/user-attachments/assets/70d983d1-2059-4466-be67-2acf7019bce1)
- [google-canceled-real](https://github.com/user-attachments/assets/7754ae0c-8b49-4012-9e89-b4e10831689b)
- [google-console-access](https://github.com/user-attachments/assets/93220726-85c1-47f0-9db1-f42f8563d120)
- [google-pending-mocked](https://github.com/user-attachments/assets/81e71a55-cad3-4f63-9382-11d146997a92)
- [google-failure-mocked](https://github.com/user-attachments/assets/bbee9e0a-cb4a-4df6-9ead-b65211270aee)
- [google-success-mocked](https://github.com/user-attachments/assets/f2b81a97-4b7d-48c1-bf9d-f905c5c711eb)
- [google-updated-coverage](https://github.com/user-attachments/assets/020a398b-47eb-402c-b834-6957af16aa01)

Coverage #45 and actual public responsive evidence:
- [coverage-target-baseline](https://github.com/user-attachments/assets/5f215a4b-7423-4823-91a3-fade256809c7)
- [coverage-target-tests](https://github.com/user-attachments/assets/bad8b862-0694-40ed-89a6-31ce0f1042b4)
- [coverage-target-final](https://github.com/user-attachments/assets/41ae23d5-7cca-48b7-b593-2cb9d66e2280)
- [coverage-target-ci](https://github.com/user-attachments/assets/ec46e80c-22b4-48d0-a2db-4e24d4998286)
- [batch3-public-375](https://github.com/user-attachments/assets/e319929f-5827-4abc-866a-7acdf800fd0c)
- [batch3-public-768](https://github.com/user-attachments/assets/ae7b0d8d-0b93-481d-99b2-5bac50d6c589)
- [batch3-public-1920](https://github.com/user-attachments/assets/00af011f-f56f-4966-b938-355c8ec363bb)
- [batch3-public-guest](https://github.com/user-attachments/assets/d2a09527-b5e8-4d3a-9e6c-cb9b60a84db0)
- [batch3-public-expired](https://github.com/user-attachments/assets/40b48a30-2be6-4544-b1eb-58bd0b3eefdb)


## Google configuration follow-up — 11.10.2026
Owner reported configuration completed. Independent client project GET now lists abnzrdev.github.io; Google createAuthUri returns HTTP 200/providerId google.com. Actual Firebase signInWithPopup reaches accounts.google.com/v3/signin/identifier for minigames-rsschool.firebaseapp.com. Provider/domain blockers RESOLVED. Real completed Google authorization remains UNVERIFIED because available automation browser has no authenticated Google account. No credentials requested. Mandatory merge gate remains; PR #44 OPEN DRAFT/unmerged. Fresh lint, format, build, npm test, coverage and diff checks pass: 209 tests / 94.22% statements.


## Owner sign-in confirmation and PR preparation — 11.10.2026
Owner confirms real Google sign-in succeeded and will attach the successful authorization image. Recorded as owner-confirmed, not independently authenticated by agent. PR #44 title/body refreshed with all seven official acceptance criteria, verified existing images, 209 passing tests / 94.22% coverage and truthful undeployed OAuth status. Marked ready for review; remains OPEN/UNMERGED pending owner screenshot/final review. Configuration blockers resolved. No merge performed per latest request.


## Final handoff authorization — 11.10.2026
Owner supplied successful Google sign-in screenshot in PR #44: https://github.com/user-attachments/assets/103d002f-3769-43e1-b995-5624d399e510. Agent inspected authenticated profile/header screenshot; real authorization remains owner-confirmed, not agent-account authentication. Provider/domain independently verified. Screenshot/authorization merge gates resolved. Owner now explicitly authorizes final cleanup and creating story-4 -> story-3 cross-check PR, superseding earlier NOT CREATED instruction. Cross-check must remain open/unmerged; #28 also remains open.
