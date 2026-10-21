import type {
  CampaignResponse, CreateGameRequest, ElectionPreviewResponse, ElectionResponse,
  EndSemesterResponse, GameView, QueuePreview,
} from "@decreto/shared-types";

export class ApiError extends Error {
  constructor(readonly code: string, readonly status: number) {
    super(`Game API returned ${code} (${status})`);
  }
}

async function request<T>(path: string, method = "GET", body?: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method, headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("network_error", 0);
  }
  if (!response.ok) {
    const error: unknown = await response.json().catch(() => null);
    const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code : "internal_error";
    throw new ApiError(code, response.status);
  }
  return response.json() as Promise<T>;
}

export const gameApi = {
  create: (body: CreateGameRequest) => request<GameView>("/games", "POST", body),
  get: (id: string) => request<GameView>(`/games/${encodeURIComponent(id)}`),
  preview: (id: string, queue: string[]) => request<QueuePreview>(`/games/${encodeURIComponent(id)}/preview`, "POST", { queue }),
  endSemester: (game: GameView, queue: string[]) => request<EndSemesterResponse>(`/games/${encodeURIComponent(game.id)}/end-semester`, "POST", { queue, expectedVersion: game.version }),
  campaign: (id: string) => request<CampaignResponse>(`/games/${encodeURIComponent(id)}/campaign`),
  submitCampaign: (game: GameView, promises: string[]) => request<ElectionResponse>(`/games/${encodeURIComponent(game.id)}/campaign`, "POST", { promises, expectedVersion: game.version }),
  electionPreview: (id: string, promises: string[]) => request<ElectionPreviewResponse>(`/games/${encodeURIComponent(id)}/election/preview`, "POST", { promises }),
  vote: (game: GameView, promises: string[]) => request<ElectionResponse>(`/games/${encodeURIComponent(game.id)}/election`, "POST", { promises, expectedVersion: game.version }),
};
