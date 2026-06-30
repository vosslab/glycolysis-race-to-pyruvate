export type PlayerId = "player_one" | "player_two";

export type GamePhase = "active_turn" | "pass_screen" | "round_over";

export type FeedbackTone = "neutral" | "legal" | "illegal";

export interface CardView {
  id: string;
  label: string;
  subtitle: string;
  accent: string;
  kind: "molecule" | "enzyme" | "cofactor";
}

export interface MeldView {
  id: string;
  title: string;
  cards: CardView[];
}

export interface PlayerView {
  id: PlayerId;
  name: string;
  score: number;
  hand: CardView[];
}

export interface GameState {
  roundNumber: number;
  roundLabel: string;
  turnNumber: number;
  phase: GamePhase;
  activePlayerId: PlayerId;
  players: [PlayerView, PlayerView];
  drawPileCount: number;
  drawPileTop: CardView | null;
  discardPile: CardView[];
  pathway: MeldView[];
  selectedCardIds: string[];
  feedbackTone: FeedbackTone;
  feedbackTitle: string;
  feedbackMessage: string;
  prompt: string;
  roundWinner: string | null;
}

export interface GameActions {
  onDraw(): void;
  onToggleCard(cardId: string): void;
  onPlayMeld(): void;
  onDiscard(): void;
  onPassScreen(): void;
  onNextTurn(): void;
}
