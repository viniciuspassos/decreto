import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  CreateGameRequest, ElectionResponse, EndSemesterResponse, GameView,
} from "@decreto/shared-types";
import { ApiError, gameApi } from "./client.js";
import { playableGame, type PlayableGame } from "./gameView.js";
import { clearGameId, loadGameId, storeGameId } from "./save.js";

type ApiOperation = <T>(operation: () => Promise<T>) => Promise<T | null>;

export function useGame() {
  const [game, setGame] = useState<PlayableGame | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveId, setSaveId] = useState(loadGameId);
  const [initialSaveId] = useState(loadGameId);

  useEffect(() => {
    if (!initialSaveId) return;
    let active = true;
    gameApi.get(initialSaveId).then((loaded) => {
      if (active && loadGameId() === initialSaveId) setGame((current) => current ?? playableGame(loaded));
    }).catch((cause: unknown) => {
      if (!active || loadGameId() !== initialSaveId) return;
      if (cause instanceof ApiError && cause.code === "game_not_found") {
        clearGameId();
        setSaveId(null);
      } else setError(errorCode(cause));
    });
    return () => { active = false; };
  }, [initialSaveId]);

  async function run<T>(operation: () => Promise<T>): Promise<T | null> {
    if (pending) return null;
    setPending(true);
    setError(null);
    try { return await operation(); }
    catch (cause: unknown) {
      setError(errorCode(cause));
      if (cause instanceof ApiError && cause.code === "version_conflict" && game) await recoverConflict(game.id, setGame);
      return null;
    }
    finally { setPending(false); }
  }

  async function create(request: CreateGameRequest): Promise<boolean> {
    const created = await run(() => gameApi.create(request));
    if (!created) return false;
    acceptGame(created, setGame, setSaveId);
    return true;
  }

  async function resume(): Promise<boolean> {
    if (!saveId) return false;
    const loaded = await run(() => gameApi.get(saveId));
    if (!loaded) return false;
    setGame(playableGame(loaded));
    return true;
  }

  async function toggleQueue(nodeId: string): Promise<void> {
    if (!game) return;
    const queue = game.queue.includes(nodeId) ? game.queue.filter((id) => id !== nodeId) : [...game.queue, nodeId];
    const preview = await run(() => gameApi.preview(game.id, queue));
    if (!preview || preview.errors.length) {
      if (preview?.errors[0]) setError(preview.errors[0].code);
      return;
    }
    setGame({ ...game, queue, preview });
  }

  async function finishSemester(): Promise<EndSemesterResponse | null> {
    if (!game) return null;
    const response = await run(() => gameApi.endSemester(game, game.queue));
    if (response) acceptGame(response.game, setGame, setSaveId);
    return response;
  }

  async function vote(promises: string[]): Promise<ElectionResponse | null> {
    if (!game) return null;
    const response = await run(() => gameApi.vote(game, promises));
    if (response) acceptGame(response.game, setGame, setSaveId);
    return response;
  }

  async function saveCampaign(promises: string[]): Promise<boolean> {
    return persistCampaignSelection(game, promises, run, (next) => acceptGame(next, setGame, setSaveId));
  }

  function restart(): void {
    clearGameId();
    setSaveId(null);
    setGame(null);
    setError(null);
  }

  return { game, saveId, pending, error, setError, create, resume, toggleQueue, finishSemester, saveCampaign, vote, restart };
}

async function persistCampaignSelection(
  game: PlayableGame | null,
  promises: string[],
  run: ApiOperation,
  acceptGame: (next: GameView) => void,
): Promise<boolean> {
  if (!game) return false;
  const response = await run(() => gameApi.saveCampaign(game, promises));
  if (!response) return false;
  acceptGame(response.game);
  return true;
}

function acceptGame(next: GameView, setGame: Dispatch<SetStateAction<PlayableGame | null>>,
  setSaveId: Dispatch<SetStateAction<string | null>>): void {
  storeGameId(next.id);
  setSaveId(next.id);
  setGame(playableGame(next));
}

export function errorCode(cause: unknown): string {
  return cause instanceof ApiError ? cause.code : "internal_error";
}

async function recoverConflict(id: string, setGame: Dispatch<SetStateAction<PlayableGame | null>>): Promise<void> {
  try { setGame(playableGame(await gameApi.get(id))); } catch { /* Keep the conflict visible. */ }
}
