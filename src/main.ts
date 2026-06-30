import type { CardInstance, MoleculeId } from "./data/card_types";
import { MOLECULES } from "./data/molecules";
import type { GameState as EngineState, PlayerIndex } from "./game/state";
import { createGameState, drawCard, otherPlayer, playMeld, skipTurn } from "./game/state";
import { attachGameEvents } from "./ui/events";
import { renderGame } from "./ui/render";
import type { CardView, GameState, MeldView, PlayerId, PlayerView } from "./ui/contracts";

const HAND_SIZE = 7;

const CARD_PALETTE = [
  "hsl(11deg 88% 58%)",
  "hsl(32deg 92% 56%)",
  "hsl(48deg 86% 52%)",
  "hsl(91deg 58% 44%)",
  "hsl(146deg 46% 40%)",
  "hsl(180deg 50% 38%)",
  "hsl(203deg 54% 50%)",
  "hsl(225deg 68% 52%)",
  "hsl(268deg 52% 56%)",
  "hsl(306deg 58% 50%)",
  "hsl(338deg 62% 52%)",
] as const;

// Molecule template id to canonical pathway order, used to colour the cards.
const MOLECULE_ORDER = new Map<string, number>(MOLECULES.map((m) => [m.id, m.order]));

const COFACTOR_ACCENT: Record<string, string> = {
  atp: "hsl(38deg 92% 52%)",
  adp: "hsl(28deg 78% 50%)",
  nad_plus: "hsl(180deg 50% 42%)",
  nadh: "hsl(268deg 52% 56%)",
};

// Display name for each molecule id, used for the tableau frontier label.
const MOLECULE_NAME = new Map<MoleculeId, string>(MOLECULES.map((m) => [m.id, m.name]));

//============================================
// Presentation state

type ViewPhase = "acting" | "handoff" | "over";

interface Feedback {
  tone: "neutral" | "legal" | "illegal";
  title: string;
  message: string;
}

let engine: EngineState = createGameState(freshSeed(), HAND_SIZE, 1, 0);
let viewPhase: ViewPhase = "acting";
let selectedCardIds: string[] = [];
let feedback: Feedback = {
  tone: "neutral",
  title: "Ready",
  message: "Choose to draw a card or play a legal meld.",
};

//============================================
// Helpers

function freshSeed(): number {
  // Browser-only entry point; a wall-clock seed keeps each game different.
  return Date.now() & 0x7fffffff || 1;
}

function playerIdForIndex(index: PlayerIndex): PlayerId {
  return index === 0 ? "player_one" : "player_two";
}

function playerName(index: PlayerIndex): string {
  return `Player ${index + 1}`;
}

function accentForCard(card: CardInstance): string {
  if (card.kind === "cofactor") {
    return COFACTOR_ACCENT[card.templateId] ?? CARD_PALETTE[0];
  }
  if (card.kind === "enzyme") {
    return "hsl(180deg 22% 46%)";
  }
  const order = MOLECULE_ORDER.get(card.templateId) ?? 1;
  return CARD_PALETTE[(order - 1) % CARD_PALETTE.length]!;
}

function toCardView(card: CardInstance): CardView {
  return {
    id: card.cardId,
    label: card.name,
    subtitle: card.shortName,
    accent: accentForCard(card),
    kind: card.kind,
  };
}

function toPlayerView(index: PlayerIndex): PlayerView {
  const player = engine.players[index];
  return {
    id: playerIdForIndex(index),
    name: playerName(index),
    score: player.score,
    hand: player.hand.map(toCardView),
  };
}

function toMeldViews(): MeldView[] {
  return engine.pathway.map((meld) => ({
    id: `meld-${meld.cardIds.join("-")}`,
    title: meld.reactionName,
    subtitle: `${playerName(meld.playedBy)} | +${meld.points} pts`,
    cards: meld.cards.map(toCardView),
  }));
}

function contractPhase(): GameState["phase"] {
  if (viewPhase === "handoff") {
    return "pass_screen";
  }
  if (viewPhase === "over") {
    return "round_over";
  }
  return "active_turn";
}

function buildPrompt(): string {
  const active = playerName(engine.activePlayer);
  if (viewPhase === "acting") {
    return `${active}: draw a card or play a legal meld.`;
  }
  if (viewPhase === "handoff") {
    return `Pass the device to ${active}.`;
  }
  if (engine.status === "stalemate") {
    return "Stalemate. Start the next round when ready.";
  }
  const winner = engine.winner === null ? null : playerName(engine.winner);
  return winner === null
    ? "The round is over. Start the next round."
    : `${winner} wins this round. Start the next round.`;
}

