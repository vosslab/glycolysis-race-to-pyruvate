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

test("meld scores accumulate across two real turns", () => {
	const deck = createOrderedDeck();
	const state = createGameState(42, 7);
	const playerOneMeld = cardsForReaction(deck, "hexokinase");
	const playerTwoMeld = cardsForReaction(deck, "aldolase_bonus");

	state.players[0].hand = playerOneMeld.slice();
	state.players[1].hand = playerTwoMeld.slice();

	const firstResult = playMeld(state, cardIds(playerOneMeld));
	assert.equal(firstResult.ok, true);

	const secondState = firstResult.state;
	const secondResult = playMeld(secondState, cardIds(playerTwoMeld));
	assert.equal(secondResult.ok, true);

	const finalState = secondResult.state;
	assert.equal(finalState.players[0].score, 5);
	assert.equal(finalState.players[1].score, 7);
	assert.equal(finalState.players[0].score + finalState.players[1].score, 12);
});
