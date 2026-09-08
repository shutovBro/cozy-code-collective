import type { Card, Suit, Rank, GameState, TrickCard, RoundResult, CompletedTrick, EyesSnapshot } from './types';

const POINT_VALUES: Record<Rank, number> = {
  '7': 0, '8': 0, '9': 0, '10': 10, 'J': 2, 'Q': 3, 'K': 4, 'A': 11,
};

const RANK_STRENGTH: Record<Rank, number> = {
  '7': 1, '8': 2, '9': 3, 'Q': 4, 'K': 5, '10': 6, 'A': 7, 'J': 0,
};

// Higher = stronger permanent trump
const PERM_STRENGTH: Record<string, number> = {
  JD: 201, JH: 202, JS: 203, JC: 204,
};

const ALL_SUITS: Suit[] = ['C', 'S', 'H', 'D'];
const ALL_RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
// Trump rotates each round: ♣ → ♠ → ♥ → ♦ → ♣ → ...
const TRUMP_ORDER: Suit[] = ['C', 'S', 'H', 'D'];

export function createDeck(): Card[] {
  return ALL_SUITS.flatMap(suit =>
    ALL_RANKS.map(rank => ({
      id: `${rank}${suit}`,
      suit,
      rank,
      pointValue: POINT_VALUES[rank],
      isPermanentTrump: rank === 'J',
    }))
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function effectiveSuit(card: Card, trump: Suit): 'trump' | Suit {
  if (card.isPermanentTrump) return 'trump';
  if (card.suit === trump) return 'trump';
  return card.suit;
}

export function cardStrength(card: Card, leadEff: string, trump: Suit): number {
  if (card.isPermanentTrump) return PERM_STRENGTH[card.id];
  const eff = effectiveSuit(card, trump);
  if (eff === 'trump') return 100 + RANK_STRENGTH[card.rank];
  if (eff === leadEff) return RANK_STRENGTH[card.rank];
  return 0; // cannot win trick
}

export function getLegalMoves(hand: Card[], trick: TrickCard[], trump: Suit): Card[] {
  if (trick.length === 0) return [...hand];
  const leadEff = effectiveSuit(trick[0].card, trump);
  const matching = hand.filter(c => effectiveSuit(c, trump) === leadEff);
  return matching.length > 0 ? matching : [...hand];
}

export function resolveTrick(trick: TrickCard[], trump: Suit): { winnerSeat: number; points: number } {
  if (trick.length === 0) return { winnerSeat: 0, points: 0 };
  const leadEff = effectiveSuit(trick[0].card, trump) as string;
  let best = { seat: trick[0].seat, strength: cardStrength(trick[0].card, leadEff, trump) };
  for (let i = 1; i < trick.length; i++) {
    const s = cardStrength(trick[i].card, leadEff, trump);
    if (s > best.strength) best = { seat: trick[i].seat, strength: s };
  }
  return {
    winnerSeat: best.seat,
    points: trick.reduce((sum, tc) => sum + tc.card.pointValue, 0),
  };
}

export function teamOf(seat: number): 0 | 1 {
  return seat % 2 === 0 ? 0 : 1;
}

function applyEyesDelta(
  eyes: [number, number],
  delta: [number, number]
): { newEyes: [number, number]; matchWinner: 0 | 1 | null } {
  const newEyes: [number, number] = [eyes[0] + delta[0], eyes[1] + delta[1]];
  const matchWinner: 0 | 1 | null =
    newEyes[0] >= 12 ? 0 : newEyes[1] >= 12 ? 1 : null;
  return { newEyes, matchWinner };
}

function calcRoundResult(
  points: [number, number],
  tricksWon: [number, number],
  jClubOwnerSeat: number,
  eyes: [number, number],
  roundNumber: number,
  eggRound: boolean
): RoundResult {
  const bonuses: string[] = [];

  // Голая: one team wins ALL 120 points → instant match win
  if (points[0] === 120 || points[1] === 120) {
    const winner = (points[0] === 120 ? 0 : 1) as 0 | 1;
    bonuses.push('ГОЛАЯ!');
    return {
      roundNumber, points,
      eyesDelta: [0, 0], bonuses,
      eggTriggered: false, golaya: true, matchWinner: winner,
    };
  }

  // Яйцо: exactly 60:60 split — next round is egg round (±4 eyes)
  if (points[0] === 60 && points[1] === 60) {
    return {
      roundNumber, points,
      eyesDelta: [0, 0], bonuses: ['ЯЙЦО! 🥚'],
      eggTriggered: true, golaya: false, matchWinner: null,
    };
  }

  const eyesDelta: [number, number] = [0, 0];

  // Egg round resolution: winner gets +4 eyes (another 60:60 → no eyes)
  if (eggRound) {
    if (points[0] > points[1]) { eyesDelta[0] = 4; bonuses.push('Яйцо: +4 очка'); }
    else if (points[1] > points[0]) { eyesDelta[1] = 4; bonuses.push('Яйцо: +4 очка'); }
    else bonuses.push('Яйцо: ничья, очков нет');
    const { newEyes, matchWinner } = applyEyesDelta(eyes, eyesDelta);
    void newEyes;
    return { roundNumber, points, eyesDelta, bonuses, eggTriggered: false, golaya: false, matchWinner };
  }

  // Normal scoring: 61–90 → 1 eye, 91–120 → 2 eyes
  for (let t = 0; t <= 1; t++) {
    if (points[t] >= 91) eyesDelta[t] = 2;
    else if (points[t] >= 61) eyesDelta[t] = 1;
  }

  // Спас: winning team's opponents scored < 30 → +1 bonus eye to winner
  const winnerTeam = points[0] > points[1] ? 0 : 1;
  const loserTeam = 1 - winnerTeam as 0 | 1;
  if (points[loserTeam] < 30) {
    eyesDelta[winnerTeam as 0 | 1] += 1;
    bonuses.push('СПАС +1');
  }

  // Туз Треф: opponents of the J♣ holder always gain +1 eye
  const jClubTeam = teamOf(jClubOwnerSeat);
  const jClubBonusTeam = (1 - jClubTeam) as 0 | 1;
  eyesDelta[jClubBonusTeam] += 1;
  bonuses.push('Туз Треф +1');

  const { matchWinner } = applyEyesDelta(eyes, eyesDelta);

  return { roundNumber, points, eyesDelta, bonuses, eggTriggered: false, golaya: false, matchWinner };
}

export function createInitialState(playerNames: [string, string, string, string]): GameState {
  return {
    phase: 'HOME',
    roundNumber: 0,
    dealerSeat: 3,
    trump: 'C',
    currentPlayer: 0,
    trickWinner: null,
    currentTrick: [],
    leadSeat: 0,
    hands: [[], [], [], []],
    points: [0, 0],
    eyes: [0, 0],
    tricksWon: [0, 0],
    eggRound: false,
    jClubOwnerSeat: 0,
    stateVersion: 0,
    lastRoundResult: null,
    matchWinner: null,
    playerNames,
    trickHistory: [],
    eyesHistory: [],
  };
}

export function dealCards(state: GameState): GameState {
  const deck = shuffle(createDeck());
  const hands: Card[][] = [[], [], [], []];
  let jClubOwner = 0;
  for (let i = 0; i < 32; i++) {
    const seat = i % 4;
    hands[seat].push(deck[i]);
    if (deck[i].id === 'JC') jClubOwner = seat;
  }
  const newRound = state.roundNumber + 1;
  const newTrump = TRUMP_ORDER[(newRound - 1) % 4];
  const firstPlayer = (state.dealerSeat + 1) % 4;
  return {
    ...state,
    phase: 'PLAYING',
    roundNumber: newRound,
    trump: newTrump,
    hands,
    currentTrick: [],
    trickWinner: null,
    leadSeat: firstPlayer,
    currentPlayer: firstPlayer,
    points: [0, 0],
    tricksWon: [0, 0],
    jClubOwnerSeat: jClubOwner,
    stateVersion: state.stateVersion + 1,
    lastRoundResult: null,
    trickHistory: [],
  };
}

export function playCard(state: GameState, seat: number, cardId: string): GameState {
  if (state.phase !== 'PLAYING') return state;
  if (state.currentPlayer !== seat) return state;

  const hand = state.hands[seat];
  const cardIdx = hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return state;

  const card = hand[cardIdx];
  const legal = getLegalMoves(hand, state.currentTrick, state.trump);
  if (!legal.find(c => c.id === cardId)) return state;

  const newHand = hand.filter((_, i) => i !== cardIdx);
  const newTrick: TrickCard[] = [...state.currentTrick, { seat, card }];
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h) as Card[][];

  if (newTrick.length < 4) {
    return {
      ...state,
      currentTrick: newTrick,
      hands: newHands,
      currentPlayer: (seat + 1) % 4,
      stateVersion: state.stateVersion + 1,
    };
  }

  // Trick complete — resolve it
  const { winnerSeat, points: trickPoints } = resolveTrick(newTrick, state.trump);
  const winnerTeam = teamOf(winnerSeat);
  const newPoints: [number, number] = [state.points[0], state.points[1]];
  newPoints[winnerTeam] += trickPoints;
  const newTricksWon: [number, number] = [state.tricksWon[0], state.tricksWon[1]];
  newTricksWon[winnerTeam] += 1;
  const totalTricks = newTricksWon[0] + newTricksWon[1];

  const completedTrick: CompletedTrick = {
    trickNumber: totalTricks,
    cards: newTrick,
    winnerSeat,
    points: trickPoints,
  };
  const newTrickHistory = [...(state.trickHistory ?? []), completedTrick];

  if (totalTricks < 8) {
    return {
      ...state,
      phase: 'TRICK_RESOLVING',
      hands: newHands,
      currentTrick: newTrick,
      trickWinner: winnerSeat,
      currentPlayer: winnerSeat,
      leadSeat: winnerSeat,
      points: newPoints,
      tricksWon: newTricksWon,
      trickHistory: newTrickHistory,
      stateVersion: state.stateVersion + 1,
    };
  }

  // Round complete
  const result = calcRoundResult(newPoints, newTricksWon, state.jClubOwnerSeat, state.eyes, state.roundNumber, state.eggRound);
  let newEyes: [number, number] = [state.eyes[0], state.eyes[1]];
  let newEggRound = false;
  if (!result.golaya && !result.eggTriggered) {
    newEyes = [newEyes[0] + result.eyesDelta[0], newEyes[1] + result.eyesDelta[1]];
  } else if (result.eggTriggered) {
    newEggRound = true;
  }

  return {
    ...state,
    phase: result.matchWinner !== null || result.golaya ? 'MATCH_END' : 'ROUND_END',
    hands: newHands,
    currentTrick: newTrick,
    trickWinner: winnerSeat,
    points: newPoints,
    tricksWon: newTricksWon,
    trickHistory: newTrickHistory,
    eyes: newEyes,
    eyesHistory: [
      ...(state.eyesHistory ?? []),
      {
        roundNumber: state.roundNumber,
        eyes: newEyes,
        pointsA: newPoints[0],
        pointsB: newPoints[1],
        bonuses: result.bonuses,
      } satisfies EyesSnapshot,
    ],
    eggRound: newEggRound,
    lastRoundResult: result,
    matchWinner: result.matchWinner,
    currentPlayer: winnerSeat,
    stateVersion: state.stateVersion + 1,
  };
}

export function clearTrick(state: GameState): GameState {
  return {
    ...state,
    phase: 'PLAYING',
    currentTrick: [],
    trickWinner: null,
    stateVersion: state.stateVersion + 1,
  };
}

export function startNextRound(state: GameState): GameState {
  const nextDealer = (state.dealerSeat + 1) % 4;
  return dealCards({ ...state, dealerSeat: nextDealer });
}