function toContractState(): GameState {
  const frontierLabel =
    engine.frontier === null ? null : (MOLECULE_NAME.get(engine.frontier) ?? engine.frontier);
  const roundOutcome =
    viewPhase === "over" ? (engine.status === "stalemate" ? "stalemate" : "won") : null;
  const roundWinner =
    viewPhase === "over" && engine.winner !== null ? playerName(engine.winner) : null;

  return {
    roundNumber: engine.roundNumber,
    roundLabel: `Round ${engine.roundNumber}`,
    turnNumber: engine.turnNumber,
    phase: contractPhase(),
    activePlayerId: playerIdForIndex(engine.activePlayer),
    players: [toPlayerView(0), toPlayerView(1)],
    drawPileCount: engine.drawPile.length,
    pathway: toMeldViews(),
    frontierLabel,
    selectedCardIds: selectedCardIds.slice(),
    feedbackTone: feedback.tone,
    feedbackTitle: feedback.title,
    feedbackMessage: feedback.message,
    prompt: buildPrompt(),
    roundWinner,
    roundOutcome,
  };
}

//============================================
// Action handlers

function endedTurnPhase(): void {
  // On a still-playing result the engine advanced the turn, so show the pass
  // screen. On a win or stalemate the engine leaves activePlayer as the last
  // actor and we go straight to the round-over view instead.
  viewPhase = engine.status === "playing" ? "handoff" : "over";
  selectedCardIds = [];
}

function onDraw(): void {
  if (viewPhase !== "acting") {
    return;
  }
  const result = drawCard(engine);
  if (!result.ok) {
    feedback = { tone: "illegal", title: "Cannot draw", message: result.message };
    return;
  }
  engine = result.state;
  feedback = { tone: "legal", title: "Card drawn", message: result.message };
  endedTurnPhase();
}

function onPlayMeld(): void {
  if (viewPhase !== "acting") {
    return;
  }
  if (selectedCardIds.length === 0) {
    feedback = {
      tone: "illegal",
      title: "No cards selected",
      message: "Select the cards that form one glycolysis reaction.",
    };
    return;
  }
  const result = playMeld(engine, selectedCardIds);
  if (!result.ok) {
    const detail = result.issues.length > 0 ? ` ${result.issues[0]}` : "";
    feedback = { tone: "illegal", title: "Illegal meld", message: `${result.message}${detail}` };
    return;
  }
  engine = result.state;
  feedback = { tone: "legal", title: "Meld played", message: result.message };
  endedTurnPhase();
}

function onSkip(): void {
  if (viewPhase !== "acting") {
    return;
  }
  const result = skipTurn(engine);
  if (!result.ok) {
    feedback = { tone: "illegal", title: "Cannot pass", message: result.message };
    return;
  }
  engine = result.state;
  feedback = { tone: "neutral", title: "Turn passed", message: result.message };
  endedTurnPhase();
}

function onToggleCard(cardId: string): void {
  if (viewPhase !== "acting") {
    return;
  }
  const activeHand = engine.players[engine.activePlayer].hand;
  if (!activeHand.some((card) => card.cardId === cardId)) {
    return;
  }
  if (selectedCardIds.includes(cardId)) {
    selectedCardIds = selectedCardIds.filter((id) => id !== cardId);
  } else {
    selectedCardIds = [...selectedCardIds, cardId];
  }
  feedback = {
    tone: "neutral",
    title: "Selection updated",
    message: `${selectedCardIds.length} card${selectedCardIds.length === 1 ? "" : "s"} selected.`,
  };
}

function startNextRound(): void {
  // On win or stalemate the engine never flipped activePlayer, so it still
  // points at the last actor; otherPlayer makes the other player deal-start
  // the next round.
  const nextStarting = otherPlayer(engine.activePlayer);
  const nextRoundNumber = engine.roundNumber + 1;
  engine = createGameState(freshSeed(), HAND_SIZE, nextRoundNumber, nextStarting);
  selectedCardIds = [];
  viewPhase = "acting";
  feedback = {
    tone: "neutral",
    title: `Round ${nextRoundNumber}`,
    message: "Fresh hands dealt. Draw or play a meld.",
  };
}

function onAdvance(): void {
  if (viewPhase === "handoff") {
    viewPhase = "acting";
    feedback = {
      tone: "neutral",
      title: `${playerName(engine.activePlayer)} is up`,
      message: "Draw a card or play a legal meld.",
    };
    return;
  }
  if (viewPhase === "over") {
    startNextRound();
  }
}

//============================================
// Bootstrap

// An optional ?seed=<n> query parameter makes the deal reproducible, which is
// useful for shareable games, deterministic tests, and documentation captures.
function seedFromLocation(): number | null {
  if (typeof location === "undefined") {
    return null;
  }
  const raw = new URLSearchParams(location.search).get("seed");
  if (raw === null) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function main(): void {
  const root = document.getElementById("app");
  if (root === null) {
    throw new Error("Missing #app root element.");
  }

  const seed = seedFromLocation();
  if (seed !== null) {
    engine = createGameState(seed, HAND_SIZE, 1, 0);
  }

  const rerender = (): void => {
    renderGame(root, toContractState());
  };

  attachGameEvents(root, {
    onDraw: () => {
      onDraw();
      rerender();
    },
    onToggleCard: (cardId: string) => {
      onToggleCard(cardId);
      rerender();
    },
    onPlayMeld: () => {
      onPlayMeld();
      rerender();
    },
    onSkip: () => {
      onSkip();
      rerender();
    },
    onAdvance: () => {
      onAdvance();
      rerender();
    },
  });

  rerender();
}

if (typeof document !== "undefined") {
  main();
}
