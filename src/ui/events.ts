import type { GameActions } from "./contracts";

interface ActionTarget extends HTMLElement {
  dataset: DOMStringMap;
}

function getActionTarget(target: EventTarget | null): ActionTarget | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const actionTarget = target.closest<ActionTarget>("[data-action]");
  return actionTarget;
}

export function attachGameEvents(root: HTMLElement, actions: GameActions): () => void {
  const onClick = (event: MouseEvent): void => {
    const actionTarget = getActionTarget(event.target);
    if (!actionTarget) {
      return;
    }

    const action = actionTarget.dataset.action;
    if (action === "draw") {
      actions.onDraw();
      return;
    }

    if (action === "toggle-card") {
      const cardId = actionTarget.dataset.cardId;
      if (cardId !== undefined) {
        actions.onToggleCard(cardId);
      }
      return;
    }

    if (action === "play-meld") {
      actions.onPlayMeld();
      return;
    }

    if (action === "skip") {
      actions.onSkip();
      return;
    }

    if (action === "advance") {
      actions.onAdvance();
    }
  };

  root.addEventListener("click", onClick);

  return (): void => {
    root.removeEventListener("click", onClick);
  };
}
