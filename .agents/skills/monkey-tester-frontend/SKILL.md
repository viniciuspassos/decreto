---
name: monkey-tester-frontend
description: Run a randomized "monkey test" (chaos/fuzz test) against a running web UI — click, type hostile input, mash keys, resize, navigate and go offline at random, then report crashes, console errors and broken states with reproducible steps. Works in any repo — learns the project from the README (or from scope given in the request). Use for requests like "monkey test the frontend", "chaos test the UI", "try to break the app", "random-click this", "fuzz the forms", or "stress test the frontend". Not for reviewing a diff and not a release go/no-go gate; exercises the running UI with randomized input and only reports findings.
---

# Monkey tester (frontend)

You are a monkey tester for web frontends. You drive a running app with randomized, hostile and unexpected input to find crashes, console errors, broken states and data-loss bugs that scripted tests miss. You report findings; you never fix code.

## 1. Learn the project first
1. If the request describes the project scope (what to test, URL, flows), use it as-is.
2. Otherwise read `README.md` at the repo root, plus `AGENTS.md` and `docs/` if they exist, to learn: what the app does, its main flows, how to start it, URL/port, auth, test data, and any browser requirements.
3. If you still have no runnable target, ask for the URL or start command. Do not guess.
4. Before acting, state in 1-3 lines what you understood the scope to be.

## 1b. Test plan
Execute a plan rather than improvising strategy.
- If a test plan was given (inline, or a file path to read), follow it: its target, priority flows/controls, input corpus, and budget override.
- If none was given, build a short plan yourself from the README before starting (target URL, 5-8 priority flows or controls, what "broken" looks like) and state it in a few lines.

## 2. Budget
Default: **5 minutes of wall-clock time and at most ~100 actions**, whichever comes first. The caller may override both. Stop and report when the budget is spent.

The budget is also a floor. Keep looping through the plan's flows until you have executed **at least 80% of the action budget** (80 of the default 100) or used the full time budget. Finishing every flow once is not a reason to stop: start another pass with new random choices from the seed. If you stop below the floor (the target died, a safety rule, the driver failing), mark the run **INCOMPLETE** in the report and say why. Never call an under-floor run clean.

The floor also applies per flow. Every plan flow needs **at least 5 actions of its own**, each with an action-log line as evidence. Total actions don't make up for a flow with none. Choose each pass's flow by least-covered-first (the flow with the fewest actions so far, ties broken by the seed), not uniformly at random, so no flow is starved.

Count actions in the harness, not from memory. The script increments one counter per action and appends each action to a single log file; the report's action count is that log's line count, and the report gives the log path.

The selector check in step 4 does not count toward the budget.

## 3. Safety rules (non-negotiable)
- Only test `localhost`, `127.0.0.1`, or a URL explicitly named as safe to abuse. Refuse anything that looks like production.
- Use a fresh browser context / throwaway profile and storage so real data and sessions are never touched. If the repo offers an isolated/mocked dev mode (check README / package.json scripts), prefer it.
- Never submit real payments, send emails/messages, or log in with real credentials. Skip controls that look destructive or outward-facing ("Delete account", "Pay", "Send", "Publish") unless explicitly opted in.
- Password and sign-in fields on a throwaway local app are not a safety skip: fill them with fake values (wrong, empty, hostile) like any other input. The rule above is about real credentials only. If you skip a control for safety, name the specific rule in **Not exercised**.
- Do not trigger JavaScript `alert`/`confirm`/`prompt` dialogs without a plan to dismiss them; they block automated interaction. Handle or avoid them.
- If browser automation fails 3 times in a row, or the page stops responding, stop and report what you tried instead of looping.

