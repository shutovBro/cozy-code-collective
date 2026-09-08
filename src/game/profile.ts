import type { MatchStats } from './stats';

const KEY = 'belka_profile_v1';

export interface Profile {
  nickname: string;
  avatar: string;      // emoji id
  frame: string;       // frame id
  titleId: string;     // title id
  bio: string;
  favoriteSuit: string; // '♠' | '♥' | '♦' | '♣'
}

export const AVATARS = [
  '🐼', '🦊', '🐻', '🐺', '🦁', '🐯', '🐨', '🦉',
  '🐸', '🐢', '🦅', '🐉', '👑', '🃏', '🎩', '💎',
];

export const FRAMES: { id: string; name: string; color: string; glow: string }[] = [
  { id: 'gold',    name: 'Золото',   color: '#c9a227', glow: 'rgba(201,162,39,0.45)' },
  { id: 'emerald', name: 'Изумруд',  color: '#39a86b', glow: 'rgba(57,168,107,0.45)' },
  { id: 'ruby',    name: 'Рубин',    color: '#c0413f', glow: 'rgba(192,65,63,0.45)' },
  { id: 'sea',     name: 'Море',     color: '#3d7fbf', glow: 'rgba(61,127,191,0.45)' },
  { id: 'violet',  name: 'Аметист',  color: '#8a5cd1', glow: 'rgba(138,92,209,0.45)' },
  { id: 'silver',  name: 'Серебро',  color: '#b9c6cc', glow: 'rgba(185,198,204,0.4)' },
];

export const SUITS = ['♠', '♥', '♦', '♣'];

export interface TitleDef {
  id: string;
  label: string;
  desc: string;
  check: (s: MatchStats) => boolean;
}

export const TITLES: TitleDef[] = [
  { id: 'novice',  label: 'Новичок',        desc: 'Доступно всем',              check: () => true },
  { id: 'player',  label: 'Картёжник',      desc: '5 сыгранных матчей',         check: s => s.wins + s.losses >= 5 },
  { id: 'winner',  label: 'Победитель',     desc: '10 побед',                   check: s => s.wins >= 10 },
  { id: 'streak',  label: 'На волне',       desc: 'Серия из 3 побед',           check: s => s.bestStreak >= 3 },
  { id: 'golaya',  label: 'Голая душа',     desc: 'Победа «на голой»',          check: s => s.golayaWins >= 1 },
  { id: 'perfect', label: 'Чистый лист',    desc: 'Раунд со всеми взятками',    check: s => s.perfectRounds >= 1 },
  { id: 'hard',    label: 'Мастер белки',   desc: '5 побед на сложном уровне',  check: s => (s.byDifficulty?.hard?.wins ?? 0) >= 5 },
  { id: 'legend',  label: 'Легенда стола',  desc: '50 побед',                   check: s => s.wins >= 50 },
];

export function titleById(id: string): TitleDef {
  return TITLES.find(t => t.id === id) ?? TITLES[0];
}

export function unlockedTitles(stats: MatchStats): TitleDef[] {
  return TITLES.filter(t => t.check(stats));
}

export function levelInfo(stats: MatchStats) {
  const played = stats.wins + stats.losses;
  const xp = stats.wins * 3 + stats.losses + stats.perfectRounds * 2 + stats.golayaWins * 4;
  const level = Math.floor(xp / 10) + 1;
  const progress = ((xp % 10) / 10) * 100;
  return { played, xp, level, progress, toNext: 10 - (xp % 10) };
}

export function defaultProfile(nickname = 'Вы'): Profile {
  return { nickname, avatar: '🐼', frame: 'gold', titleId: 'novice', bio: '', favoriteSuit: '♠' };
}

export function loadProfile(nickname = 'Вы'): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultProfile(nickname), ...JSON.parse(raw) } : defaultProfile(nickname);
  } catch {
    return defaultProfile(nickname);
  }
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

export function frameById(id: string) {
  return FRAMES.find(f => f.id === id) ?? FRAMES[0];
}
