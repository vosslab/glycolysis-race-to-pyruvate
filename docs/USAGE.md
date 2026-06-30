# Usage

Build the static game, preview it locally, and run the check gate. Each task
has a front-door shell script with an `npm run` mirror; either form works.

## Quick start

```bash
npm run setup    # install dependencies once after cloning
npm run serve    # build dist/ and open the game in a browser
```

`npm run serve` runs [run_web_server.sh](../run_web_server.sh): it builds
`dist/`, serves it over HTTP on a random local port, and opens the page when
the shell is interactive.

## Commands

Run the scripts directly or through their npm aliases:

| Task | Script | npm alias |
| --- | --- | --- |
| Install dependencies | `./devel/setup_typescript.sh` | `npm run setup` |
| Build for GitHub Pages | `./build_github_pages.sh` | `npm run build` |
| Serve local preview | `./run_web_server.sh` | `npm run serve` |
| Run check gate | `./check_codebase.sh` | `npm run check` |
| Clean build output | `./devel/dist_clean.sh` | `npm run clean` |
| Format source | n/a | `npm run format:write` |
| Browser smoke test | `node tests/playwright/glycolysis_smoke.spec.mjs` | `npm run test:playwright` |

The check gate runs, in order: TypeScript type-check (`src/` via
`tsconfig.json`), wider type-check (`tests/`, `tools/` via
`tsconfig.lint.json`), ESLint with zero warnings, Prettier check, and the Node
unit tests under `tests/`.

## Playing the game

- The game is two-player local hot-seat in one browser tab.
- Play in a window about 16:9 to 16:10 wide so the hands and shared pathway fit
  on one screen.
- On a turn, the active player takes one action: draw one card, or play one
  legal meld onto the shared pathway. There is no discard.
- The inactive player's hand stays hidden until the turn changes.
- A legal meld must match a glycolysis reaction and extend the end of the shared
  pathway; the first player to empty their hand wins the round.
- Append `?seed=<number>` to the URL for a reproducible deal (handy for sharing
  a game or capturing screenshots).

See [GAME_PLAY.md](GAME_PLAY.md) for the full rules and a sample turn.

## Inputs and outputs

- Inputs: the TypeScript source under [src/](../src) and the static shell
  [src/index.html](../src/index.html) and [src/style.css](../src/style.css).
- Outputs: the `dist/` build (bundled `main.js`, copied `index.html` and
  `style.css`, `.nojekyll`), wiped and rebuilt on every build. `dist/` is git
  ignored.

## Known gaps

- [ ] Confirm whether `npm run serve` honors a `PORT` override in published
  guidance (the script supports `PORT`, default random 8000-8999).
- [ ] Document the GitHub Pages deploy workflow (`deploy-pages.yml` exists at
  the repo root).
