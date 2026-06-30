import type { CardInstance } from "../data/card_types";
import { buildShuffledDeck } from "../data/cards";

export interface DealResult {
  drawPile: CardInstance[];
  players: [CardInstance[], CardInstance[]];
}

export const DEFAULT_HAND_SIZE = 7;

export function dealTwoPlayers(
  deck: readonly CardInstance[],
  handSize: number = DEFAULT_HAND_SIZE,
): DealResult {
  if (deck.length < handSize * 2) {
    throw new Error("The deck does not contain enough cards for two hands.");
  }

  const playerOne: CardInstance[] = [];
  const playerTwo: CardInstance[] = [];

  for (let index = 0; index < handSize; index += 1) {
    const cardOne = deck[index];
    const cardTwo = deck[index + handSize];
    if (!cardOne || !cardTwo) {
      throw new Error("The deck does not contain enough cards for two hands.");
    }
    playerOne.push(cardOne);
    playerTwo.push(cardTwo);
  }

  const drawPile = deck.slice(handSize * 2);

  return {
    drawPile,
    players: [playerOne, playerTwo],
  };
}

export function createSeededDeal(seed: number, handSize: number = DEFAULT_HAND_SIZE): DealResult {
  const deck = buildShuffledDeck(seed);
  return dealTwoPlayers(deck, handSize);
}
