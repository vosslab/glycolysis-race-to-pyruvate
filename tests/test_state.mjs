import assert from "node:assert/strict";
import test from "node:test";

import {
	createInitialState,
	discardCard,
	startNextTurn,
	toggleSelectedCard,
} from "../src/main.ts";

test("discarding a card sends the game to the pass screen and advances the turn", () => {
	const state = createInitialState();

	toggleSelectedCard(state, "p1-glc");
	discardCard(state);

	assert.equal(state.phase, "pass_screen");
	assert.equal(state.players[0].score, 1);
	assert.equal(state.discardPile[state.discardPile.length - 1].id, "p1-glc");
	assert.equal(state.prompt, "Pass the device to Player 2.");

	startNextTurn(state);

	assert.equal(state.phase, "active_turn");
	assert.equal(state.activePlayerId, "player_two");
	assert.equal(state.turnNumber, 2);
});

test("emptying the hand ends the round and the next round keeps scores", () => {
	const state = createInitialState();
	const onlyCard = state.players[0].hand[0];

	state.players[0].hand = [onlyCard];
	state.selectedCardIds = [onlyCard.id];

	discardCard(state);

	assert.equal(state.phase, "round_over");
	assert.equal(state.roundWinner, "Player 1");
	assert.equal(state.feedbackTitle, "Round complete");

	startNextTurn(state);

	assert.equal(state.roundNumber, 2);
	assert.equal(state.phase, "active_turn");
	assert.equal(state.activePlayerId, "player_two");
	assert.equal(state.players[0].score, 1);
	assert.equal(state.players[1].score, 0);
	assert.equal(state.discardPile.length, 0);
});
