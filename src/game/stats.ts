const KEY = 'belka_stats_v1';

export interface MatchStats {
  wins: number;
  losses: number;
  streak: number;       // positive = win streak, negative = loss streak
  bestStreak: number;
  worstStreak: number;  // most negative (stored as negative number)
  golayaWins: number;
  golayaLosses: number;
  totalRounds: number;
  history: ('W' | 'L')[]; // last 20
  byDifficulty: Record<string, { wins: number; losses: number }>;
  perfectRounds: number;   // rounds where we took all 8 tricks
}

function empty(): MatchStats {
  return {
    wins: 0, losses: 0, streak: 0, bestStreak: 0, worstStreak: 0,
    golayaWins: 0, golayaLosses: 0, totalRounds: 0, history: [],
    byDifficulty: {}, perfectRounds: 0,
  };
}

export function loadStats(): MatchStats {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

export function recordMatch(
  won: boolean, golaya: boolean, rounds: number,
  difficulty = 'normal', tricksWonByUs = 0,
): MatchStats {
  const s = loadStats();
  if (won) {
    s.wins++;
    s.streak = s.streak > 0 ? s.streak + 1 : 1;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    if (golaya) s.golayaWins++;
  } else {
    s.losses++;
    s.streak = s.streak < 0 ? s.streak - 1 : -1;
    if (s.streak < s.worstStreak) s.worstStreak = s.streak;
    if (golaya) s.golayaLosses++;
  }
  s.totalRounds += rounds;
  s.history = [...s.history.slice(-19), won ? 'W' : 'L'];
  if (!s.byDifficulty[difficulty]) s.byDifficulty[difficulty] = { wins: 0, losses: 0 };
  if (won) s.byDifficulty[difficulty].wins++;
  else s.byDifficulty[difficulty].losses++;
  if (tricksWonByUs === 8) s.perfectRounds++;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  return s;
}

export function clearStats() {
  try { localStorage.removeItem(KEY); } catch {}
}
