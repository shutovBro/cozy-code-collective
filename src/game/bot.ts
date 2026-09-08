import type { Card, GameState, TrickCard } from './types';
import { getLegalMoves, effectiveSuit, cardStrength, teamOf } from './engine';
import type { Difficulty } from './settings';

// ─── Trick helpers ────────────────────────────────────────────

function trickCurrentWinnerSeat(trick: TrickCard[], trump: string): number {
  if (!trick.length) return -1;
  const leadEff = effectiveSuit(trick[0].card, trump as any) as string;
  let best = { seat: trick[0].seat, str: cardStrength(trick[0].card, leadEff, trump as any) };
  for (let i = 1; i < trick.length; i++) {
    const s = cardStrength(trick[i].card, leadEff, trump as any);
    if (s > best.str) best = { seat: trick[i].seat, str: s };
  }
  return best.seat;
}

function trickBestStrength(trick: TrickCard[], trump: string): number {
  if (!trick.length) return 0;
  const leadEff = effectiveSuit(trick[0].card, trump as any) as string;
  return trick.reduce((best, tc) => {
    const s = cardStrength(tc.card, leadEff, trump as any);
    return s > best ? s : best;
  }, 0);
}

function trickPoints(trick: TrickCard[]): number {
  return trick.reduce((s, tc) => s + tc.card.pointValue, 0);
}

// ─── Card selectors ───────────────────────────────────────────

function cheapest(cards: Card[]): Card {
  return cards.reduce((a, b) => a.pointValue < b.pointValue || (a.pointValue === b.pointValue && cardStrength(a, 'x', 'C' as any) < cardStrength(b, 'x', 'C' as any)) ? a : b);
}

function mostExpensive(cards: Card[]): Card {
  return cards.reduce((a, b) => a.pointValue > b.pointValue ? a : b);
}

function cheapestNonPoint(cards: Card[]): Card | null {
  const zeros = cards.filter(c => c.pointValue === 0);
  if (!zeros.length) return null;
  return zeros.sort((a, b) => cardStrength(a, 'x', 'C' as any) - cardStrength(b, 'x', 'C' as any))[0];
}

// ─── Main bot logic ───────────────────────────────────────────

// Easy: picks a random legal card
function botEasy(state: GameState, seat: number): string {
  const legal = getLegalMoves(state.hands[seat], state.currentTrick, state.trump);
  return legal[Math.floor(Math.random() * legal.length)].id;
}

// Hard: same as normal but always tries to win, and dumps highest non-point
// when losing (don't give opponents cheap tricks)
function botHard(state: GameState, seat: number): string {
  const { hands, currentTrick, trump } = state;
  const legal = getLegalMoves(hands[seat], currentTrick, trump);
  const byValue = [...legal].sort((a, b) => a.pointValue - b.pointValue);
  const partnerSeat = (seat + 2) % 4;
  const myTeam = teamOf(seat);

  if (currentTrick.length === 0) {
    return chooseLeadCard(legal, trump, hands, seat, myTeam);
  }

  const leadEff = effectiveSuit(currentTrick[0].card, trump) as string;
  const currentBest = trickBestStrength(currentTrick, trump);
  const currentWinner = trickCurrentWinnerSeat(currentTrick, trump);
  const partnerWinning = currentWinner === partnerSeat;

  if (partnerWinning) {
    // Hard: dump most expensive to partner always (not just last)
    return mostExpensive(byValue).id;
  }

  // Always try to beat opponent if possible
  const winners = byValue.filter(c => cardStrength(c, leadEff, trump) > currentBest);
  if (winners.length > 0) return winners[0].id;

  // Cannot win — dump highest non-point card (deny opponent cheap wins)
  const nonPoints = byValue.filter(c => c.pointValue === 0);
  if (nonPoints.length > 0) return nonPoints[nonPoints.length - 1].id;

  // Must give points — give cheapest
  return byValue[0].id;
}

