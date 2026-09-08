import type { MatchStats } from './stats';

const KEY = 'belka_cosmetics_v1';

export interface Cosmetics {
  cardBack: string;
  sticker: string;
  ownedStickers: string[]; // stickers pinned to the quick bar
}

export interface UnlockDef {
  id: string;
  name: string;
  desc: string;
  check: (s: MatchStats) => boolean;
  progress: (s: MatchStats) => { cur: number; goal: number };
}

function always(): UnlockDef['check'] { return () => true; }

// ── Card backs ────────────────────────────────────────────────

export interface CardBackDef extends UnlockDef {
  color: string;
  preview: string;
}

export const CARD_BACKS: CardBackDef[] = [
  {
    id: 'classic', name: 'Классика', desc: 'Доступна всем',
    color: '#1e4878',
    preview: 'linear-gradient(145deg,#1e4878,#102240 55%,#0d1e50)',
    check: always(), progress: () => ({ cur: 1, goal: 1 }),
  },
  {
    id: 'gold', name: 'Золотая', desc: '3 победы',
    color: '#c9a227',
    preview: 'linear-gradient(145deg,#8a6f14,#c9a227 55%,#6a5410)',
    check: s => s.wins >= 3, progress: s => ({ cur: Math.min(s.wins, 3), goal: 3 }),
  },
  {
    id: 'crimson', name: 'Рубиновая', desc: '10 сыгранных матчей',
    color: '#8a1c1c',
    preview: 'linear-gradient(145deg,#8a1c1c,#4a0d0d 55%,#2a0606)',
    check: s => s.wins + s.losses >= 10,
    progress: s => ({ cur: Math.min(s.wins + s.losses, 10), goal: 10 }),
  },
  {
    id: 'emerald', name: 'Изумрудная', desc: 'Серия из 3 побед',
    color: '#1b5e35',
    preview: 'linear-gradient(145deg,#1b5e35,#0d3b20 55%,#062112)',
    check: s => s.bestStreak >= 3, progress: s => ({ cur: Math.min(s.bestStreak, 3), goal: 3 }),
  },
  {
    id: 'midnight', name: 'Полночь', desc: 'Победа «на голой»',
    color: '#221a3a',
    preview: 'linear-gradient(145deg,#3a2c66,#1a1330 55%,#0b0818)',
    check: s => s.golayaWins >= 1, progress: s => ({ cur: Math.min(s.golayaWins, 1), goal: 1 }),
  },
  {
    id: 'royal', name: 'Королевская', desc: '25 побед',
    color: '#6b1f5a',
    preview: 'linear-gradient(145deg,#8c2a76,#4a1240 55%,#240a1f)',
    check: s => s.wins >= 25, progress: s => ({ cur: Math.min(s.wins, 25), goal: 25 }),
  },
];

// ── Table themes ──────────────────────────────────────────────

export interface ThemeDef extends UnlockDef {
  bg: string;
  cls: string;
}

export const TABLE_THEMES: ThemeDef[] = [
  {
    id: 'green', name: 'Лесной', desc: 'Доступна всем', cls: 'felt-table',
    bg: 'radial-gradient(ellipse at 50% 60%, #215535, #0b1f14)',
    check: always(), progress: () => ({ cur: 1, goal: 1 }),
  },
  {
    id: 'blue', name: 'Морской', desc: 'Доступна всем', cls: 'felt-table-blue',
    bg: 'radial-gradient(ellipse at 50% 60%, #1a3060, #0b1220)',
    check: always(), progress: () => ({ cur: 1, goal: 1 }),
  },
  {
    id: 'crimson', name: 'Рубин', desc: 'Доступна всем', cls: 'felt-table-crimson',
    bg: 'radial-gradient(ellipse at 50% 60%, #5a1a1a, #1a0808)',
    check: always(), progress: () => ({ cur: 1, goal: 1 }),
  },
  {
    id: 'royal', name: 'Королевский', desc: '5 побед', cls: 'felt-table-royal',
    bg: 'radial-gradient(ellipse at 50% 60%, #4c1d95, #1a0f2e)',
    check: s => s.wins >= 5, progress: s => ({ cur: Math.min(s.wins, 5), goal: 5 }),
  },
  {
    id: 'sand', name: 'Пустыня', desc: '15 сыгранных матчей', cls: 'felt-table-sand',
    bg: 'radial-gradient(ellipse at 50% 60%, #7a5a2a, #24180a)',
    check: s => s.wins + s.losses >= 15,
    progress: s => ({ cur: Math.min(s.wins + s.losses, 15), goal: 15 }),
  },
  {
    id: 'noir', name: 'Нуар', desc: 'Раунд со всеми взятками', cls: 'felt-table-noir',
    bg: 'radial-gradient(ellipse at 50% 60%, #2b2b30, #0a0a0c)',
    check: s => s.perfectRounds >= 1, progress: s => ({ cur: Math.min(s.perfectRounds, 1), goal: 1 }),
  },
];

