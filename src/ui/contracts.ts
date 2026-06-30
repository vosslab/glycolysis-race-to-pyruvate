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
  subtitle: string;
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
  // The single shared glycolysis tableau both players extend.
  pathway: MeldView[];
  // Label of the current frontier product, or null when the tableau is empty.
  frontierLabel: string | null;
  selectedCardIds: string[];
  feedbackTone: FeedbackTone;
  feedbackTitle: string;
  feedbackMessage: string;
  prompt: string;
  // Winner name on a win, null on a stalemate (only meaningful when round_over).
  roundWinner: string | null;
  roundOutcome: "won" | "stalemate" | null;
}

export interface GameActions {
  onDraw(): void;
  onToggleCard(cardId: string): void;
  onPlayMeld(): void;
  // Forced pass, available only when the draw pile is empty.
  onSkip(): void;
  // Pass-screen reveal, and start-next-round when the round is over.
  onAdvance(): void;
}
