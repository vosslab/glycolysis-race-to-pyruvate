import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

import { chromium } from "playwright";

import { REPO_ROOT } from "./repo_root.mjs";

const DIST_DIR = join(REPO_ROOT, "dist");
const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".mjs", "text/javascript; charset=utf-8"],
]);

function contentTypeFor(pathname) {
  return MIME_TYPES.get(extname(pathname)) ?? "application/octet-stream";
}

async function readDistAsset(pathname) {
  const resolvedPath = resolve(DIST_DIR, "." + pathname);
  if (!resolvedPath.startsWith(DIST_DIR)) {
    return null;
  }

  const assetStat = await stat(resolvedPath).catch(() => null);
  if (assetStat === null || !assetStat.isFile()) {
    return null;
  }

  return {
    body: await readFile(resolvedPath),
    contentType: contentTypeFor(resolvedPath),
  };
}

async function startServer() {
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const asset = await readDistAsset(pathname);

    if (asset === null) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    response.statusCode = 200;
    response.setHeader("content-type", asset.contentType);
    response.end(asset.body);
  });

  await new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", resolveServer);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The Playwright smoke server did not bind to a TCP port.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}/`,
    server,
  };
}

async function assertVisible(page, selector, label) {
  assert.equal(await page.locator(selector).isVisible(), true, label);
}

async function assertText(page, selector, expected) {
  const text = await page.locator(selector).textContent();
  assert.notEqual(text, null);
  assert.equal(text.trim(), expected);
}

async function main() {
  const { baseUrl, server } = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(baseUrl);

    await assertVisible(page, "h1", "page heading should be visible");
    await assertText(page, ".turn-label", "Round 1");
    await assertText(page, ".turn-meta", "Player 1 is active");

    for (const name of ["Draw card", "Play meld", "Discard", "Pass device", "Next turn"]) {
      await assertVisible(page, `button:has-text("${name}")`, `${name} should be visible`);
    }

    await assertText(
      page,
      ".controls__hint",
      "Draw a card, build a legal meld, then discard one card.",
    );
    await assertVisible(
      page,
      'button[title="Draw one card from the draw pile."]',
      "Draw tooltip should be present",
    );

    const playerTwoPanel = page.locator(".player-panel").filter({ hasText: "Player 2" });
    assert.equal(await playerTwoPanel.getByText("Hand hidden").isVisible(), true);
    assert.equal(await playerTwoPanel.locator(".card").count(), 0);

    await page.locator(".player-panel--active .card").first().click();
    await page.getByRole("button", { name: "Play meld" }).click();

    const feedbackClass = await page.locator(".feedback").getAttribute("class");
    assert.notEqual(feedbackClass, null);
    assert.match(feedbackClass, /feedback--illegal/);
    await assertText(page, ".feedback__title", "Illegal meld");
    await assertText(
      page,
      ".feedback__message",
      "Select at least two cards before playing a meld.",
    );
  } finally {
    await page.close();
    await browser.close();
    await new Promise((resolveServer) => {
      server.close(resolveServer);
    });
  }
}

await main();
