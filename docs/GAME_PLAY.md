# How to play

Glycolysis Race to Pyruvate is a two-player local hot-seat card game. Both
players share one browser tab and build a single shared glycolysis pathway. The
first player to empty their hand wins the round.

This page is the source of truth for the player-facing rules. It matches the
shipped game exactly.

## Browser aspect ratio

Play in a browser window that is about 16:9 to 16:10 wide (for example
1600 by 900 or 1600 by 1000). The two hands sit on the left and the shared
pathway and piles sit on the right, so a wide window keeps everything on one
screen without scrolling.

## Goal and win condition

- Empty your hand before the other player does.
- You shed cards by playing them as legal reaction melds onto the shared
  pathway.
- The play that removes your last card wins the round immediately.
- If the draw pile runs out and neither player can extend the pathway, the
  round ends in a stalemate with no winner.
- You do not need to reach pyruvate to win. An empty hand is the win.

## Card types

- Molecule cards: the metabolites of glycolysis, from Glucose to Pyruvate.
- Enzyme cards: the catalyst for each step, such as Hexokinase or Aldolase.
- Cofactor cards: ATP, ADP, NAD+, and NADH. Cofactors are cards inside a meld,
  not a stored resource pool.

## Turn flow

On your turn you choose exactly one action, then the turn ends:

1. Draw: take one card from the draw pile.
2. Play: play one legal meld from your hand onto the shared pathway.

After your action the pass screen appears. Hand the device to the other player,
who taps Reveal hand to see their cards. The inactive player's hand stays hidden
the whole time.

## Legal melds

A meld must match one glycolysis reaction exactly. There are two shapes:

- Normal three-card meld: substrate molecule, enzyme, product molecule.
  Example: Glucose-6-phosphate + Phosphoglucose isomerase + Fructose-6-phosphate.
- Cofactor five-card meld: substrate, enzyme, cofactor, product, cofactor.
  Example: Glucose + Hexokinase + ATP + Glucose-6-phosphate + ADP.

If your selection does not match a reaction, the play is rejected, your cards
return to your hand, and the game explains why (for example a missing cofactor
or the wrong enzyme).

## Building the shared pathway

The pathway is one shared, ordered chain. You may only extend its end.

- The first meld must start with Glucose (the Hexokinase step).
- Every later meld must begin with the molecule currently at the end of the
  pathway. If the pathway ends at Glucose-6-phosphate, the next legal meld must
  consume Glucose-6-phosphate.
- You cannot rearrange or insert into earlier parts of the pathway in v1.

The frontier line above the pathway tells you which molecule the next meld must
build from.

## Cofactor melds

These reactions need their cofactor cards present in the meld:

- Glucose + Hexokinase + ATP + Glucose-6-phosphate + ADP
- Fructose-6-phosphate + PFK-1 + ATP + Fructose-1,6-bisphosphate + ADP
- Glyceraldehyde-3-phosphate + GAPDH + NAD+ + 1,3-bisphosphoglycerate + NADH
- 1,3-bisphosphoglycerate + Phosphoglycerate kinase + ADP + 3-phosphoglycerate + ATP
- Phosphoenolpyruvate + Pyruvate kinase + ADP + Pyruvate + ATP

## Aldolase and the DHAP/TPI branch

After Fructose-1,6-bisphosphate the pathway can split:

- Basic route: Fructose-1,6-bisphosphate + Aldolase + Glyceraldehyde-3-phosphate.
- Bonus route: Fructose-1,6-bisphosphate + Aldolase + Dihydroxyacetone phosphate
  + Triose phosphate isomerase + Glyceraldehyde-3-phosphate. This five-card meld
  scores extra.

Both routes leave the pathway at Glyceraldehyde-3-phosphate, where the payoff
phase continues.

## Scoring

- v1 is win or lose. The winner is whoever empties their hand first.
- Each meld also earns points (cards in the meld plus any branch bonus), shown
  on each player's score. The score is a round summary only and never decides
  the winner.

## Example turn

1. Player 1 holds Glucose, Hexokinase, ATP, Glucose-6-phosphate, and ADP.
2. Player 1 selects all five cards and taps Play meld. The Hexokinase reaction
   is legal and opens the pathway. The frontier moves to Glucose-6-phosphate.
3. The pass screen appears. Player 1 hands the device to Player 2.
4. Player 2 taps Reveal hand, then plays
   Glucose-6-phosphate + Phosphoglucose isomerase + Fructose-6-phosphate, which
   extends the pathway. The frontier moves to Fructose-6-phosphate.

## Screenshots

![Player 1 has selected the five Hexokinase cards, shown in the Selected cards zone, with the shared pathway still empty](screenshots/meld_building.png)

![The pass-the-device handoff screen with both hands hidden and the Hexokinase meld on the shared pathway](screenshots/pass_device.png)

![A two-meld shared pathway after Hexokinase and Phosphoglucose isomerase, with the frontier pointing to Fructose-6-phosphate](screenshots/main_table.png)
