import { attachGameEvents } from "./ui/events";
import { renderGame } from "./ui/render";
import type { CardView, GameState, MeldView, PlayerId, PlayerView } from "./ui/contracts";

interface LocalGameState extends GameState {
  drawPile: CardView[];
}

interface LocalGameController {
  actions: {
    onDraw(): void;
    onToggleCard(cardId: string): void;
    onPlayMeld(): void;
    onDiscard(): void;
    onPassScreen(): void;
    onNextTurn(): void;
  };
}

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
] as const;

function createCard(id: string, label: string, subtitle: string, accentIndex: number): CardView {
  let kind: CardView["kind"] = "molecule";
  if (
    label === "ATP" ||
    label === "ADP" ||
    label === "NAD+" ||
    label === "NADH" ||
    label === "Pi"
  ) {
    kind = "cofactor";
  } else if (
    label === "Hexokinase" ||
    label === "Phosphoglucose isomerase" ||
    label === "PFK" ||
    label === "Aldolase" ||
    label === "GAPDH" ||
    label === "Phosphoglycerate mutase" ||
    label === "Enolase" ||
    label === "Lactate dehydrogenase" ||
    label === "Pyruvate kinase" ||
    label === "Triose phosphate isomerase" ||
    label === "Phosphoglycerate kinase" ||
    label === "Phosphofructokinase-1"
  ) {
    kind = "enzyme";
  }

  return {
    id,
    label,
    subtitle,
    accent: CARD_PALETTE[accentIndex % CARD_PALETTE.length]!,
    kind,
  };
}

function cloneCards(cards: CardView[]): CardView[] {
  return cards.slice();
}

function createMeld(title: string, cards: CardView[]): MeldView {
  return {
    id: `meld-${cards.map((card) => card.id).join("-")}`,
    title,
    cards: cloneCards(cards),
  };
}

interface RoundSetup {
  playerOneHand: CardView[];
  playerTwoHand: CardView[];
  drawPile: CardView[];
}

function createRoundSetup(startingPlayerIsPlayerOne: boolean): RoundSetup {
  const playerOneHand = [
    createCard("p1-glc", "Glucose", "Opening substrate", 0),
    createCard("p1-atp", "ATP", "Energy carrier", 1),
    createCard("p1-hk", "Hexokinase", "Kinase", 2),
    createCard("p1-g6p", "Glucose-6-phosphate", "Intermediate", 3),
    createCard("p1-pfk", "PFK", "Commitment step", 4),
  ];
  const playerTwoHand = [
    createCard("p2-gap", "GAP", "Triose", 5),
    createCard("p2-nad", "NAD+", "Cofactor", 6),
    createCard("p2-gapdh", "GAPDH", "Oxidoreductase", 7),
    createCard("p2-bpg", "1,3-BPG", "High-energy intermediate", 8),
    createCard("p2-pyk", "Pyruvate kinase", "Finish line", 9),
  ];
  const drawPile = [
    createCard("draw-adp", "ADP", "Energy carrier", 1),
    createCard("draw-pi", "Pi", "Phosphate", 2),
    createCard("draw-f6p", "Fructose-6-phosphate", "Intermediate", 3),
    createCard("draw-eno", "Enolase", "Dehydration", 4),
    createCard("draw-pyr", "Pyruvate", "End product", 5),
    createCard("draw-nadh", "NADH", "Reduced cofactor", 6),
    createCard("draw-ldh", "Lactate dehydrogenase", "Alternative route", 7),
    createCard("draw-pgm", "Phosphoglycerate mutase", "Rearranger", 8),
    createCard("draw-bis", "Fructose-1,6-bisphosphate", "Splitter", 9),
  ];

  return startingPlayerIsPlayerOne
    ? { playerOneHand, playerTwoHand, drawPile }
    : { playerOneHand: playerTwoHand, playerTwoHand: playerOneHand, drawPile };
}

function makePlayer(id: PlayerId, name: string, score: number, hand: CardView[]): PlayerView {
  return {
    id,
    name,
    score,
    hand: cloneCards(hand),
  };
}

function getActivePlayerIndex(state: LocalGameState): number {
  return state.players[0].id === state.activePlayerId ? 0 : 1;
}

function getActivePlayer(state: LocalGameState): PlayerView {
  return state.players[getActivePlayerIndex(state)]!;
}

function getInactivePlayerId(state: LocalGameState): PlayerId {
  return state.activePlayerId === "player_one" ? "player_two" : "player_one";
}

function getInactivePlayer(state: LocalGameState): PlayerView {
  const inactivePlayerId = getInactivePlayerId(state);
  return state.players[inactivePlayerId === "player_one" ? 0 : 1];
}

function setFeedback(
  state: LocalGameState,
  tone: GameState["feedbackTone"],
  title: string,
  message: string,
): void {
  state.feedbackTone = tone;
  state.feedbackTitle = title;
  state.feedbackMessage = message;
}

