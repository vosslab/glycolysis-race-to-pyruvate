import type { CardDefinition, CardInstance, CardTemplateId } from "./card_types";
import { COFACTORS } from "./cofactors";
import { ENZYMES } from "./enzymes";
import { MOLECULES } from "./molecules";

export const CARD_DEFINITIONS = [
  ...MOLECULES,
  ...ENZYMES,
  ...COFACTORS,
] as const satisfies readonly CardDefinition[];

export const CARD_COUNTS: Record<CardTemplateId, number> = {
  glucose: 2,
  glucose_6_phosphate: 2,
  fructose_6_phosphate: 2,
  fructose_1_6_bisphosphate: 2,
  dihydroxyacetone_phosphate: 2,
  glyceraldehyde_3_phosphate: 4,
  one_3_bisphosphoglycerate: 2,
  three_phosphoglycerate: 2,
  two_phosphoglycerate: 2,
  phosphoenolpyruvate: 2,
  pyruvate: 2,
  hexokinase: 2,
  phosphoglucose_isomerase: 2,
  phosphofructokinase_1: 2,
  aldolase: 2,
  triose_phosphate_isomerase: 2,
  glyceraldehyde_3_phosphate_dehydrogenase: 2,
  phosphoglycerate_kinase: 2,
  phosphoglycerate_mutase: 2,
  enolase: 2,
  pyruvate_kinase: 2,
  atp: 4,
  adp: 4,
  nad_plus: 4,
  nadh: 4,
};

function buildCardInstance(template: CardDefinition, copyIndex: number): CardInstance {
  return {
    cardId: `${template.id}#${copyIndex}`,
    templateId: template.id,
    name: template.name,
    shortName: template.shortName,
    kind: template.kind,
  };
}

export function createOrderedDeck(): CardInstance[] {
  const deck: CardInstance[] = [];

  for (const template of CARD_DEFINITIONS) {
    const count = CARD_COUNTS[template.id];
    for (let copyIndex = 1; copyIndex <= count; copyIndex += 1) {
      deck.push(buildCardInstance(template, copyIndex));
    }
  }

  return deck;
}

function nextRandomState(state: number): number {
  let value = state ^ (state << 13);
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

export function shuffleDeck(cards: readonly CardInstance[], seed: number): CardInstance[] {
  const deck = cards.slice();
  let state = seed >>> 0;

  for (let index = deck.length - 1; index > 0; index -= 1) {
    state = nextRandomState(state);
    const swapIndex = state % (index + 1);
    const current = deck[index];
    const swapped = deck[swapIndex];
    if (!current || !swapped) {
      throw new Error("The shuffle encountered an empty card slot.");
    }
    deck[index] = swapped;
    deck[swapIndex] = current;
  }

  return deck;
}

export function buildShuffledDeck(seed: number): CardInstance[] {
  return shuffleDeck(createOrderedDeck(), seed);
}

export function cardLabel(card: CardInstance): string {
  return `${card.shortName}`;
}

export function findCardById(
  cards: readonly CardInstance[],
  cardId: string,
): CardInstance | undefined {
  for (const card of cards) {
    if (card.cardId === cardId) {
      return card;
    }
  }

  return undefined;
}
