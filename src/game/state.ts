import type { CardInstance } from "../data/card_types";
import { findCardById } from "../data/cards";
import type { MeldValidationResult } from "./rules";
import { createSeededDeal, DEFAULT_HAND_SIZE } from "./deck";
import { validateMeld } from "./rules";

export type PlayerIndex = 0 | 1;

export type TurnPhase = "draw" | "meld" | "end";

export interface MeldPlay {
	cardIds: readonly string[];
	reactionId: string;
	points: number;
	message: string;
}

export interface PlayerState {
	hand: CardInstance[];
	melds: MeldPlay[];
	score: number;
}

export interface TurnState {
	activePlayer: PlayerIndex;
	turnNumber: number;
	phase: TurnPhase;
}

export interface GameState {
	seed: number;
	drawPile: CardInstance[];
	discardPile: CardInstance[];
	players: [PlayerState, PlayerState];
	turn: TurnState;
	lastMessage: string;
}

export interface GameResult<TState> {
	ok: true;
	message: string;
	state: TState;
}

export interface GameFailure {
	ok: false;
	message: string;
	issues: string[];
}

export type GameActionResult<TState> = GameResult<TState> | GameFailure;

export function createGameState(
	seed: number,
	handSize: number = DEFAULT_HAND_SIZE,
): GameState {
	const deal = createSeededDeal(seed, handSize);
	return {
		seed,
		drawPile: deal.drawPile,
		discardPile: [],
		players: [
			{
				hand: deal.players[0],
				melds: [],
				score: 0,
			},
			{
				hand: deal.players[1],
				melds: [],
				score: 0,
			},
		],
		turn: {
			activePlayer: 0,
			turnNumber: 1,
			phase: "draw",
		},
		lastMessage: "Game ready.",
	};
}

function removeCardsFromHand(
	hand: readonly CardInstance[],
	cardIds: readonly string[],
): CardInstance[] {
	const remaining = hand.slice();

	for (const cardId of cardIds) {
		const index = remaining.findIndex((card) => card.cardId === cardId);
		if (index < 0) {
			throw new Error(`The card ${cardId} is not in the active hand.`);
		}
		remaining.splice(index, 1);
	}

	return remaining;
}

export function playMeld(
	state: GameState,
	cardIds: readonly string[],
): GameActionResult<GameState> {
	const player = state.players[state.turn.activePlayer];
	const selectedCards: CardInstance[] = [];

	for (const cardId of cardIds) {
		const card = findCardById(player.hand, cardId);
		if (!card) {
			return {
				ok: false,
				message: `Card ${cardId} is not in the active player's hand.`,
				issues: ["The meld must use cards from the current hand only."],
			};
		}
		selectedCards.push(card);
	}

	const validation: MeldValidationResult = validateMeld(selectedCards);
	if (!validation.ok) {
		return {
			ok: false,
			message: validation.message,
			issues: validation.issues,
		};
	}

	const updatedHand = removeCardsFromHand(player.hand, cardIds);
	const updatedPlayer: PlayerState = {
		hand: updatedHand,
		melds: player.melds.concat({
			cardIds: [...cardIds],
			reactionId: validation.reaction.id,
			points: validation.score,
			message: validation.message,
		}),
		score: player.score + validation.score,
	};

	const updatedPlayers: [PlayerState, PlayerState] = state.turn.activePlayer === 0
		? [updatedPlayer, state.players[1]]
		: [state.players[0], updatedPlayer];

	const nextPlayer = state.turn.activePlayer === 0 ? 1 : 0;
	const nextTurn: TurnState = {
		activePlayer: nextPlayer,
		turnNumber: state.turn.turnNumber + 1,
		phase: "draw",
	};

	const nextState: GameState = {
		...state,
		players: updatedPlayers,
		turn: nextTurn,
		lastMessage: validation.message,
	};

	return {
		ok: true,
		message: validation.message,
		state: nextState,
	};
}

export function advanceTurn(state: GameState): GameState {
	const nextPlayer = state.turn.activePlayer === 0 ? 1 : 0;
	return {
		...state,
		turn: {
			activePlayer: nextPlayer,
			turnNumber: state.turn.turnNumber + 1,
			phase: "draw",
		},
		lastMessage: `Turn advanced to player ${nextPlayer + 1}.`,
	};
}