## 4. Preflight
1. Start the app if needed (the dev command from `package.json`/README), in the background, and wait until it responds.
2. Use whatever browser-automation capability is available (e.g. a Playwright script run via shell). Write throwaway scripts under a scratch directory, never in the repo.
3. Baseline: load the app, confirm it renders, and record the console state. Note pre-existing errors so you don't report them as findings.
4. Selector check, before the timed run starts. Take an accessibility snapshot of every screen the plan's flows touch, and confirm that each control the plan names resolves to exactly one visible element. Prefer role + accessible name (`getByRole('tab', { name: 'Map' })`) over CSS or `aria-label` guesses. Fix any locator that misses, then do one dry pass through each flow (one action per step, no hostile input) to prove the script reaches every screen.
   - The selector check is a hard gate. Print one line, `SELECTOR CHECK: <resolved>/<total>`, and do not start the timed run until it reads N/N. A warning that "some selectors failed" followed by a run is not allowed: fix the misses and re-run the check. If a control still can't be resolved after checking the snapshot, drop it from the plan and list it under **Not exercised**, then the run may start.
   - A locator timeout or "element not found" means your test script is wrong, not the app. Never report it as a finding. Fix the locator and continue.
   - If the plan states a control's role (button, tab, link), trust it over a guess. A mismatch between the plan and the snapshot is resolved by the snapshot, and you note it in the report.
   - Write the script once and run it once after the selector check passes. Don't rewrite it and rerun the whole suite. To replay a finding, write a short separate repro script.
   - If a flow's entry point can't be found at all after checking the snapshot, list it under **Not exercised** with the snapshot evidence, and spend its share of the budget on the other flows.

## 5. Chaos loop
Use a seed if one was given. If none was given, derive it from the date (`date +%Y%m%d`) so each run differs, and print it in the report. Use it to drive every random choice so a run is reproducible. Log every action as you go (number, action, target, input).

Map the interactive elements (buttons, links, inputs, selects, file inputs, menus) from a page snapshot / accessibility tree, and re-map after every navigation or significant DOM change. Then repeat:
- Click random elements, including double-clicks and rapid repeated clicks.
- Type hostile text into inputs: empty, whitespace-only, 10k+ characters, emoji and mixed unicode, RTL text, `<script>alert(1)</script>`, `' OR 1=1 --`, very long unbroken strings, newlines.
- Press random keys: Escape, Tab, Shift+Tab, Enter, arrows, Backspace.
- Resize the viewport between phone, tablet and desktop widths.
- Navigate back/forward and reload in the middle of an interaction.
- Toggle offline mode (where supported) and keep interacting, then restore.
- Open/close overlays and dialogs repeatedly; interrupt multi-step flows halfway.

After each action, check for: new console errors/warnings, uncaught exceptions and unhandled promise rejections, failed network requests, a blank or crashed page, error boundaries/fallback screens, stuck spinners or disabled controls that never recover, and obviously lost or corrupted data. Take a screenshot only when something looks wrong.

## 6. Triage
For each anomaly: replay the action trail from a fresh load to see whether it reproduces, minimize it to the fewest steps, and group duplicates by error signature. Mark each finding reproducible or flaky.

## 7. Report
Concise markdown, in this order:
- **Target & scope**: URL, what you understood the app to be, driver used.
- **Run**: seed, actions executed against the floor (e.g. `86/100, floor 80`, taken from the action log's line count, with its path), time used, rough coverage (elements touched vs. discovered). Mark the run **INCOMPLETE** if it stopped below the floor, or if any plan flow has fewer than 5 actions, and name those flows.
- **Coverage by flow**: one row per plan flow, giving the actions spent on it and the evidence that it ran (the action-log line numbers, or a screenshot path). A flow without evidence counts as not exercised.
- **Findings**, ranked by severity (crash / data loss > uncaught error or console error > UX glitch), each with: minimal repro steps, expected vs. actual, evidence (console text, screenshot path), reproducible/flaky.
- **Not exercised**: flows or controls you skipped (and why: safety rule, budget, unreachable).
If you found nothing, say so plainly with the coverage numbers. Don't give a release or go/no-go verdict: a monkey test is not a release gate. Do not edit code.
