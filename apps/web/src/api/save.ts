const SAVE_KEY = "decreto.gameId";

export function loadGameId(): string | null {
  try { return window.localStorage.getItem(SAVE_KEY); } catch { return null; }
}

export function storeGameId(id: string): void {
  try { window.localStorage.setItem(SAVE_KEY, id); } catch { /* Storage may be unavailable. */ }
}

export function clearGameId(): void {
  try { window.localStorage.removeItem(SAVE_KEY); } catch { /* Storage may be unavailable. */ }
}
