# AGENTS.md

These instructions apply to the whole repository.

## Required AI References

Read the relevant files in `docs/ai/` before making changes:

- `docs/ai/repository-guide.md`: project overview, app structure, file map, and source-of-truth notes.
- `docs/ai/development-workflow.md`: local run, build, test, browser verification, and git hygiene.
- `docs/ai/coding-standards.md`: coding conventions, i18n rules, generated bundle rules, and design guidance.
- `docs/ai/ux-improvement-plan.md`: current UX assessment and prioritized UX roadmap.
- `docs/ai/procedures.md`: repeatable procedures for UX review, implementation, and verification.
- `docs/ai/progress.md`: current progress tracker, decisions, and next actions.

## Critical Rules

- The production app is the static React prototype under `garden-daily-record/`.
- Do not edit `garden-daily-record/garden-app.bundle.js` by hand. Update `.jsx` sources and regenerate it with `node tools/build-garden-bundle.cjs`.
- Do not add `import` or `export`; the app uses ordered browser scripts and `window.*` globals.
- Keep `Garden.dev.html` script order and `tools/build-garden-bundle.cjs` source order aligned when adding or renaming app `.jsx` files.
- UI strings in the main app should go through `GardenI18n` with Japanese and English entries.
- Preserve the `/*EDITMODE-BEGIN*/` / `/*EDITMODE-END*/` blocks and the edit-mode `postMessage` protocol.
- The UI intentionally contains Japanese text and emoji. Avoid broad re-encoding, whole-file formatting, or bulk text replacement unless explicitly requested.
- When changing UI, verify the affected screen in a browser for console errors, layout regressions, responsive behavior, and light/dark readability where relevant.
- Do not remove user changes. Keep edits scoped to the requested files.

## Quick Commands

Run from `garden-daily-record/`:

```powershell
node tools/build-garden-bundle.cjs
node garden-store.test.cjs
```

Run a local static server from the repository root:

```powershell
python -m http.server 8000 --directory garden-daily-record
```

Main app: `http://localhost:8000/Garden.html`
Development app: `http://localhost:8000/Garden.dev.html`
Wireframes: `http://localhost:8000/Wireframes.html`

## Git Notes

In this environment, plain `git status` may fail with a safe.directory warning. For read-only status checks, use:

```powershell
git -c safe.directory=C:/Users/user/projects/garden-daily-record status --short
```