function setActivePrompt(state: LocalGameState): void {
  const activePlayer = getActivePlayer(state);
  state.prompt = `${activePlayer.name}: draw, build a meld, discard, then pass the device.`;
}

function recomputeDrawState(state: LocalGameState): void {
  state.drawPileCount = state.drawPile.length;
  state.drawPileTop = state.drawPile.length > 0 ? state.drawPile[state.drawPile.length - 1]! : null;
}

function maybeEndRound(state: LocalGameState): void {
  const activePlayer = getActivePlayer(state);
  if (activePlayer.hand.length > 0) {
    return;
  }

  state.phase = "round_over";
  state.roundWinner = activePlayer.name;
  setFeedback(state, "legal", "Round complete", `${activePlayer.name} emptied their hand.`);
  state.prompt = "The round is over. Start the next round to continue.";
}

function refreshAfterVisibleAction(state: LocalGameState): void {
  recomputeDrawState(state);
  setActivePrompt(state);
  maybeEndRound(state);
}

export function toggleSelectedCard(state: LocalGameState, cardId: string): void {
  const activePlayer = getActivePlayer(state);
  const cardExists = activePlayer.hand.some((card) => card.id === cardId);
  if (!cardExists || state.phase !== "active_turn") {
    setFeedback(
      state,
      "illegal",
      "Illegal selection",
      "Only the active player can select cards during an active turn.",
    );
    return;
  }

  if (state.selectedCardIds.includes(cardId)) {
    state.selectedCardIds = state.selectedCardIds.filter((selectedId) => selectedId !== cardId);
    setFeedback(state, "neutral", "Selection updated", "Card removed from the selection.");
    return;
  }

  state.selectedCardIds = [...state.selectedCardIds, cardId];
  setFeedback(state, "neutral", "Selection updated", "Card added to the selection.");
}

export function drawCard(state: LocalGameState): void {
  if (state.phase !== "active_turn") {
    setFeedback(state, "illegal", "Draw blocked", "Draw cards only during an active turn.");
    return;
  }

  const drawnCard = state.drawPile.pop();
  if (drawnCard === undefined) {
    setFeedback(state, "illegal", "Draw pile empty", "No draw cards remain.");
    refreshAfterVisibleAction(state);
    return;
  }

  const activePlayer = getActivePlayer(state);
  activePlayer.hand = [...activePlayer.hand, drawnCard];
  setFeedback(state, "legal", "Card drawn", `Added ${drawnCard.label} to ${activePlayer.name}.`);
  state.selectedCardIds = [];
  refreshAfterVisibleAction(state);
}

export function playMeld(state: LocalGameState): void {
  if (state.phase !== "active_turn") {
    setFeedback(state, "illegal", "Play blocked", "Melds can only be played on an active turn.");
    return;
  }

  if (state.selectedCardIds.length < 2) {
    setFeedback(
      state,
      "illegal",
      "Illegal meld",
      "Select at least two cards before playing a meld.",
    );
    return;
  }

  const activePlayer = getActivePlayer(state);
  const selectedCards = activePlayer.hand.filter((card) => state.selectedCardIds.includes(card.id));
  activePlayer.hand = activePlayer.hand.filter((card) => !state.selectedCardIds.includes(card.id));
  state.pathway = [...state.pathway, createMeld(`Meld ${state.pathway.length + 1}`, selectedCards)];
  activePlayer.score += selectedCards.length * 2;
  state.selectedCardIds = [];
  setFeedback(
    state,
    "legal",
    "Meld played",
    `${selectedCards.length} card${selectedCards.length === 1 ? "" : "s"} moved into the pathway.`,
  );
  refreshAfterVisibleAction(state);
}

export function discardCard(state: LocalGameState): void {
  if (state.phase !== "active_turn") {
    setFeedback(state, "illegal", "Discard blocked", "Discard cards only during an active turn.");
    return;
  }

  if (state.selectedCardIds.length !== 1) {
    setFeedback(state, "illegal", "Illegal discard", "Select exactly one card before discarding.");
    return;
  }

  const activePlayer = getActivePlayer(state);
  const discardCardId = state.selectedCardIds[0];
  const discardIndex = activePlayer.hand.findIndex((card) => card.id === discardCardId);
  if (discardIndex < 0) {
    setFeedback(state, "illegal", "Discard blocked", "The selected card is no longer in hand.");
    return;
  }

  const discardedCard = activePlayer.hand[discardIndex]!;
  activePlayer.hand.splice(discardIndex, 1);
  state.discardPile = [...state.discardPile, discardedCard];
  activePlayer.score += 1;
  state.selectedCardIds = [];
  setFeedback(
    state,
    "legal",
    "Card discarded",
    `${discardedCard.label} moved to the discard pile.`,
  );

  if (activePlayer.hand.length === 0) {
    maybeEndRound(state);
    return;
  }

  state.phase = "pass_screen";
  state.prompt = `Pass the device to ${getInactivePlayer(state).name}.`;
  recomputeDrawState(state);
}

