# Glycolysis tableau v1 rules

Locked v1 ruleset. Source of truth for the UI wiring, tests, and
`docs/GAME_PLAY.md`. Derived from the Vatikan/Carousel rummy references plus
the maintainer's concrete spec. End-only ordered extension is the key
simplification: a rule students grasp in one minute.

## Goal

Be the first player to empty your hand. Players empty their hands by adding
legal reaction melds to one shared, ordered glycolysis tableau.

## Players

- Two players share one browser (local hot-seat).
- The active player's hand is visible; the inactive player's hand shows only a
  card count. A pass screen hides the hand between turns.

## Deck

- Card types: molecule, enzyme, cofactor (ATP, ADP, NAD+, NADH).
- Counts come from the existing tuned `CARD_COUNTS` in `src/data/cards.ts`
  (GAP=4, cofactors=4, the rest=2), not a flat 3-each. Reused intermediates
  need extra copies.
- Shuffle the full deck with a seed at game start, deal 7 to each player, the
  rest become the face-down draw pile.
- There is no discard pile.

## Turn structure

On your turn choose exactly one action, then the turn ends and the pass screen
appears:

1. Draw: take 1 card from the draw pile.
2. Play: play 1 legal meld from your hand onto the shared tableau.

## Legal melds

A meld matches exactly one reaction in `src/data/reactions.ts`
(`validateMeld` in `src/game/rules.ts` is the gate). Two shapes:

- Normal 3-card meld: substrate molecule + enzyme + product molecule.
- Cofactor 5-card meld: substrate + enzyme + cofactor + product + cofactor.
  Cofactors are cards in the meld, not stored resources.

## Shared tableau rule (end-only extension)

- The tableau is one shared ordered glycolysis pathway with a frontier =
  the last product molecule placed.
- A meld is legal only if its substrate molecule equals the current frontier
  product (it extends the end). Players may not rearrange earlier cards.
- First meld (empty tableau) must start with Glucose (the Hexokinase step).
- Aldolase branch: the basic route is
  `Fructose-1,6-bisphosphate + Aldolase + Glyceraldehyde-3-phosphate`. The
  DHAP/TPI route is a single five-card bonus meld that also ends at GAP:
  `F1,6BP + Aldolase + DHAP + TPI + GAP`. There is no separate standalone TPI
  reaction in v1. The payoff phase continues only once the frontier reaches GAP.

## Win condition

- A player wins immediately on a legal meld that empties their hand.
- If the draw pile is empty and neither player can extend the tableau or empty
  their hand, the round ends in a stalemate (no winner).
- v1 does not require the winning play to reach pyruvate.

## Scoring

- v1 is win/loss. Optional round summary only: winner, last molecule reached,
  count of legal melds in the tableau. Score never decides the winner in v1.

## Invalid plays

Rejected; selected cards return to hand with a reason:

- "The first meld must start with Glucose."
- "That enzyme does not match this substrate and product."
- "This meld does not extend the current tableau."
- "This reaction needs ATP." / "This reaction needs NAD+." (missing cofactor)

## Out of scope for v1

- Full tableau rearrangement, must-play-if-able detection, discard pile,
  private player pathways, pyruvate-as-required-win, opponent leftover-card
  scoring, NPC opponent, online multiplayer.

## Reconciliation note

An earlier multiple-choice answer picked "order-free reactions". The
maintainer's later detailed advisory specifies ordered end-only extension,
which supersedes it as the more concrete, more playable, pedagogy-first model.
