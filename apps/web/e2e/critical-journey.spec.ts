import { expect, test, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";
import type { EndSemesterResponse, ElectionResponse, GameView, QueuePreview } from "@decreto/shared-types";

async function seedNewGame(page: Page): Promise<void> {
  await page.route("**/api/games", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const request = route.request().postDataJSON() as Record<string, unknown>;
    await route.continue({ postData: JSON.stringify({ ...request, seed: 1 }) });
  });
}

async function startGame(page: Page): Promise<GameView> {
  await page.goto("/");
  await page.getByLabel("Nome do país").fill("Vessária E2E");
  await page.getByLabel("Nome do presidente").fill("Helena");
  await page.getByRole("button", { name: "Estável" }).click();
  const created = page.waitForResponse((response) => response.url().endsWith("/api/games") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Tomar posse" }).click();
  const response = await created;
  expect(response.status()).toBe(201);
  return response.json() as Promise<GameView>;
}

async function queuePolicy(page: Page, gameId: string): Promise<QueuePreview> {
  await page.locator(".radial g.node.available").first().click();
  await expect(page.locator(".col.side p.muted").first()).toContainText("Disponível");
  const shownCost = await page.locator(".panel.cost b").innerText();
  const previewed = page.waitForResponse((response) => response.url().endsWith(`/api/games/${gameId}/preview`) && response.request().method() === "POST");
  await page.getByRole("button", { name: /Adicionar ao turno/ }).click();
  const response = await previewed;
  expect(response.ok()).toBeTruthy();
  const preview = await response.json() as QueuePreview;
  expect(preview.errors).toEqual([]);
  expect(Number(shownCost)).toBe(preview.totalCost);
  await expect(page.locator(".queued-item")).toHaveCount(1);
  await expectQueuedCost(page, response, preview);
  await expect(page.getByText(`${preview.remaining} restante`)).toBeVisible();
  return preview;
}

async function expectQueuedCost(page: Page, response: APIResponse, preview: QueuePreview): Promise<void> {
  const request = response.request().postDataJSON() as { queue: string[] };
  const queuedId = request.queue[0];
  expect(queuedId).toBeTruthy();
  const queuedCost = preview.nodes[queuedId]?.cost;
  expect(queuedCost).not.toBeNull();
  await expect(page.locator(".queued-item")).toContainText(String(queuedCost));
}

async function closeFirstSemester(page: Page, gameId: string, expectedCost: number): Promise<EndSemesterResponse> {
  const closed = page.waitForResponse((response) => response.url().endsWith(`/api/games/${gameId}/end-semester`) && response.request().method() === "POST");
  await page.getByRole("button", { name: /Encerrar semestre/ }).click();
  const response = await closed;
  expect(response.ok()).toBeTruthy();
  const result = await response.json() as EndSemesterResponse;
  expect(result.report.applied).toHaveLength(1);
  expect(result.report.capitalBefore - expectedCost).toBeGreaterThanOrEqual(0);
  await expect(page.getByText("Semestre encerrado")).toBeVisible();
  await expect(page.getByText("1 ação aplicada")).toBeVisible();
  return result;
}

async function advanceToCampaign(request: APIRequestContext, game: GameView): Promise<GameView> {
  let current = game;
  for (let semester = 2; semester <= 7; semester += 1) {
    const response = await request.post(`/api/games/${current.id}/end-semester`, {
      data: { queue: [], expectedVersion: current.version },
    });
    expect(response.ok(), `semester ${semester}: ${await response.text()}`).toBeTruthy();
    const outcome = await response.json() as EndSemesterResponse;
    current = outcome.game;
    expect(current.phase, `semester ${semester} ended the game unexpectedly`).not.toBe("ended");
  }
  expect(current.phase).toBe("campaign");
  return current;
}

async function reviewEvents(page: Page, outcome: EndSemesterResponse, electionFollows = false): Promise<void> {
  expect(outcome.events.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: /Iniciar próximo semestre/ }).click();
  for (let index = 0; index < outcome.events.length; index += 1) {
    await expect(page.getByText(outcome.events[index]?.image ? "Evento marcante" : "Notícia do turno")).toBeVisible();
    await expect(page.locator(".event")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();
  }
  if (electionFollows) await expect(page.getByRole("heading", { name: "Escolha até 3 promessas" })).toBeVisible();
  else await expect(page.getByRole("button", { name: /Encerrar semestre/ })).toBeVisible();
}

async function selectCampaignAndPlay(page: Page, gameId: string): Promise<void> {
  await page.reload();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Escolha até 3 promessas" })).toBeVisible();
  await page.locator(".cards .card").first().click();
  const saved = page.waitForResponse((response) => response.url().endsWith(`/api/games/${gameId}/campaign`) && response.request().method() === "POST");
  await page.getByRole("button", { name: /Confirmar 1 promessa/ }).click();
  expect((await saved).ok()).toBeTruthy();
  const finalTurn = page.waitForResponse((response) => response.url().endsWith(`/api/games/${gameId}/end-semester`) && response.request().method() === "POST");
  await page.getByRole("button", { name: /Encerrar semestre/ }).click();
  const response = await finalTurn;
  expect(response.ok()).toBeTruthy();
  await reviewEvents(page, await response.json() as EndSemesterResponse, true);
}

async function voteAtElection(page: Page, gameId: string, expectedVersion: number): Promise<void> {
  await expect(page.getByRole("heading", { name: "Escolha até 3 promessas" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ir às urnas · 1 promessa" })).toBeVisible();
  const voted = page.waitForResponse((response) => response.url().endsWith(`/api/games/${gameId}/election`) && response.request().method() === "POST");
  await page.getByRole("button", { name: "Ir às urnas · 1 promessa" }).click();
  const response = await voted;
  expect(response.ok()).toBeTruthy();
  const election = await response.json() as ElectionResponse;
  expect(election.game.version).toBe(expectedVersion + 1);
  if (election.won) {
    await expect(page.getByRole("button", { name: /Encerrar semestre/ })).toBeVisible();
  } else {
    await expect(page.getByText(/Você perdeu a eleição/)).toBeVisible();
  }
}

test("new game, policy preview, semester summary, and election use the real API", async ({ page, request }) => {
  await seedNewGame(page);
  const created = await startGame(page);
  const preview = await queuePolicy(page, created.id);
  const first = await closeFirstSemester(page, created.id, preview.totalCost);
  await reviewEvents(page, first);
  const campaignGame = await advanceToCampaign(request, first.game);
  await selectCampaignAndPlay(page, campaignGame.id);
  const electionGame = await request.get(`/api/games/${created.id}`).then((response) => response.json() as Promise<GameView>);
  expect(electionGame.phase).toBe("election");
  await voteAtElection(page, created.id, electionGame.version);
});
