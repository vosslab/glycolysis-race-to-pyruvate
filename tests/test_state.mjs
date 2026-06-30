import assert from "node:assert/strict";
import test from "node:test";

import { createOrderedDeck } from "../src/data/cards.ts";
import { REACTION_SPECS } from "../src/data/reactions.ts";
import { createGameState, drawCard, playMeld, skipTurn } from "../src/game/state.ts";

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

test("drawing one card ends the turn and passes to the other player", () => {
  const state = createGameState(1, 7);
  const drawBefore = state.drawPile.length;
  const handBefore = state.players[0].hand.length;

  const result = drawCard(state);
  assert.equal(result.ok, true);

  const next = result.state;
  assert.equal(next.activePlayer, 1);
  assert.equal(next.turnNumber, 2);
  assert.equal(next.drawPile.length, drawBefore - 1);
  assert.equal(next.players[0].hand.length, handBefore + 1);
});

test("drawing from an empty draw pile is rejected", () => {
  const state = createGameState(1, 7);
  state.drawPile = [];

  const result = drawCard(state);
  assert.equal(result.ok, false);
});

test("two consecutive passes end the round in a stalemate", () => {
  const state = createGameState(1, 7);

  const first = skipTurn(state);
  assert.equal(first.ok, true);
  assert.equal(first.state.status, "playing");

  const second = skipTurn(first.state);
  assert.equal(second.ok, true);
  assert.equal(second.state.status, "stalemate");
  assert.equal(second.state.winner, null);
});

test("the first meld must start with Glucose", () => {
  const deck = createOrderedDeck();
  const state = createGameState(1, 7);
  const offStart = cardsForReaction(deck, "phosphoglucose_isomerase");
  state.players[0].hand = offStart.slice();

  const result = playMeld(state, cardIds(offStart));
  assert.equal(result.ok, false);
  assert.match(result.message, /must start with Glucose/);
});

test("a legal Hexokinase meld opens the tableau and advances the frontier", () => {
  const deck = createOrderedDeck();
  const state = createGameState(1, 7);
  const hexokinase = cardsForReaction(deck, "hexokinase");
  const spare = deck.find((card) => card.templateId === "pyruvate");
  state.players[0].hand = [...hexokinase, spare];

  const result = playMeld(state, cardIds(hexokinase));
  assert.equal(result.ok, true);

  const next = result.state;
  assert.equal(next.pathway.length, 1);
  assert.equal(next.frontier, "glucose_6_phosphate");
  assert.equal(next.players[0].score, 5);
  assert.equal(next.activePlayer, 1);
  assert.equal(next.status, "playing");
});

test("a meld that does not extend the frontier is rejected", () => {
  const deck = createOrderedDeck();
  let state = createGameState(1, 7);
  const hexokinase = cardsForReaction(deck, "hexokinase");
  const spare = deck.find((card) => card.templateId === "pyruvate");
  state.players[0].hand = [...hexokinase, spare];

  const opened = playMeld(state, cardIds(hexokinase));
  assert.equal(opened.ok, true);
  state = opened.state;

  // Player 1 tries to jump ahead with PFK-1 (substrate F6P) past frontier G6P.
  const pfk = cardsForReaction(deck, "phosphofructokinase_1");
  state.players[1].hand = pfk.slice();
  const result = playMeld(state, cardIds(pfk));
  assert.equal(result.ok, false);
  assert.match(result.message, /does not extend the current tableau/);
});

test("a meld that empties the hand wins the round", () => {
  const deck = createOrderedDeck();
  const state = createGameState(1, 7);
  const hexokinase = cardsForReaction(deck, "hexokinase");
  state.players[0].hand = hexokinase.slice();

  const result = playMeld(state, cardIds(hexokinase));
  assert.equal(result.ok, true);
  assert.equal(result.state.status, "won");
  assert.equal(result.state.winner, 0);
  assert.equal(result.state.players[0].hand.length, 0);
});
