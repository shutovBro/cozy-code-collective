import type { GameState } from './types';

const KEY = 'belka_v1';

export function saveGame(state: GameState) {
  // Don't persist HOME or MATCH_END — user will restart fresh
  if (state.phase === 'HOME' || state.phase === 'MATCH_END') {
    clearGame();
    return;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (!s.trickHistory) s.trickHistory = [];
    if (!s.eyesHistory) s.eyesHistory = [];
    if (s.phase === 'TRICK_RESOLVING') {
      s.phase = 'PLAYING';
      s.currentTrick = [];
      s.trickWinner = null;
    }
    return s;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
