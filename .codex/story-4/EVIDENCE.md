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
