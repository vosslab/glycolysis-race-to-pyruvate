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
			GAPDH: "GAPDH",
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

function getCardFaceMeta(card: CardView): CardFaceMeta {
	return faceMetaForCard(card);
}

function renderCardFace(card: CardView, options: CardFaceOptions): string {
	const face = getCardFaceMeta(card);
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
	const cards = meld.cards.map((card) => renderCardFace(card, { variant: "compact", used: true })).join("");
	return `
		<div class="meld">
			<div class="meld__title">${escapeHtml(meld.title)}</div>
			<div class="meld__cards">${cards}</div>
		</div>
	`;
}

function renderPlayerPanel(state: GameState, player: PlayerView): string {
	const isActive = player.id === state.activePlayerId;
	const activeClass = isActive ? " player-panel--active" : "";
	const handSize = player.hand.length;
	const selectedCardSet = new Set(state.selectedCardIds);
	const handCards = isActive
		? player.hand.map((card) => renderCard(card, selectedCardSet.has(card.id))).join("")
		: `<div class="player-panel__hidden-hand">Hand hidden</div>`;
	const handSummary = isActive ? "Your hand" : "Face-down hand";

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
	const cards = selectedCards.length > 0
		? selectedCards.map((card) => renderCardFace(card, { variant: "compact", selected: true })).join("")
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
	const topCard = state.drawPileTop;
	const topCardMarkup = topCard === null
		? '<div class="pile__empty">No cards left</div>'
		: renderCardFace(topCard, { variant: "compact" });

	return `
		<section class="zone">
			<div class="zone__head">
				<h2>Draw pile</h2>
				<span class="pill">${state.drawPileCount}</span>
			</div>
			<button class="pile-button" type="button" data-action="draw" ${state.phase !== "active_turn" || state.drawPileCount === 0 ? "disabled" : ""}>
				${topCardMarkup}
			</button>
		</section>
	`;
}

function renderDiscardPile(state: GameState): string {
	const topCard = state.discardPile[state.discardPile.length - 1];
	const topCardMarkup = topCard === undefined
		? '<div class="pile__empty">Discard pile is empty</div>'
		: renderCardFace(topCard, { variant: "compact", used: true });

	return `
		<section class="zone">
			<div class="zone__head">
				<h2>Discard pile</h2>
				<span class="pill">${state.discardPile.length}</span>
			</div>
			<div class="pile-shell">
				${topCardMarkup}
			</div>
		</section>
	`;
}

function renderPathway(state: GameState): string {
	const melds = state.pathway.length > 0
		? state.pathway.map((meld) => renderMeld(meld)).join("")
		: '<div class="empty-state">Played pathway will appear here.</div>';

	return `
		<section class="zone zone--wide">
			<div class="zone__head">
				<h2>Played pathway</h2>
				<span class="pill">${state.pathway.length} meld${state.pathway.length === 1 ? "" : "s"}</span>
			</div>
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
	const canAct = state.phase === "active_turn";
	const canAdvance = state.phase === "pass_screen" || state.phase === "round_over";
	const drawTitle = canAct
		? "Draw one card from the draw pile."
		: "Draw is available only during an active turn.";
	const playTitle = canAct
		? "Play the selected cards as a legal glycolysis meld."
		: "Play melds only during an active turn.";
	const discardTitle = canAct
		? "Select one card, then discard it to end your turn."
		: "Discard is available only during an active turn.";
	const passTitle = canAct
		? "Hide the hand and hand the device to the other player."
		: "Pass screen is available only during an active turn.";
	const nextTurnLabel = state.phase === "round_over" ? "Start next round" : "Next turn";
	const nextTurnTitle = state.phase === "round_over"
		? "Reset the table and start a new round."
		: "Advance to the next player's turn.";
	const controlsHint = state.phase === "active_turn"
		? "Draw a card, build a legal meld, then discard one card."
		: state.phase === "pass_screen"
			? "Pass the device, then advance the turn."
			: "The round is over. Start the next round when ready.";
	return `
		<section class="controls">
			<div class="controls__hint">${escapeHtml(controlsHint)}</div>
			<div class="controls__group">
				${renderControlButton("Draw card", "draw", drawTitle, !canAct, "control-button control-button--primary")}
				${renderControlButton("Play meld", "play-meld", playTitle, !canAct, "control-button")}
				${renderControlButton("Discard", "discard", discardTitle, !canAct, "control-button")}
			</div>
			<div class="controls__group controls__group--secondary">
				${renderControlButton("Pass device", "pass-screen", passTitle, !canAct, "control-button")}
				${renderControlButton(nextTurnLabel, "next-turn", nextTurnTitle, !canAdvance, "control-button control-button--secondary")}
			</div>
		</section>
	`;
}

function renderPhaseBanner(state: GameState): string {
	if (state.phase === "active_turn") {
		return "";
	}

	const title = state.phase === "pass_screen" ? "Pass the device" : "Round over";
	const detail = state.phase === "pass_screen"
		? state.prompt
		: state.roundWinner === null
			? "The round is finished."
			: `${state.roundWinner} cleared the lane first.`;

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

			<section class="players-grid" aria-label="Players">
				${playerOnePanel}
				${playerTwoPanel}
			</section>

			<section class="board-grid">
				${renderDrawPile(state)}
				${renderDiscardPile(state)}
				${renderPathway(state)}
				${renderSelected(state)}
			</section>

			${renderFeedback(state)}
		</div>
	`;
}
