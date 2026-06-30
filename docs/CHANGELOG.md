## 2026-06-29

### Additions and New Features

- Added the first pure TypeScript data and game layer for the two-player local hot-seat glycolysis game.
- Defined the 11 glycolysis molecules, 10 enzymes, and the ATP/ADP/NAD+/NADH cofactors as typed data artifacts.
- Added deterministic deck construction, seeded shuffle, two-player deal helpers, turn state, meld validation, and score handling.
- Implemented legal meld rules for normal reactions, ATP investment, GAPDH redox, ATP payoff, and the aldolase DHAP/TPI branch.
- Kept the new modules DOM-free and isolated under `src/data/**` and `src/game/**` for later UI and test reuse.
- Added [docs/CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md) and [docs/FILE_STRUCTURE.md](FILE_STRUCTURE.md) describing the UI layer, the DOM-free domain layer, and the directory map.
- Added [docs/INSTALL.md](INSTALL.md) and [docs/USAGE.md](USAGE.md) stubs covering setup, the check gate, and the build and serve commands.
- Added [docs/screenshots/main_table.png](screenshots/main_table.png) and [docs/screenshots/pass_device.png](screenshots/pass_device.png) captured from the live build.
- Added [docs/screenshots/meld_building.png](screenshots/meld_building.png), a Playwright-driven gameplay capture showing two hand cards selected and listed in the Selected cards zone.
- Added [docs/GAME_PLAY.md](GAME_PLAY.md), the player-facing rules source of truth, with a sample turn and inline gameplay screenshots.
- Added [docs/active_plans/active/glycolysis_tableau_v1_rules.md](active_plans/active/glycolysis_tableau_v1_rules.md), the locked v1 ruleset that drove the wiring.
- Added a `?seed=<number>` URL parameter to `src/main.ts` for reproducible deals (shareable games, deterministic tests, and documentation captures).
- Added `substrate` and `product` molecule fields to every `ReactionSpec` in `src/data/reactions.ts` so the engine can enforce ordered end-only pathway extension.

### Behavior or Interface Changes

- Wired the browser UI to the real glycolysis rules engine. Decided the v1 model from the Vatikan/Carousel rummy references plus a maintainer spec: a turn is draw-one-card XOR play-one-legal-meld, there is no discard pile, and both players extend one shared ordered pathway adding melds only at the end.
- Locked the win condition to first-to-empty-hand, with a draw-pile-empty stalemate fallback. Earlier candidates (reach pyruvate; score race) were rejected because the rummy references and the shared-pathway theme favor an empty-hand go-out.
- Rebuilt `src/game/state.ts` as the single engine: `createGameState`, `drawCard`, `playMeld` (validateMeld gate plus end-only extension and immediate empty-hand win), and `skipTurn` (two forced passes end in a stalemate).
- Rewrote `src/main.ts` as a thin adapter that deals real `CardInstance`s, maps the domain state to the UI contract, drives the hot-seat pass screen, and starts the next round with alternating dealer.

### Fixes and Maintenance

- Reworked the card face renderer into a playing-card layout with mirrored corner labels, centered glycolysis glyphs, compact pathway cards, and clearer selection/state styling.
- Rewrote [README.md](../README.md) to a short overview plus a documentation map and a managed screenshot block, and embedded the two captured screenshots.
- Re-captured all three screenshots at a 16:9 viewport (1600 by 900) showing real shared-pathway melds from a seeded game, and refreshed the README and GAME_PLAY embeds and alt text to match the new tableau UI.
- Reworked the layout into a two-column play area (hands left, pathway and piles right) with smaller cards so a 16:9 to 16:10 browser window fits the game without scrolling; noted the recommended aspect in README and USAGE.
- Made the pathway zone show the shared chain and its frontier molecule, and made the pass screen hide both hands so the hot-seat handoff never leaks cards.
- Updated `tests/test_state.mjs` and `tests/test_scoring.mjs` to cover the engine's ordered play (first-meld-must-be-glucose, non-extending rejection, empty-hand win, draw-pile-empty rejection, two-pass stalemate) and updated the Playwright smoke for the new controls.
- Applied a six-pass audit-code-reviewer pass: friendly card names in meld-rejection messages, exported one shared `otherPlayer`, removed dead state fields (`seed`, `lastMessage`, `MeldPlay` reaction metadata), removed the dead `describeMeld` export and unreachable standalone triose phosphate isomerase reaction, removed dead CSS for the old discard/chip UI, and corrected stale comments and architecture docs.
- Trimmed [AGENTS.md](../AGENTS.md) to bare pointer paths and added the missing [docs/TYPESCRIPT_STYLE.md](TYPESCRIPT_STYLE.md) and [docs/PYTEST_STYLE.md](PYTEST_STYLE.md) references for this TypeScript repo.
- Cleared the ESLint gate by removing two unnecessary type assertions in `src/main.ts` and `src/ui/events.ts` and an unused `once` import in the Playwright smoke test.
- Ran Prettier across the source and tests so `./check_codebase.sh` passes all five checks (typecheck, typecheck:lint, lint, format:check, test:node).
- Fixed `tsconfig.lint.json` TS18003 error by adding `src/**/*.ts` to its include list; the template-generated config only listed `tests/**/*.ts` and `tools/**/*.ts`, which matched zero files in this repo since those directories use `.mjs` not `.ts`; adding the `src/` glob gives the wider typecheck a real input set while keeping test/tool paths ready for future TypeScript additions.

### Removals and Deprecations

- Removed the discard pile and the Discard control from `src/ui/render.ts`, `src/ui/events.ts`, and `src/ui/contracts.ts`; a turn is now draw-one-card XOR play-one-meld with no discard.
- Removed the standalone triose phosphate isomerase reaction from `src/data/reactions.ts` (unreachable under end-only extension; the DHAP-to-GAP step lives inside the five-card `aldolase_bonus` meld).
