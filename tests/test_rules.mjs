import assert from "node:assert/strict";
import test from "node:test";

import { CARD_COUNTS, createOrderedDeck } from "../src/data/cards.ts";
import { REACTION_SPECS } from "../src/data/reactions.ts";
import { validateMeld } from "../src/game/rules.ts";

function countTemplates(cards) {
	const counts = new Map();

	for (const card of cards) {
		const current = counts.get(card.templateId) ?? 0;
		counts.set(card.templateId, current + 1);
	}

	return counts;
}

function cardsForReaction(deck, reactionId) {
	const reaction = REACTION_SPECS.find((spec) => spec.id === reactionId);
	assert.notEqual(reaction, undefined, `Missing reaction ${reactionId}`);

	return reaction.cardTemplateIds.map((templateId) => {
		const card = deck.find((entry) => entry.templateId === templateId);
		assert.notEqual(card, undefined, `Missing card ${templateId}`);
		return card;
	});
}

test("ordered deck matches the declared card counts", () => {
	const deck = createOrderedDeck();
	const counts = countTemplates(deck);

	for (const [templateId, expectedCount] of Object.entries(CARD_COUNTS)) {
		assert.equal(counts.get(templateId) ?? 0, expectedCount, templateId);
	}
});

test("cofactor melds require ATP, ADP, NAD+, and NADH", () => {
	const deck = createOrderedDeck();

	const hexokinase = validateMeld(cardsForReaction(deck, "hexokinase"));
	assert.equal(hexokinase.ok, true);
	assert.equal(hexokinase.reaction.category, "atp_investment");
	assert.equal(hexokinase.score, 5);

	const gapdh = validateMeld(cardsForReaction(deck, "glyceraldehyde_3_phosphate_dehydrogenase"));
	assert.equal(gapdh.ok, true);
	assert.equal(gapdh.reaction.category, "gapdh_redox");
	assert.equal(gapdh.score, 5);
});

test("aldolase branch scores higher than the basic GAP route", () => {
	const deck = createOrderedDeck();
	const basic = validateMeld(cardsForReaction(deck, "aldolase_basic"));
	const branch = validateMeld(cardsForReaction(deck, "aldolase_bonus"));

	assert.equal(basic.ok, true);
	assert.equal(branch.ok, true);
	assert.equal(basic.score, 3);
	assert.equal(branch.score, 7);
	assert.equal(branch.reaction.category, "branch");
	assert.equal(branch.score > basic.score, true);
});

test("illegal melds report the closest legal reaction", () => {
	const deck = createOrderedDeck();
	const glucose = deck.find((card) => card.cardId === "glucose#1");
	const hexokinase = deck.find((card) => card.cardId === "hexokinase#1");
	const atp = deck.find((card) => card.cardId === "atp#1");

	assert.notEqual(glucose, undefined);
	assert.notEqual(hexokinase, undefined);
	assert.notEqual(atp, undefined);

	const result = validateMeld([glucose, hexokinase, atp]);

	assert.equal(result.ok, false);
	assert.match(result.message, /Closest legal meld is Hexokinase\./);
	assert.match(result.issues.join(" "), /Missing cards: glucose_6_phosphate, adp\./);
});