export function themeClass(id?: string) {
  return TABLE_THEMES.find(t => t.id === id)?.cls ?? 'felt-table';
}

// ── Stickers ──────────────────────────────────────────────────

export interface StickerDef extends UnlockDef {
  icon: string;
}

export const STICKERS: StickerDef[] = [
  { id: 'smile', name: 'Смайл', icon: '🙂', desc: 'Доступен всем', check: always(), progress: () => ({ cur: 1, goal: 1 }) },
  { id: 'clap', name: 'Браво', icon: '👏', desc: 'Доступен всем', check: always(), progress: () => ({ cur: 1, goal: 1 }) },
  { id: 'squirrel', name: 'Белка', icon: '🐿️', desc: '1 победа', check: s => s.wins >= 1, progress: s => ({ cur: Math.min(s.wins, 1), goal: 1 }) },
  { id: 'fire', name: 'Огонь', icon: '🔥', desc: 'Серия из 2 побед', check: s => s.bestStreak >= 2, progress: s => ({ cur: Math.min(s.bestStreak, 2), goal: 2 }) },
  { id: 'crown', name: 'Корона', icon: '👑', desc: '10 побед', check: s => s.wins >= 10, progress: s => ({ cur: Math.min(s.wins, 10), goal: 10 }) },
  { id: 'think', name: 'Думаю', icon: '🤔', desc: '5 сыгранных матчей', check: s => s.wins + s.losses >= 5, progress: s => ({ cur: Math.min(s.wins + s.losses, 5), goal: 5 }) },
  { id: 'cry', name: 'Эх...', icon: '😭', desc: 'Первое поражение', check: s => s.losses >= 1, progress: s => ({ cur: Math.min(s.losses, 1), goal: 1 }) },
  { id: 'gg', name: 'GG', icon: '🤝', desc: '20 сыгранных матчей', check: s => s.wins + s.losses >= 20, progress: s => ({ cur: Math.min(s.wins + s.losses, 20), goal: 20 }) },
];

export function stickerById(id: string) {
  return STICKERS.find(s => s.id === id) ?? STICKERS[0];
}

// ── Collection ────────────────────────────────────────────────

export const COLLECTION: UnlockDef[] = [
  { id: 'first_win', name: 'Первая победа', desc: 'Выиграть матч', check: s => s.wins >= 1, progress: s => ({ cur: Math.min(s.wins, 1), goal: 1 }) },
  { id: 'perfect', name: 'Чистый лист', desc: 'Взять все 8 взяток в раунде', check: s => s.perfectRounds >= 1, progress: s => ({ cur: Math.min(s.perfectRounds, 1), goal: 1 }) },
  { id: 'golaya', name: 'Голая душа', desc: 'Победа «на голой»', check: s => s.golayaWins >= 1, progress: s => ({ cur: Math.min(s.golayaWins, 1), goal: 1 }) },
  { id: 'streak5', name: 'На волне', desc: 'Серия из 5 побед', check: s => s.bestStreak >= 5, progress: s => ({ cur: Math.min(s.bestStreak, 5), goal: 5 }) },
  { id: 'hard5', name: 'Мастер белки', desc: '5 побед на сложном уровне', check: s => (s.byDifficulty?.hard?.wins ?? 0) >= 5, progress: s => ({ cur: Math.min(s.byDifficulty?.hard?.wins ?? 0, 5), goal: 5 }) },
  { id: 'rounds100', name: 'Ветеран', desc: 'Сыграть 100 раундов', check: s => s.totalRounds >= 100, progress: s => ({ cur: Math.min(s.totalRounds, 100), goal: 100 }) },
  { id: 'legend', name: 'Легенда стола', desc: '50 побед', check: s => s.wins >= 50, progress: s => ({ cur: Math.min(s.wins, 50), goal: 50 }) },
];

// ── Persistence ───────────────────────────────────────────────

export function defaultCosmetics(): Cosmetics {
  return { cardBack: 'classic', sticker: 'smile', ownedStickers: ['smile', 'clap'] };
}

export function loadCosmetics(): Cosmetics {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultCosmetics(), ...JSON.parse(raw) } : defaultCosmetics();
  } catch {
    return defaultCosmetics();
  }
}

export function saveCosmetics(c: Cosmetics) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
}

export function applyCardBack(id: string) {
  try { document.body.dataset['cardBack'] = id; } catch {}
}
