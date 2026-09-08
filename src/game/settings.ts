const KEY = 'belka_settings_v1';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type TableTheme = 'green' | 'blue' | 'crimson' | 'royal' | 'sand' | 'noir';
export type GameSpeed = 'slow' | 'normal' | 'fast';

export interface Settings {
  playerName: string;
  difficulty: Difficulty;
  soundEnabled: boolean;
  turnSeconds: number;
  tableTheme: TableTheme;
  gameSpeed: GameSpeed;
}

// Delay multipliers relative to the normal timings in config.ts
export const SPEED_FACTOR: Record<GameSpeed, number> = {
  slow: 1.65,
  normal: 1.0,
  fast: 0.42,
};

function defaults(): Settings {
  return { playerName: 'Вы', difficulty: 'normal', soundEnabled: true, turnSeconds: 25, tableTheme: 'green', gameSpeed: 'normal' };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    return defaults();
  }
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
