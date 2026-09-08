import { useEffect, useRef } from 'react';
import type { GameState } from '../game/types';
import type { Settings } from '../game/settings';
import { playCard, clearTrick, getLegalMoves } from '../game/engine';
import { botChooseCard } from '../game/bot';
import { saveGame } from '../game/storage';
import { recordMatch, loadStats } from '../game/stats';
import {
  soundCardPlay, soundTrickWin, soundRoundEnd, soundMatchWin, soundMatchLose,
} from '../game/sound';
import {
  hapticTap, hapticTrickWin, hapticRoundEnd, hapticMatchWin, hapticMatchLose, hapticUrgent,
} from '../game/haptic';
import { BOT_DELAY_MS, TRICK_RESOLVE_MS, HUMAN_SEAT } from '../game/config';
import { SPEED_FACTOR } from '../game/settings';

interface Options {
  state: GameState;
  settings: Settings;
  timeLeft: number | null;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number | null>>;
  setStats: React.Dispatch<React.SetStateAction<ReturnType<typeof loadStats>>>;
}

export function useGameLoop({ state, settings, timeLeft, setState, setTimeLeft, setStats }: Options) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Persist on every state change
  useEffect(() => { saveGame(state); }, [state]);

  // Record match stats on MATCH_END (fire exactly once per match)
  const statsRecordedRef = useRef(false);
  useEffect(() => {
    if (state.phase !== 'MATCH_END') { statsRecordedRef.current = false; return; }
    if (statsRecordedRef.current) return;
    statsRecordedRef.current = true;
    const won = state.matchWinner === 0;
    const golaya = state.lastRoundResult?.golaya ?? false;
    const newStats = recordMatch(won, golaya, state.roundNumber, settingsRef.current.difficulty, state.tricksWon[0]);
    setStats(newStats);
  }, [state.phase, state.matchWinner]);

  // Sound + haptic on phase transitions
  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const cur = state.phase;
    prevPhaseRef.current = cur;
    if (cur === 'TRICK_RESOLVING' && prev === 'PLAYING') {
      soundTrickWin();
      if (state.trickWinner !== null && state.trickWinner % 2 === HUMAN_SEAT % 2) hapticTrickWin();
    }
    if (cur === 'ROUND_END') { soundRoundEnd(); hapticRoundEnd(); }
    if (cur === 'MATCH_END') {
      if (state.matchWinner === 0) { soundMatchWin(); hapticMatchWin(); }
      else { soundMatchLose(); hapticMatchLose(); }
    }
  }, [state.phase, state.stateVersion]);

  // Urgent haptic at 5s remaining
  useEffect(() => {
    if (timeLeft === 5) hapticUrgent();
  }, [timeLeft]);

  // Bot auto-play
  useEffect(() => {
    if (state.phase !== 'PLAYING' || state.currentPlayer === HUMAN_SEAT) return;
    const factor = SPEED_FACTOR[settingsRef.current.gameSpeed ?? 'normal'];
    const id = setTimeout(() => {
      const cur = stateRef.current;
      if (cur.phase !== 'PLAYING' || cur.currentPlayer === HUMAN_SEAT) return;
      soundCardPlay();
      const cardId = botChooseCard(cur, cur.currentPlayer, settingsRef.current.difficulty);
      setState(prev => playCard(prev, prev.currentPlayer, cardId));
    }, Math.round(BOT_DELAY_MS * factor));
    return () => clearTimeout(id);
  }, [state.phase, state.currentPlayer, state.stateVersion]);

  // Auto-play when human has exactly 1 legal card (no decision needed)
  useEffect(() => {
    if (state.phase !== 'PLAYING' || state.currentPlayer !== HUMAN_SEAT) return;
    const legal = getLegalMoves(state.hands[HUMAN_SEAT], state.currentTrick, state.trump);
    if (legal.length !== 1) return;
    const factor = SPEED_FACTOR[settingsRef.current.gameSpeed ?? 'normal'];
    const delay = Math.round(Math.max(260, 480 * factor));
    const id = setTimeout(() => {
      const cur = stateRef.current;
      if (cur.phase !== 'PLAYING' || cur.currentPlayer !== HUMAN_SEAT) return;
      const legalNow = getLegalMoves(cur.hands[HUMAN_SEAT], cur.currentTrick, cur.trump);
      if (legalNow.length !== 1) return;
      soundCardPlay();
      setState(prev => playCard(prev, HUMAN_SEAT, legalNow[0].id));
    }, delay);
    return () => clearTimeout(id);
  }, [state.phase, state.currentPlayer, state.stateVersion]);

  // Trick resolve pause
  useEffect(() => {
    if (state.phase !== 'TRICK_RESOLVING') return;
    const factor = SPEED_FACTOR[settingsRef.current.gameSpeed ?? 'normal'];
    const id = setTimeout(() => {
      setState(prev => prev.phase === 'TRICK_RESOLVING' ? clearTrick(prev) : prev);
    }, Math.round(TRICK_RESOLVE_MS * factor));
    return () => clearTimeout(id);
  }, [state.phase, state.stateVersion]);

  // Turn countdown timer
  useEffect(() => {
    if (state.phase !== 'PLAYING' || state.currentPlayer !== HUMAN_SEAT) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(settingsRef.current.turnSeconds);
    const id = setInterval(() => {
      setTimeLeft(prev => (prev === null || prev <= 1) ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [state.phase, state.currentPlayer]);

  // Auto-play cheapest card when timer hits 0
  useEffect(() => {
    if (timeLeft !== 0) return;
    const cur = stateRef.current;
    if (cur.phase !== 'PLAYING' || cur.currentPlayer !== HUMAN_SEAT) return;
    const legal = getLegalMoves(cur.hands[HUMAN_SEAT], cur.currentTrick, cur.trump);
    if (!legal.length) return;
    const card = [...legal].sort((a, b) => a.pointValue - b.pointValue)[0];
    soundCardPlay();
    setState(prev => playCard(prev, HUMAN_SEAT, card.id));
  }, [timeLeft]);

  return { stateRef, settingsRef };
}

// Re-export for convenience so callers don't need a second import
export { hapticTap };
