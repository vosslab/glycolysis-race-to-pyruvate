# Code architecture

## Overview

Glycolysis Race to Pyruvate is a two-player local hot-seat card game that runs
entirely in the browser. The source is strict TypeScript under
[src/](../src), bundled to a single ESM file with esbuild and served as a static
GitHub Pages artifact from `dist/`. There is no backend, account system, or
network dependency.

The code splits into two layers:

- A live UI layer ([src/main.ts](../src/main.ts), [src/ui/](../src/ui)) that
  drives the playable page today.
- A DOM-free domain layer ([src/data/](../src/data),
  [src/game/](../src/game)) that defines the glycolysis card model and reaction
  rules for later UI and test reuse.

These two layers are not yet wired together. The UI runs on its own inline card
and state model; the domain layer is exercised by the Node tests under
[tests/](../tests). Connecting the UI to the domain layer is the main open
integration task (see [Known gaps](#known-gaps)).

## Major components

### UI layer (live)

- [src/main.ts](../src/main.ts): entry point. Defines `LocalGameState`, builds
  the initial round, holds the turn actions (`drawCard`, `playMeld`,
  `discardCard`, `passScreen`, `startNextTurn`, `toggleSelectedCard`), wires a
  controller to a rerender callback, and calls `main()` when a `document` is
  present.
- [src/ui/contracts.ts](../src/ui/contracts.ts): view-model types shared by the
  renderer (`CardView`, `MeldView`, `PlayerView`, `GameState`, `GameActions`,
  `GamePhase`, `FeedbackTone`).
- [src/ui/render.ts](../src/ui/render.ts): `renderGame(root, state)` builds the
  card-table DOM (playing-card faces, hands, pathway, draw and discard piles,
  feedback banner).
- [src/ui/events.ts](../src/ui/events.ts): `attachGameEvents(root, actions)`
  binds click handlers to the action callbacks.
- [src/index.html](../src/index.html), [src/style.css](../src/style.css):
  static shell and styles copied into `dist/` at build time.

### Domain layer (DOM-free, not yet wired to UI)

- [src/data/card_types.ts](../src/data/card_types.ts): the typed card vocabulary
  (`MoleculeId`, `EnzymeId`, `CofactorId`, `CardDefinition`, `CardInstance`).
- [src/data/molecules.ts](../src/data/molecules.ts),
  [src/data/enzymes.ts](../src/data/enzymes.ts),
  [src/data/cofactors.ts](../src/data/cofactors.ts): the 11 molecules, 10
  enzymes, and ATP/ADP/NAD+/NADH cofactor definitions.
- [src/data/cards.ts](../src/data/cards.ts): card multiplicities (`CARD_COUNTS`),
  deck construction (`createOrderedDeck`, `shuffleDeck`, `buildShuffledDeck`),
  and lookup helpers (`cardLabel`, `findCardById`).
- [src/data/reactions.ts](../src/data/reactions.ts): `REACTION_SPECS`, the legal
  meld definitions by `ReactionCategory`.
- [src/game/state.ts](../src/game/state.ts): turn and game state model
  (`GameState`, `PlayerState`, `TurnState`) plus state transitions
  (`createGameState`, `playMeld`, `advanceTurn`) returning a
  `GameActionResult` success or failure union.
- [src/game/rules.ts](../src/game/rules.ts): `validateMeld` and `describeMeld`,
  matching selected cards against `REACTION_SPECS`.
- [src/game/deck.ts](../src/game/deck.ts): two-player dealing
  (`dealTwoPlayers`, `createSeededDeal`, `DEFAULT_HAND_SIZE`).

## Data flow

### Live UI turn (current page)

1. `main()` finds the `#app` root, builds `createInitialState()`, and renders.
2. A player click fires a handler in `attachGameEvents`, which calls a
   controller action (for example `onPlayMeld`).
3. The action mutates `LocalGameState` (moves cards, updates score, sets the
   feedback tone and prompt) and calls `maybeEndRound` when a hand empties.
4. The controller reruns `renderGame(root, state)` to repaint the table.
5. Emptying a hand sets `phase` to `round_over`; `startNextTurn` reseeds the
   round and alternates the starting player.

### Domain layer (tests today, UI later)

1. `buildShuffledDeck(seed)` produces a deterministic deck from `CARD_COUNTS`.
2. `createSeededDeal` deals two hands and a draw pile.
3. `createGameState` seeds the turn model.
4. `validateMeld(cards)` checks a selection against `REACTION_SPECS`; `playMeld`
   applies a legal meld; `advanceTurn` rotates the active player.

## Testing and verification

- Fast Node tests under [tests/](../tests) cover the domain layer:
  [tests/test_rules.mjs](../tests/test_rules.mjs),
  [tests/test_scoring.mjs](../tests/test_scoring.mjs),
  [tests/test_state.mjs](../tests/test_state.mjs).
- Repo-hygiene pytest checks (ascii, whitespace, pyflakes, markdown links, import
  rules) live alongside as `tests/test_*.py`.
- Browser smoke test:
  [tests/playwright/glycolysis_smoke.spec.mjs](../tests/playwright/glycolysis_smoke.spec.mjs),
  run via `npm run test:playwright`.
- `./check_codebase.sh` runs the type-check and lint gates.
- `./build_github_pages.sh` type-checks and bundles; `./run_web_server.sh`
  builds then serves `dist/` on a random local port.

## Extension points

- Add a new molecule, enzyme, or cofactor in the matching
  [src/data/](../src/data) file and extend `CARD_COUNTS` in
  [src/data/cards.ts](../src/data/cards.ts).
- Add a new legal reaction by extending `REACTION_SPECS` in
  [src/data/reactions.ts](../src/data/reactions.ts); `validateMeld` picks it up.
- Add a turn action by extending `GameActions` in
  [src/ui/contracts.ts](../src/ui/contracts.ts) and wiring it through
  [src/main.ts](../src/main.ts) and [src/ui/events.ts](../src/ui/events.ts).

## Known gaps

- Verify the plan and timeline for replacing the inline UI card model in
  [src/main.ts](../src/main.ts) with the domain layer in
  [src/data/](../src/data) and [src/game/](../src/game).
- Confirm whether `tests/test_*.py` hygiene checks are wired into
  `./check_codebase.sh` or run only via `pytest tests/`.