export function passScreen(state: LocalGameState): void {
  if (state.phase !== "active_turn") {
    setFeedback(
      state,
      "illegal",
      "Pass screen blocked",
      "Pass screen is available from an active turn.",
    );
    return;
  }

  state.phase = "pass_screen";
  state.selectedCardIds = [];
  const inactivePlayer = getInactivePlayer(state);
  setFeedback(state, "neutral", "Pass screen", `Hand the device to ${inactivePlayer.name}.`);
  state.prompt = `Hand the device to ${inactivePlayer.name}.`;
}

export function startNextTurn(state: LocalGameState): void {
  if (state.phase === "round_over") {
    const nextStartingPlayerId = getInactivePlayerId(state);
    const startingPlayerOne = nextStartingPlayerId === "player_one";
    const setup = createRoundSetup(startingPlayerOne);

    state.players = [
      makePlayer("player_one", "Player 1", state.players[0].score, setup.playerOneHand),
      makePlayer("player_two", "Player 2", state.players[1].score, setup.playerTwoHand),
    ];
    state.activePlayerId = nextStartingPlayerId;
    state.drawPile = setup.drawPile;
    state.discardPile = [];
    state.pathway = [];
    state.selectedCardIds = [];
    state.phase = "active_turn";
    state.roundWinner = null;
    state.turnNumber = 1;
    state.roundNumber += 1;
    state.roundLabel = `Round ${state.roundNumber}`;
    setFeedback(state, "neutral", "Round reset", "The next round is ready.");
    refreshAfterVisibleAction(state);
    return;
  }

  if (state.phase !== "pass_screen") {
    setFeedback(
      state,
      "illegal",
      "Next turn blocked",
      "Move to the pass screen before advancing the turn.",
    );
    return;
  }

  state.activePlayerId = getInactivePlayerId(state);
  state.phase = "active_turn";
  state.selectedCardIds = [];
  state.turnNumber += 1;
  setFeedback(state, "neutral", "Next turn", `${getActivePlayer(state).name} is now active.`);
  setActivePrompt(state);
  recomputeDrawState(state);
}

export function createInitialState(): LocalGameState {
  const setup = createRoundSetup(true);

  const state: LocalGameState = {
    roundNumber: 1,
    roundLabel: "Round 1",
    turnNumber: 1,
    phase: "active_turn",
    activePlayerId: "player_one",
    players: [
      makePlayer("player_one", "Player 1", 0, setup.playerOneHand),
      makePlayer("player_two", "Player 2", 0, setup.playerTwoHand),
    ],
    drawPile: setup.drawPile,
    drawPileCount: setup.drawPile.length,
    drawPileTop: setup.drawPile[setup.drawPile.length - 1] ?? null,
    discardPile: [createCard("discard-atp", "ATP", "Starter discard", 1)],
    pathway: [
      createMeld("Opening run", [
        createCard("run-glc", "Glucose", "Start", 0),
        createCard("run-g6p", "Glucose-6-phosphate", "Intermediate", 3),
      ]),
    ],
    selectedCardIds: [],
    feedbackTone: "neutral",
    feedbackTitle: "Ready",
    feedbackMessage: "Select cards from the active player's hand.",
    prompt: "Draw, build a meld, discard, and pass the device.",
    roundWinner: null,
  };

  return state;
}

function createLocalGameController(
  state: LocalGameState,
  rerender: () => void,
): LocalGameController {
  const onDraw = (): void => {
    drawCard(state);
    rerender();
  };

  const onToggleCard = (cardId: string): void => {
    toggleSelectedCard(state, cardId);
    rerender();
  };

  const onPlayMeld = (): void => {
    playMeld(state);
    rerender();
  };

  const onDiscard = (): void => {
    discardCard(state);
    rerender();
  };

  const onPassScreen = (): void => {
    passScreen(state);
    rerender();
  };

  const onNextTurn = (): void => {
    startNextTurn(state);
    rerender();
  };

  return {
    actions: {
      onDraw,
      onToggleCard,
      onPlayMeld,
      onDiscard,
      onPassScreen,
      onNextTurn,
    },
  };
}

function main(): void {
  const root = document.getElementById("app");
  if (root === null) {
    throw new Error("Missing #app root element.");
  }

  const state = createInitialState();
  const rerender = (): void => {
    renderGame(root, state);
  };
  const controller = createLocalGameController(state, rerender);

  attachGameEvents(root, controller.actions);
  rerender();
}

if (typeof document !== "undefined") {
  main();
}
