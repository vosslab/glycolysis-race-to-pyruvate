import type { CardView, GameState, MeldView, PlayerId, PlayerView } from "./contracts";

type CardFaceRole = "molecule" | "enzyme" | "cofactor";

interface CardFaceOptions {
  variant: "full" | "compact";
  interactive?: boolean;
  action?: string;
  cardId?: string;
  selected?: boolean;
  used?: boolean;
  disabled?: boolean;
  pressed?: boolean;
}

interface CardFaceMeta {
  role: CardFaceRole;
  rank: string;
  suit: string;
  roleLabel: string;
}

function faceMetaForCard(card: CardView): CardFaceMeta {
  if (card.kind === "molecule") {
    const ranks: Record<string, string> = {
      Glucose: "GLC",
      "Glucose-6-phosphate": "G6P",
      "Fructose-6-phosphate": "F6P",
      "Fructose-1,6-bisphosphate": "F1,6BP",
      "Dihydroxyacetone phosphate": "DHAP",
      "Glyceraldehyde-3-phosphate": "GAP",
      "1,3-bisphosphoglycerate": "1,3-BPG",
      "3-phosphoglycerate": "3PG",
      "2-phosphoglycerate": "2PG",
      Phosphoenolpyruvate: "PEP",
      Pyruvate: "PYR",
    };

    return {
      role: "molecule",
      rank: ranks[card.label] ?? "SUB",
      suit: "&#9670;",
      roleLabel: "metabolite",
    };
  }

  if (card.kind === "enzyme") {
    const ranks: Record<string, string> = {
      Hexokinase: "HK",
      "Phosphoglucose isomerase": "PGI",
      "Phosphofructokinase-1": "PFK-1",
      Aldolase: "ALD",
      "Triose phosphate isomerase": "TPI",
      // Both the short and full enzyme names map to GAPDH so the abbreviation
      // resolves whether a card carries the mock short name or the data name.
      GAPDH: "GAPDH",
      "Glyceraldehyde-3-phosphate dehydrogenase": "GAPDH",
      "Phosphoglycerate kinase": "PGK",
      "Phosphoglycerate mutase": "PGM",
      Enolase: "ENO",
      "Pyruvate kinase": "PK",
      "Lactate dehydrogenase": "LDH",
    };

    return {
      role: "enzyme",
      rank: ranks[card.label] ?? "CAT",
      suit: "&#9881;",
      roleLabel: "enzyme",
    };
  }

  return {
    role: "cofactor",
    rank: card.label,
    suit: "&#9675;",
    roleLabel: "cofactor",
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPlayer(state: GameState, playerId: PlayerId): PlayerView {
  const player = playerId === "player_one" ? state.players[0] : state.players[1];
  if (player.id !== playerId) {
    throw new Error("Game state players are out of order.");
  }
  return player;
}

function renderCardFace(card: CardView, options: CardFaceOptions): string {
  const face = faceMetaForCard(card);
  const classes = [`card`, `card--${options.variant}`, `card--${face.role}`];
  if (options.selected) {
    classes.push("card--selected");
  }
  if (options.used) {
    classes.push("card--used");
  }

  const tagName = options.interactive ? "button" : "span";
  const attributes: string[] = [];
  if (options.interactive) {
    attributes.push('type="button"');
    if (options.action !== undefined) {
      attributes.push(`data-action="${escapeHtml(options.action)}"`);
    }
    if (options.cardId !== undefined) {
      attributes.push(`data-card-id="${escapeHtml(options.cardId)}"`);
    }
    attributes.push(`aria-pressed="${options.pressed === true ? "true" : "false"}"`);
    if (options.disabled === true) {
      attributes.push("disabled");
    }
  }

  const rank = escapeHtml(face.rank);
  const label = escapeHtml(card.label);
  const subtitle = escapeHtml(card.subtitle);

  return `
		<${tagName}
			class="${classes.join(" ")}"
			style="--card-accent:${escapeHtml(card.accent)}"
			${options.interactive ? `aria-label="${label}. ${subtitle}."` : ""}
			${attributes.join("\n\t\t\t")}
		>
			<span class="card__face" data-role="${face.role}">
				<span class="card__corner card__corner--top-left">
					<span class="card__rank">${rank}</span>
					<span class="card__suit" aria-hidden="true">${face.suit}</span>
				</span>
				<span class="card__body">
					<span class="card__mark" aria-hidden="true">${face.suit}</span>
					<span class="card__name">${label}</span>
					<span class="card__subtitle">${subtitle}</span>
					<span class="card__role">${escapeHtml(face.roleLabel)}</span>
				</span>
				<span class="card__corner card__corner--bottom-right" aria-hidden="true">
					<span class="card__rank">${rank}</span>
					<span class="card__suit">${face.suit}</span>
				</span>
			</span>
		</${tagName}>
	`;
}

function renderCard(card: CardView, selected: boolean): string {
  return renderCardFace(card, {
    variant: "full",
    interactive: true,
    action: "toggle-card",
    cardId: card.id,
    selected,
    pressed: selected,
  });
}

function renderMeld(meld: MeldView): string {
  const cards = meld.cards
    .map((card) => renderCardFace(card, { variant: "compact", used: true }))
    .join("");
  return `
		<div class="meld">
			<div class="meld__title">${escapeHtml(meld.title)}</div>
			<div class="meld__subtitle">${escapeHtml(meld.subtitle)}</div>
			<div class="meld__cards">${cards}</div>
		</div>
	`;
}

function renderPlayerPanel(state: GameState, player: PlayerView): string {
  const isActive = player.id === state.activePlayerId;
  const activeClass = isActive ? " player-panel--active" : "";
  const handSize = player.hand.length;
  const selectedCardSet = new Set(state.selectedCardIds);
  // Reveal a hand only on a live active turn. During the pass screen and round
  // end both hands stay hidden so the hot-seat handoff never leaks cards.
  const showHand = isActive && state.phase === "active_turn";
  const handCards = showHand
    ? player.hand.map((card) => renderCard(card, selectedCardSet.has(card.id))).join("")
    : `<div class="player-panel__hidden-hand">Hand hidden</div>`;
  const handSummary = showHand ? "Your hand" : "Face-down hand";

  return `
		<article class="player-panel${activeClass}">
			<div class="player-panel__header">
				<div>
					<div class="player-panel__name">${escapeHtml(player.name)}</div>
					<div class="player-panel__summary">${escapeHtml(handSummary)}</div>
				</div>
				<div class="player-panel__score">
					<span class="player-panel__score-label">Score</span>
					<span class="player-panel__score-value">${player.score}</span>
				</div>
			</div>
			<div class="player-panel__meta">
				<span class="pill">${handSize} card${handSize === 1 ? "" : "s"}</span>
				${isActive ? '<span class="pill pill--active">Active</span>' : '<span class="pill">Waiting</span>'}
			</div>
			<div class="player-panel__hand">
				${handCards}
			</div>
		</article>
	`;
}

function renderSelected(state: GameState): string {
  const activePlayer = getPlayer(state, state.activePlayerId);
  const selectedCards = activePlayer.hand.filter((card) => state.selectedCardIds.includes(card.id));
  const cards =
    selectedCards.length > 0
      ? selectedCards
          .map((card) => renderCardFace(card, { variant: "compact", selected: true }))
          .join("")
      : '<span class="muted">No cards selected.</span>';

  return `
		<section class="zone">
			<div class="zone__head">
				<h2>Selected cards</h2>
				<span class="pill">${selectedCards.length}</span>
			</div>
			<div class="chip-row">
				${cards}
			</div>
		</section>
	`;
}

function renderDrawPile(state: GameState): string {
  const canDraw = state.phase === "active_turn" && state.drawPileCount > 0;
  const faceMarkup =
    state.drawPileCount > 0
      ? '<div class="pile__back" aria-hidden="true"></div>'
      : '<div class="pile__empty">No cards left</div>';

  return `
		<section class="zone">
			<div class="zone__head">
				<h2>Draw pile</h2>
				<span class="pill">${state.drawPileCount}</span>
			</div>
			<button class="pile-button" type="button" data-action="draw" ${canDraw ? "" : "disabled"}>
				${faceMarkup}
			</button>
		</section>
	`;
}

function renderPathway(state: GameState): string {
  const melds =
    state.pathway.length > 0
      ? state.pathway.map((meld) => renderMeld(meld)).join("")
      : '<div class="empty-state">Play Glucose + Hexokinase to start the pathway.</div>';
  const frontier =
    state.frontierLabel === null
      ? "Pathway start"
      : `Next step builds from ${escapeHtml(state.frontierLabel)}`;

  return `
		<section class="zone zone--wide">
			<div class="zone__head">
				<h2>Shared glycolysis pathway</h2>
				<span class="pill">${state.pathway.length} meld${state.pathway.length === 1 ? "" : "s"}</span>
			</div>
			<div class="pathway__frontier">${frontier}</div>
			<div class="meld-stack">
				${melds}
			</div>
		</section>
	`;
}

function renderFeedback(state: GameState): string {
  const toneClass = `feedback--${state.feedbackTone}`;
  return `
		<section class="feedback ${toneClass}" aria-live="polite">
			<div class="feedback__title">${escapeHtml(state.feedbackTitle)}</div>
			<div class="feedback__message">${escapeHtml(state.feedbackMessage)}</div>
		</section>
	`;
}

function renderControlButton(
  label: string,
  action: string,
  title: string,
  disabled: boolean,
  className: string,
): string {
  return `
		<button
			class="${className}"
			type="button"
			data-action="${escapeHtml(action)}"
			title="${escapeHtml(title)}"
			${disabled ? "disabled" : ""}
		>
			${escapeHtml(label)}
		</button>
	`;
}

function renderControls(state: GameState): string {
  // Pass screen: a single reveal button hands the device to the next player.
  if (state.phase === "pass_screen") {
    return `
		<section class="controls">
			<div class="controls__hint">Pass the device, then reveal the next hand.</div>
			<div class="controls__group controls__group--secondary">
				${renderControlButton("Reveal hand", "advance", "Reveal the next player's hand.", false, "control-button control-button--secondary")}
			</div>
		</section>
	`;
  }

  // Round over: start the next round.
  if (state.phase === "round_over") {
    return `
		<section class="controls">
			<div class="controls__hint">The round is over. Start the next round when ready.</div>
			<div class="controls__group controls__group--secondary">
				${renderControlButton("Start next round", "advance", "Reset the tableau and start a new round.", false, "control-button control-button--secondary")}
			</div>
		</section>
	`;
  }

  // Active turn: draw exactly one card OR play one legal meld. A forced pass
  // appears only when the draw pile is empty.
  const drawEmpty = state.drawPileCount === 0;
  const drawTitle = drawEmpty
    ? "The draw pile is empty. Play a meld or pass."
    : "Draw one card. This ends your turn.";
  const playTitle = "Play the selected cards as a legal glycolysis meld. This ends your turn.";
  const skipTitle = "No legal move. Pass the turn to the other player.";
  const skipButton = drawEmpty
    ? renderControlButton("Pass turn", "skip", skipTitle, false, "control-button")
    : "";

  return `
		<section class="controls">
			<div class="controls__hint">Choose one action: draw a card, or play a legal meld.</div>
			<div class="controls__group">
				${renderControlButton("Draw card", "draw", drawTitle, drawEmpty, "control-button control-button--primary")}
				${renderControlButton("Play meld", "play-meld", playTitle, false, "control-button")}
				${skipButton}
			</div>
		</section>
	`;
}

function renderPhaseBanner(state: GameState): string {
  if (state.phase === "active_turn") {
    return "";
  }

  let title: string;
  let detail: string;
  if (state.phase === "pass_screen") {
    title = "Pass the device";
    detail = state.prompt;
  } else if (state.roundOutcome === "stalemate") {
    title = "Stalemate";
    detail = "The draw pile is empty and neither player can extend the pathway.";
  } else {
    title = "Round over";
    detail =
      state.roundWinner === null
        ? "The round is finished."
        : `${state.roundWinner} emptied their hand first.`;
  }

  return `
		<section class="phase-banner phase-banner--${state.phase}">
			<div>
				<div class="phase-banner__title">${escapeHtml(title)}</div>
				<div class="phase-banner__detail">${escapeHtml(detail)}</div>
			</div>
			<div class="phase-banner__meta">${escapeHtml(state.roundLabel)}</div>
		</section>
	`;
}

export function renderGame(root: HTMLElement, state: GameState): void {
  const activePlayer = getPlayer(state, state.activePlayerId);
  const playerOnePanel = renderPlayerPanel(state, state.players[0]);
  const playerTwoPanel = renderPlayerPanel(state, state.players[1]);
  const phaseBanner = renderPhaseBanner(state);

  root.innerHTML = `
		<div class="app-shell" data-phase="${escapeHtml(state.phase)}">
			<header class="topbar">
				<div class="topbar__copy">
					<div class="eyebrow">Shared-browser hot-seat</div>
					<h1>Glycolysis race to pyruvate</h1>
					<p class="lede">${escapeHtml(state.prompt)}</p>
				</div>
				<div class="topbar__turn">
					<div class="turn-label">${escapeHtml(state.roundLabel)}</div>
					<div class="turn-value">Turn ${state.turnNumber}</div>
					<div class="turn-meta">${escapeHtml(activePlayer.name)} is active</div>
				</div>
			</header>

			${phaseBanner}

			${renderControls(state)}

			<div class="main-grid">
				<section class="players-grid" aria-label="Players">
					${playerOnePanel}
					${playerTwoPanel}
				</section>

				<section class="board-grid">
					${renderDrawPile(state)}
					${renderPathway(state)}
					${renderSelected(state)}
				</section>
			</div>

			${renderFeedback(state)}
		</div>
	`;
}