export function botChooseCard(state: GameState, seat: number, difficulty: Difficulty = 'normal'): string {
  if (difficulty === 'easy') return botEasy(state, seat);
  if (difficulty === 'hard') return botHard(state, seat);
  // normal:
  const { hands, currentTrick, trump, points } = state;
  const legal = getLegalMoves(hands[seat], currentTrick, trump);
  const byValue = [...legal].sort((a, b) => a.pointValue - b.pointValue);

  const partnerSeat = (seat + 2) % 4;
  const myTeam = teamOf(seat);

  // ── Leading ──────────────────────────────────────────────────
  if (currentTrick.length === 0) {
    return chooseLeadCard(legal, trump, hands, seat, myTeam);
  }

  // ── Following ────────────────────────────────────────────────
  const leadEff = effectiveSuit(currentTrick[0].card, trump) as string;
  const currentBest = trickBestStrength(currentTrick, trump);
  const currentWinner = trickCurrentWinnerSeat(currentTrick, trump);
  const isLast = currentTrick.length === 3;
  const partnerWinning = currentWinner === partnerSeat;
  const currentTrickPts = trickPoints(currentTrick);

  // Partner is currently winning
  if (partnerWinning) {
    if (isLast) {
      // Last player, partner wins for sure — dump most valuable card to boost haul
      return mostExpensive(byValue).id;
    }
    // Not last — still opponents to play; dump cheapest safe card
    const safe = cheapestNonPoint(byValue) ?? byValue[0];
    return safe.id;
  }

  // Opponent is winning — try to beat them
  const winners = byValue.filter(c => cardStrength(c, leadEff, trump) > currentBest);

  if (winners.length > 0) {
    if (isLast) {
      // Last player — win with cheapest winning card
      return winners[0].id;
    }
    // Not last — win only if trick is worth it or we can do so cheaply
    const hasValueInTrick = currentTrickPts >= 4;
    if (hasValueInTrick || winners[0].pointValue === 0) {
      return winners[0].id;
    }
  }

  // Cannot win (or not worth it) — dump cheapest non-scoring card, else cheapest
  // Спас awareness: if we're losing badly (< 30 pts), try harder to score
  const myTeamPoints = points[myTeam];
  const needsSave = myTeamPoints < 30 && winners.length > 0;
  if (needsSave) return winners[0].id;

  return (cheapestNonPoint(byValue) ?? byValue[0]).id;
}

// ─── Lead card selection ──────────────────────────────────────

function chooseLeadCard(
  legal: Card[],
  trump: string,
  hands: Card[][],
  seat: number,
  myTeam: 0 | 1,
): string {
  const byValue = [...legal].sort((a, b) => a.pointValue - b.pointValue);
  const nonTrumps = byValue.filter(c => effectiveSuit(c, trump as any) !== 'trump');
  const trumps = byValue.filter(c => effectiveSuit(c, trump as any) === 'trump');

  // Count total trumps remaining in play (ours + opponents')
  const allHands = hands.flat();
  const trumpsInPlay = allHands.filter(c => effectiveSuit(c, trump as any) === 'trump').length;
  const myTrumps = legal.filter(c => effectiveSuit(c, trump as any) === 'trump');

  // If we hold J♣ (strongest trump), consider pulling opponents' trumps
  const hasJClub = myTrumps.some(c => c.id === 'JC');
  if (hasJClub && trumpsInPlay <= myTrumps.length + 2) {
    // We dominate trumps — lead J♣ to clean them out
    const jc = myTrumps.find(c => c.id === 'JC')!;
    return jc.id;
  }

  // Prefer leading a non-trump
  if (nonTrumps.length > 0) {
    // Lead the suit where we have the most cards (establish a long suit)
    const suitCounts: Record<string, Card[]> = {};
    for (const c of nonTrumps) {
      const eff = c.suit;
      if (!suitCounts[eff]) suitCounts[eff] = [];
      suitCounts[eff].push(c);
    }
    const longestSuit = Object.values(suitCounts).reduce((a, b) => a.length >= b.length ? a : b);
    // Lead lowest in the longest suit
    const sorted = longestSuit.sort((a, b) => a.pointValue - b.pointValue);
    return sorted[0].id;
  }

  // Only trumps left — lead lowest trump
  return byValue[0].id;
}
