# File structure

## Top-level layout

```text
glycolysis-race-to-pyruvate/
+- src/                    Strict TypeScript game source
+- tests/                  Node tests, pytest hygiene, Playwright smoke
+- devel/                  Developer scripts (setup, changelog, version)
+- docs/                   Documentation set
+- tools/                  Tooling scripts (currently no TypeScript inputs)
+- build_github_pages.sh   Canonical production build into dist/
+- run_web_server.sh       Local preview: build then serve dist/
+- check_codebase.sh       Type-check and lint gates
+- source_me.sh            Python bootstrap for repo-local scripts
+- package.json            npm scripts and dev dependencies
+- tsconfig.json           TypeScript config for src/
+- tsconfig.lint.json      TypeScript config for tests/tools
+- eslint.config.js        ESLint flat config
+- REPO_TYPE               Project type marker (typescript)
+- VERSION                 CalVer version, synced with package.json
+- README.md               Project purpose and quick start
+- AGENTS.md               Agent instructions and pointers
`- LICENSE.MIT.md          MIT license text
```

## Key subtrees

### src/

```text
src/
+- main.ts                 UI entry point and live turn logic
+- index.html              Static page shell (copied to dist/)
+- style.css               Game styles (copied to dist/)
+- data/                   DOM-free card vocabulary and deck
|  +- card_types.ts        Card id and definition types
|  +- molecules.ts         11 glycolysis molecules
|  +- enzymes.ts           10 glycolysis enzymes
|  +- cofactors.ts         ATP, ADP, NAD+, NADH
|  +- cards.ts             Counts, deck build, lookup helpers
|  `- reactions.ts         Legal reaction (meld) specs
+- game/                   DOM-free game engine
|  +- state.ts             Game and turn state, transitions
|  +- rules.ts             Meld validation and description
|  `- deck.ts              Two-player seeded dealing
`- ui/                     Live UI layer
   +- contracts.ts         View-model types
   +- render.ts            renderGame DOM builder
   `- events.ts            attachGameEvents click wiring
```

See [docs/CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md) for how these modules
relate. The `data/` and `game/` layers are DOM-free and exercised by tests; the
`main.ts` and `ui/` layers drive the live page.

### tests/

```text
tests/
+- test_rules.mjs              Domain meld-rule tests (Node)
+- test_scoring.mjs           Scoring tests (Node)
+- test_state.mjs             State-transition tests (Node)
+- test_*.py                  Repo-hygiene pytest checks
+- file_utils.py              Shared discovery and report helpers
+- conftest.py                Pytest config and repo-local filters
`- playwright/                Browser smoke test
```

## Generated artifacts

- `dist/`: the GitHub Pages build (bundled `main.js`, copied `index.html` and
  `style.css`, `.nojekyll`). Wiped and rebuilt by
  [build_github_pages.sh](../build_github_pages.sh); git ignored.
- `_site/`, `test-results/`, `playwright-report/`, `coverage/`,
  `*.tsbuildinfo`, `.eslintcache`, `.prettiercache`: tooling output; git
  ignored.
- `node_modules/`: installed dependencies; git ignored.
- `report_*.txt`: pytest hygiene reports written on failures; git ignored.

## Documentation map

- Root: [README.md](../README.md), [AGENTS.md](../AGENTS.md),
  `LICENSE.MIT.md`.
- [docs/](.): architecture and structure
  ([CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md),
  [FILE_STRUCTURE.md](FILE_STRUCTURE.md)), player rules
  ([GAME_PLAY.md](GAME_PLAY.md)), changelog
  ([CHANGELOG.md](CHANGELOG.md)), style guides
  ([REPO_STYLE.md](REPO_STYLE.md), [PYTHON_STYLE.md](PYTHON_STYLE.md),
  [PYTEST_STYLE.md](PYTEST_STYLE.md), [MARKDOWN_STYLE.md](MARKDOWN_STYLE.md),
  [TYPESCRIPT_STYLE.md](TYPESCRIPT_STYLE.md)), test docs
  ([E2E_TESTS.md](E2E_TESTS.md), [PLAYWRIGHT_USAGE.md](PLAYWRIGHT_USAGE.md)),
  and authors ([AUTHORS.md](AUTHORS.md)).
- [devel/DEVEL_README.md](../devel/DEVEL_README.md): developer-script notes.

## Where to add new work

- Game data: extend the matching file under [src/data/](../src/data).
- Game rules or turn logic: [src/game/](../src/game).
- UI rendering or input: [src/ui/](../src/ui) and
  [src/main.ts](../src/main.ts).
- Tests: domain tests as `tests/test_*.mjs`, hygiene tests as
  `tests/test_*.py`, browser flows under `tests/playwright/`.
- Developer scripts: [devel/](../devel).
- Docs: [docs/](.) using SCREAMING_SNAKE_CASE filenames.
