# AGENTS.md

These instructions apply to the whole repository.

## Project Overview

- This is a static React prototype under `garden-daily-record/`. There is no package manager config, but the main app uses a lightweight bundle-generation step.
- `Garden.html` is the production main app. It loads React 18 and ReactDOM production UMD builds from CDNs, then loads the generated `garden-app.bundle.js`.
- `Garden.dev.html` is the development entrypoint. It loads React 18, ReactDOM, and Babel standalone from CDNs, then loads local `.jsx` files with `type="text/babel"`.
- `Wireframes.html` is for design exploration. It uses `design-canvas.jsx`, `wf-primitives.jsx`, `wf-direction-*.jsx`, and `wireframes.css`.
- `README.md` is intentionally minimal right now. Treat the HTML, JSX, and CSS files as the source of truth.

## Local Run And Verification

- There is no package manager config or lint command.
- After changing any app `.jsx` source loaded by `Garden.html`, regenerate the production bundle:

```powershell
node tools/build-garden-bundle.cjs
```

- Run the data/model tests when changing storage, schema, XP, summaries, i18n dictionaries, or entry merge behavior:

```powershell
node garden-store.test.cjs
```

- For manual verification, run a local static server from the repository root:

```powershell
python -m http.server 8000 --directory garden-daily-record
```

- Main app: `http://localhost:8000/Garden.html`
- Development app with Babel: `http://localhost:8000/Garden.dev.html`
- Wireframes: `http://localhost:8000/Wireframes.html`
- Prefer a local HTTP server over opening the HTML with `file://`, because the app loads local scripts and the dev entrypoint loads JSX files through Babel.
- When changing UI, open the affected page in a browser and check for console errors, layout regressions, and both light/dark theme readability where relevant.

## File Map

- `Garden.html`: production app shell, tweak defaults, main design-system CSS, and `garden-app.bundle.js` loading.
- `Garden.dev.html`: Babel-based development shell that loads the individual `.jsx` sources.
- `app.jsx`: app shell, navigation, route switching, theme/language application, storage orchestration, and screen wiring. Exposes no module exports; it mounts React directly.
- `garden-app.bundle.js`: generated production bundle. Do not edit by hand; update `.jsx` sources and rerun `node tools/build-garden-bundle.cjs`.
- `tools/build-garden-bundle.cjs`: downloads Babel standalone and regenerates `garden-app.bundle.js` from the app `.jsx` sources.
- `data.jsx`: mock data, date/summary helpers, storage helpers, and i18n dictionaries. Exposes `window.MOCK`, `window.GardenSchema`, `window.GardenCalc`, `window.GardenStore`, and `window.GardenI18n`.
- `plant.jsx`: SVG plant illustrations. Exposes `window.Plant`.
- `garden-view.jsx`: garden visualization. Exposes `window.Garden`.
- `screen-dashboard.jsx`: dashboard screen.
- `screen-plan.jsx`: dedicated daily plan screen. Exposes `window.PlanScreen`.
- `screen-today.jsx`: daily care/input screen, excluding the dedicated plan plant. Exposes `window.TodayScreen`.
- `screens-other.jsx`: Study, Library, and Settings screens.
- `tweaks-panel.jsx`: edit-mode tweaks panel and reusable form controls.
- `garden.css`: a copy of the Garden design-system CSS. `Garden.html` currently contains inline CSS, so if changing shared tokens or utility classes, check whether both places should stay aligned.
- `wireframes.css` and `wf-*.jsx`: wireframe-only assets. Keep them separate from main app styling decisions unless the task explicitly asks to bring a wireframe direction into the app.

## Coding Conventions

- Do not add `import` or `export`; there is no module bundler. Follow the existing pattern of loading scripts in order and exposing shared pieces on `window.*`.
- Keep `Garden.dev.html` script order and `tools/build-garden-bundle.cjs` source order aligned when adding or renaming app `.jsx` files.
- Keep each file's `/* global ... */` header in sync with the browser globals it references.
- Use function components and hooks, matching the current style. Prefer small local helpers over broad new abstractions.
- If you change the mock data shape in `data.jsx`, audit every screen that reads that data.
- Preserve the `/*EDITMODE-BEGIN*/` / `/*EDITMODE-END*/` block in `Garden.html` and `Garden.dev.html`.
- UI strings should go through `GardenI18n` when they are part of the main app UI. Add both Japanese and English dictionary entries for new user-facing labels.
- Preserve the `postMessage` edit-mode protocol used by `tweaks-panel.jsx`, including message names such as `__activate_edit_mode`, `__deactivate_edit_mode`, `__edit_mode_available`, and `__edit_mode_set_keys`.
- The UI contains Japanese text and emoji. Avoid broad re-encoding, whole-file formatting, or bulk text replacement unless the user explicitly asks for it.

## Design Guidance

- The product metaphor is a life/study log as a growing garden. Respect the moss, earth, terracotta palette; serif display headings; and calm card-based interface.
- Reuse the existing CSS variables and utilities such as `.t-*`, `.card`, `.btn`, `.chip`, `.seg`, `.row`, and `.col`.
- Keep light and dark themes readable. If adding colors, define them through the design tokens where possible.
- For UI changes, check navigation, input states, hover/click targets, responsive wrapping, and text overflow.
- Treat `Wireframes.html` as rough design exploration and `Garden.html` as the polished app prototype.

## Git Notes

- In this environment, plain `git status` may fail with a safe.directory warning. For read-only status checks, use:

```powershell
git -c safe.directory=C:/Users/user/projects/garden-daily-record status --short
```

- Do not remove user changes. This repository may show the prototype directory as untracked, so inspect status carefully and keep edits scoped to the requested files.
