import assert from "node:assert/strict";
import test from "node:test";

import { createOrderedDeck } from "../src/data/cards.ts";
import { REACTION_SPECS } from "../src/data/reactions.ts";
import { createGameState, playMeld } from "../src/game/state.ts";

function cardsForReaction(deck, reactionId) {
  const reaction = REACTION_SPECS.find((spec) => spec.id === reactionId);
  assert.notEqual(reaction, undefined, `Missing reaction ${reactionId}`);
  return reaction.cardTemplateIds.map((templateId) => {
    const card = deck.find((entry) => entry.templateId === templateId);
    assert.notEqual(card, undefined, `Missing card ${templateId}`);
    return card;
  });
}

function cardIds(cards) {
  return cards.map((card) => card.cardId);
}

test("scores accumulate as the shared pathway extends in order", () => {
  const deck = createOrderedDeck();
  let state = createGameState(7, 7);

  const hexokinase = cardsForReaction(deck, "hexokinase");
  const isomerase = cardsForReaction(deck, "phosphoglucose_isomerase");
  // Spare cards keep each hand non-empty so neither play wins the round.
  const spareA = deck.find((card) => card.templateId === "pyruvate");
  const spareB = deck.find((card) => card.templateId === "phosphoenolpyruvate");
  assert.notEqual(spareA, undefined, "Missing spare card pyruvate");
  assert.notEqual(spareB, undefined, "Missing spare card phosphoenolpyruvate");
  state.players[0].hand = [...hexokinase, spareA];
  state.players[1].hand = [...isomerase, spareB];

  const first = playMeld(state, cardIds(hexokinase));
  assert.equal(first.ok, true);
  state = first.state;
  assert.equal(state.frontier, "glucose_6_phosphate");

  const second = playMeld(state, cardIds(isomerase));
  assert.equal(second.ok, true);
  state = second.state;

  assert.equal(state.frontier, "fructose_6_phosphate");
  assert.equal(state.players[0].score, 5);
  assert.equal(state.players[1].score, 3);
  assert.equal(state.pathway.length, 2);
});
