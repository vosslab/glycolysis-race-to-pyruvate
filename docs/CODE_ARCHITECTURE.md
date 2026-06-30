# Code architecture

## Overview

Glycolysis Race to Pyruvate is a two-player local hot-seat card game that runs
entirely in the browser. The source is strict TypeScript under
[src/](../src), bundled to a single ESM file with esbuild and served as a static
GitHub Pages artifact from `dist/`. There is no backend, account system, or
network dependency.

The code splits into two layers that are wired together:

- A DOM-free domain layer ([src/data/](../src/data),
  [src/game/](../src/game)) that defines the glycolysis card model and the
  rules engine (deal, legal-meld validation, turn and win logic).
- A UI layer ([src/main.ts](../src/main.ts), [src/ui/](../src/ui)) that drives
  the domain engine and renders the page.

[src/main.ts](../src/main.ts) is a thin adapter: it owns one domain `GameState`,
calls the engine actions, maps the result to the UI view contract, and manages
the hot-seat pass screen. The engine in [src/game/state.ts](../src/game/state.ts)
is the single source of truth for game rules; the UI never mutates game state
directly.

## Major components

### Domain layer (DOM-free engine)

- [src/data/card_types.ts](../src/data/card_types.ts): the typed card vocabulary
  (`MoleculeId`, `EnzymeId`, `CofactorId`, `CardDefinition`, `CardInstance`).
- [src/data/molecules.ts](../src/data/molecules.ts),
  [src/data/enzymes.ts](../src/data/enzymes.ts),
  [src/data/cofactors.ts](../src/data/cofactors.ts): the 11 molecules, 10
  enzymes, and ATP/ADP/NAD+/NADH cofactor definitions.
- [src/data/cards.ts](../src/data/cards.ts): card multiplicities (`CARD_COUNTS`),
  deck construction (`createOrderedDeck`, `shuffleDeck`, `buildShuffledDeck`),
  and lookup helpers (`cardLabel`, `findCardById`).
- [src/data/reactions.ts](../src/data/reactions.ts): `REACTION_SPECS`, each with
  its `cardTemplateIds` plus the `substrate` and `product` molecules used to
  enforce ordered pathway extension.
- [src/game/deck.ts](../src/game/deck.ts): two-player dealing
  (`dealTwoPlayers`, `createSeededDeal`, `DEFAULT_HAND_SIZE`).
- [src/game/rules.ts](../src/game/rules.ts): `validateMeld`, which matches
  selected cards against `REACTION_SPECS` and reports the closest legal meld
  with friendly card names on a mismatch.
- [src/game/state.ts](../src/game/state.ts): the engine. `GameState` plus the
  actions `createGameState`, `drawCard`, `playMeld`, and `skipTurn`, each
  returning a `GameActionResult` success or failure union. Holds the shared
  `pathway`, the `frontier` molecule, `status` (`playing`/`won`/`stalemate`),
  and the winner.

### UI layer (adapter and renderer)

- [src/main.ts](../src/main.ts): entry point and adapter. Holds one engine
  `GameState`, deals real `CardInstance`s, maps the domain state to the UI
  contract, dispatches the action handlers (`onDraw`, `onPlayMeld`, `onSkip`,
  `onToggleCard`, `onAdvance`), manages the pass screen and next round, and
  reads an optional `?seed=` URL parameter for a reproducible deal.
- [src/ui/contracts.ts](../src/ui/contracts.ts): view-model types shared by the
  renderer (`CardView`, `MeldView`, `PlayerView`, `GameState`, `GameActions`,
  `GamePhase`, `FeedbackTone`).
- [src/ui/render.ts](../src/ui/render.ts): `renderGame(root, state)` builds the
  card-table DOM (playing-card faces, hands, the shared pathway with its
  frontier, the draw pile, and the feedback banner) in a two-column layout.
- [src/ui/events.ts](../src/ui/events.ts): `attachGameEvents(root, actions)`
  binds click handlers to the action callbacks.
- [src/index.html](../src/index.html), [src/style.css](../src/style.css):
  static shell and styles copied into `dist/` at build time.

## Data flow

### A turn

1. `main()` finds the `#app` root, creates the engine state (honoring `?seed=`),
   and renders.
2. A player click fires a handler in `attachGameEvents`, which calls an action
   in `main.ts` (for example `onPlayMeld`).
3. The handler calls the engine (`playMeld`, `drawCard`, or `skipTurn`). The
   engine validates against the rules and returns a new `GameState` or a
   failure with a message.
4. On success the adapter swaps in the new engine state, clears the selection,
   and shows the pass screen; on a win or stalemate it shows the round-over
   view. On failure it shows the rejection feedback and leaves the turn open.
5. `renderGame(root, toContractState())` repaints the table from the mapped
   view state.

### Engine rules

1. `buildShuffledDeck(seed)` produces a deterministic deck from `CARD_COUNTS`;
   `createSeededDeal` deals two hands and a draw pile.
2. `playMeld` checks the selection with `validateMeld`, then enforces end-only
   extension: the first meld must start with Glucose, and each later meld's
   substrate must equal the current frontier molecule.
3. A play that empties the active hand wins the round immediately; otherwise the
   turn advances. Two consecutive `skipTurn` calls end the round in a stalemate.

## Testing and verification

- Fast Node tests under [tests/](../tests) cover the engine:
  [tests/test_rules.mjs](../tests/test_rules.mjs),
  [tests/test_scoring.mjs](../tests/test_scoring.mjs),
  [tests/test_state.mjs](../tests/test_state.mjs).
- Repo-hygiene pytest checks (ascii, whitespace, pyflakes, markdown links, import
  rules) live alongside as `tests/test_*.py`.
- Browser smoke test:
  [tests/playwright/glycolysis_smoke.spec.mjs](../tests/playwright/glycolysis_smoke.spec.mjs),
  run via `npm run test:playwright`.
- `./check_codebase.sh` runs the type-check, lint, format, and Node-test gates.
- `./build_github_pages.sh` type-checks and bundles; `./run_web_server.sh`
  builds then serves `dist/` on a random local port.

## Extension points

- Add a new molecule, enzyme, or cofactor in the matching
  [src/data/](../src/data) file and extend `CARD_COUNTS` in
  [src/data/cards.ts](../src/data/cards.ts).
- Add a new legal reaction by extending `REACTION_SPECS` in
  [src/data/reactions.ts](../src/data/reactions.ts), including its `substrate`
  and `product`; `validateMeld` and the extension rule pick it up.
- Add a turn action by extending `GameActions` in
  [src/ui/contracts.ts](../src/ui/contracts.ts), adding the engine action in
  [src/game/state.ts](../src/game/state.ts), and wiring it through
  [src/main.ts](../src/main.ts) and [src/ui/events.ts](../src/ui/events.ts).

## Known gaps

- Full tableau rearrangement, the must-play-if-able rule, and cumulative
  cross-round scoring are intentionally out of scope for v1; see
  [docs/GAME_PLAY.md](GAME_PLAY.md) and
  [docs/active_plans/active/glycolysis_tableau_v1_rules.md](active_plans/active/glycolysis_tableau_v1_rules.md).
- The standalone DHAP-to-GAP step is represented only inside the five-card
  `aldolase_bonus` meld; there is no separate triose phosphate isomerase
  reaction in v1.
