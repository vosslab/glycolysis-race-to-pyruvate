import type { CardInstance, MoleculeId } from "../data/card_types";
import { findCardById } from "../data/cards";
import type { MeldValidationResult } from "./rules";
import { createSeededDeal, DEFAULT_HAND_SIZE } from "./deck";
import { validateMeld } from "./rules";

export type PlayerIndex = 0 | 1;

// "playing" while the round is live, "won" when a player emptied their hand,
// "stalemate" when the draw pile is gone and neither player can advance.
export type RoundStatus = "playing" | "won" | "stalemate";

export interface MeldPlay {
  cardIds: readonly string[];
  cards: readonly CardInstance[];
  reactionName: string;
  points: number;
  playedBy: PlayerIndex;
}

export interface PlayerState {
  hand: CardInstance[];
  score: number;
}

export interface GameState {
  roundNumber: number;
  drawPile: CardInstance[];
  // The single shared glycolysis tableau both players extend.
  pathway: MeldPlay[];
  // The product molecule at the end of the tableau, or null when empty.
  frontier: MoleculeId | null;
  players: [PlayerState, PlayerState];
  activePlayer: PlayerIndex;
  turnNumber: number;
  status: RoundStatus;
  winner: PlayerIndex | null;
  // Consecutive forced passes; two in a row with an empty draw pile is a stalemate.
  consecutiveSkips: number;
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

//============================================
// Construction

export function createGameState(
  seed: number,
  handSize: number = DEFAULT_HAND_SIZE,
  roundNumber: number = 1,
  startingPlayer: PlayerIndex = 0,
): GameState {
  const deal = createSeededDeal(seed, handSize);
  return {
    roundNumber,
    drawPile: deal.drawPile,
    pathway: [],
    frontier: null,
    players: [
      { hand: deal.players[0], score: 0 },
      { hand: deal.players[1], score: 0 },
    ],
    activePlayer: startingPlayer,
    turnNumber: 1,
    status: "playing",
    winner: null,
    consecutiveSkips: 0,
  };
}

//============================================
// Internal helpers

export function otherPlayer(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0;
}

// Advance to the next player's turn. Pure: returns the next turn fields only.
function advancedTurn(state: GameState): Pick<GameState, "activePlayer" | "turnNumber"> {
  return {
    activePlayer: otherPlayer(state.activePlayer),
    turnNumber: state.turnNumber + 1,
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

// End-only extension check. Returns an error message when the reaction cannot
// extend the current tableau, or null when the play is positionally legal.
function extensionError(state: GameState, substrate: MoleculeId): string | null {
  if (state.frontier === null) {
    if (substrate !== "glucose") {
      return "The first meld must start with Glucose.";
    }
    return null;
  }
  if (substrate !== state.frontier) {
    return "This meld does not extend the current tableau.";
  }
  return null;
}

//============================================
// Actions

export function drawCard(state: GameState): GameActionResult<GameState> {
  if (state.status !== "playing") {
    return { ok: false, message: "The round is over.", issues: ["Start a new round."] };
  }

  const drawn = state.drawPile[state.drawPile.length - 1];
  if (drawn === undefined) {
    return {
      ok: false,
      message: "The draw pile is empty.",
      issues: ["No cards remain to draw. Play a meld or pass."],
    };
  }

  const player = state.players[state.activePlayer];
  const updatedPlayer: PlayerState = {
    hand: [...player.hand, drawn],
    score: player.score,
  };
  const updatedPlayers: [PlayerState, PlayerState] =
    state.activePlayer === 0
      ? [updatedPlayer, state.players[1]]
      : [state.players[0], updatedPlayer];

  const message = `Drew ${drawn.shortName}.`;
  const nextState: GameState = {
    ...state,
    drawPile: state.drawPile.slice(0, -1),
    players: updatedPlayers,
    consecutiveSkips: 0,
    ...advancedTurn(state),
  };

  return { ok: true, message, state: nextState };
}

export function playMeld(
  state: GameState,
  cardIds: readonly string[],
): GameActionResult<GameState> {
  if (state.status !== "playing") {
    return { ok: false, message: "The round is over.", issues: ["Start a new round."] };
  }

  const player = state.players[state.activePlayer];
  const selectedCards: CardInstance[] = [];
  for (const cardId of cardIds) {
    const card = findCardById(player.hand, cardId);
    if (!card) {
      return {
        ok: false,
        message: "Those cards are not all in the active hand.",
        issues: ["A meld must use cards from the current hand only."],
      };
    }
    selectedCards.push(card);
  }

  const validation: MeldValidationResult = validateMeld(selectedCards);
  if (!validation.ok) {
    return { ok: false, message: validation.message, issues: validation.issues };
  }

  const positionError = extensionError(state, validation.reaction.substrate);
  if (positionError !== null) {
    return { ok: false, message: positionError, issues: ["Extend the end of the pathway."] };
  }

  const updatedHand = removeCardsFromHand(player.hand, cardIds);
  const updatedPlayer: PlayerState = {
    hand: updatedHand,
    score: player.score + validation.score,
  };
  const updatedPlayers: [PlayerState, PlayerState] =
    state.activePlayer === 0
      ? [updatedPlayer, state.players[1]]
      : [state.players[0], updatedPlayer];

  const meld: MeldPlay = {
    cardIds: [...cardIds],
    cards: selectedCards,
    reactionName: validation.reaction.name,
    points: validation.score,
    playedBy: state.activePlayer,
  };

  // A play that empties the hand wins the round immediately.
  if (updatedHand.length === 0) {
    const wonState: GameState = {
      ...state,
      players: updatedPlayers,
      pathway: [...state.pathway, meld],
      frontier: validation.reaction.product,
      consecutiveSkips: 0,
      status: "won",
      winner: state.activePlayer,
    };
    const message = `${validation.reaction.name} empties the hand and wins the round.`;
    return { ok: true, message, state: wonState };
  }

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    pathway: [...state.pathway, meld],
    frontier: validation.reaction.product,
    consecutiveSkips: 0,
    ...advancedTurn(state),
  };

  return { ok: true, message: validation.message, state: nextState };
}

// A forced pass, only meaningful when the draw pile is empty. Two consecutive
// passes mean neither player can act, so the round ends in a stalemate.
export function skipTurn(state: GameState): GameActionResult<GameState> {
  if (state.status !== "playing") {
    return { ok: false, message: "The round is over.", issues: ["Start a new round."] };
  }

  const skips = state.consecutiveSkips + 1;
  if (skips >= 2) {
    const stalemateState: GameState = {
      ...state,
      consecutiveSkips: skips,
      status: "stalemate",
      winner: null,
    };
    const message = "Neither player can extend the pathway. The round is a stalemate.";
    return { ok: true, message, state: stalemateState };
  }

  const nextState: GameState = {
    ...state,
    consecutiveSkips: skips,
    ...advancedTurn(state),
  };
  return { ok: true, message: "Passed without a play.", state: nextState };
}
