export type Suit = 'C' | 'S' | 'H' | 'D';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Phase = 'HOME' | 'PLAYING' | 'TRICK_RESOLVING' | 'ROUND_END' | 'MATCH_END';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  pointValue: number;
  isPermanentTrump: boolean;
}

export interface TrickCard {
  seat: number;
  card: Card;
}

export interface CompletedTrick {
  trickNumber: number;
  cards: TrickCard[];
  winnerSeat: number;
  points: number;
}

export interface EyesSnapshot {
  roundNumber: number;
  eyes: [number, number];
  pointsA: number;
  pointsB: number;
  bonuses: string[];
}

export interface RoundResult {
  roundNumber: number;
  points: [number, number];
  eyesDelta: [number, number];
  bonuses: string[];
  eggTriggered: boolean;
  golaya: boolean;
  matchWinner: 0 | 1 | null;
}

export interface GameState {
  phase: Phase;
  roundNumber: number;
  dealerSeat: number;
  trump: Suit;
  currentPlayer: number;
  trickWinner: number | null;
  currentTrick: TrickCard[];
  leadSeat: number;
  hands: Card[][];
  points: [number, number];
  eyes: [number, number];
  tricksWon: [number, number];
  eggRound: boolean;
  jClubOwnerSeat: number;
  stateVersion: number;
  lastRoundResult: RoundResult | null;
  matchWinner: 0 | 1 | null;
  playerNames: [string, string, string, string];
  trickHistory: CompletedTrick[];
  eyesHistory: EyesSnapshot[];
}
