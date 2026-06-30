import type { CardInstance, CardTemplateId } from "../data/card_types";
import { CARD_DEFINITIONS } from "../data/cards";
import { REACTION_SPECS } from "../data/reactions";
import type { ReactionSpec } from "../data/reactions";

// Friendly display name for each card template, so rejection messages read
// "Glucose-6-phosphate, ADP" rather than the raw template ids.
const CARD_NAME_BY_TEMPLATE = new Map<string, string>(
  CARD_DEFINITIONS.map((definition) => [definition.id, definition.name]),
);

function displayName(templateId: string): string {
  return CARD_NAME_BY_TEMPLATE.get(templateId) ?? templateId;
}

export interface MeldMatchResult {
  ok: true;
  message: string;
  reaction: ReactionSpec;
  score: number;
}

export interface MeldMismatchResult {
  ok: false;
  message: string;
  issues: string[];
}

export type MeldValidationResult = MeldMatchResult | MeldMismatchResult;

function countTemplates(cards: readonly CardInstance[]): Map<CardTemplateId, number> {
  const counts = new Map<CardTemplateId, number>();

  for (const card of cards) {
    const current = counts.get(card.templateId) ?? 0;
    counts.set(card.templateId, current + 1);
  }

  return counts;
}

function compareCounts(
  expected: readonly CardTemplateId[],
  actual: Map<CardTemplateId, number>,
): { missing: string[]; extra: string[] } {
  const missing: string[] = [];
  const extra: string[] = [];
  const expectedCounts = new Map<CardTemplateId, number>();

  for (const templateId of expected) {
    const current = expectedCounts.get(templateId) ?? 0;
    expectedCounts.set(templateId, current + 1);
  }

  for (const [templateId, expectedCount] of expectedCounts) {
    const actualCount = actual.get(templateId) ?? 0;
    if (actualCount < expectedCount) {
      for (let index = actualCount; index < expectedCount; index += 1) {
        missing.push(templateId);
      }
    }
  }

  for (const [templateId, actualCount] of actual) {
    const expectedCount = expectedCounts.get(templateId) ?? 0;
    if (actualCount > expectedCount) {
      for (let index = expectedCount; index < actualCount; index += 1) {
        extra.push(templateId);
      }
    }
  }

  return { missing, extra };
}

function renderTemplateIds(templateIds: readonly CardTemplateId[]): string {
  return templateIds.map(displayName).join(", ");
}

function buildMismatchMessage(cards: readonly CardInstance[]): MeldMismatchResult {
  if (cards.length === 0) {
    return {
      ok: false,
      message: "Select at least one card for a meld.",
      issues: ["No cards were selected."],
    };
  }

  const actual = countTemplates(cards);
  let closestSpec: ReactionSpec | undefined;
  let closestDistance = Number.POSITIVE_INFINITY;
  let closestMissing: string[] = [];
  let closestExtra: string[] = [];

  for (const spec of REACTION_SPECS) {
    const diff = compareCounts(spec.cardTemplateIds, actual);
    const distance = diff.missing.length + diff.extra.length;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSpec = spec;
      closestMissing = diff.missing;
      closestExtra = diff.extra;
    }
  }

  if (!closestSpec) {
    return {
      ok: false,
      message: "No glycolysis reaction matches those cards.",
      issues: ["No reaction specifications were available."],
    };
  }

  const issues: string[] = [];
  if (closestMissing.length > 0) {
    issues.push(`Missing cards: ${closestMissing.map(displayName).join(", ")}.`);
  }
  if (closestExtra.length > 0) {
    issues.push(`Extra cards: ${closestExtra.map(displayName).join(", ")}.`);
  }

  return {
    ok: false,
    message: `Closest legal meld is ${closestSpec.name}.`,
    issues: [
      `Expected template ids: ${renderTemplateIds(closestSpec.cardTemplateIds)}.`,
      ...issues,
    ],
  };
}

export function validateMeld(cards: readonly CardInstance[]): MeldValidationResult {
  const actualCounts = countTemplates(cards);

  for (const reaction of REACTION_SPECS) {
    const mismatch = compareCounts(reaction.cardTemplateIds, actualCounts);
    if (mismatch.missing.length === 0 && mismatch.extra.length === 0) {
      const score = cards.length + reaction.bonusPoints;
      return {
        ok: true,
        message: `Legal meld: ${reaction.name} for ${score} points.`,
        reaction,
        score,
      };
    }
  }

  return buildMismatchMessage(cards);
}
