import { loadCosmetics, stickerById, themeClass } from '../game/cosmetics';
import pandaCrest from '../assets/panda-crest.png.asset.json';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Suit, TrickCard, Card, CompletedTrick } from '../game/types';
import { getLegalMoves, teamOf, effectiveSuit, cardStrength } from '../game/engine';
import { botChooseCard } from '../game/bot';
import PlayingCard, { SUIT_SYMBOL, SUIT_IS_RED, SUIT_NAME_RU } from './PlayingCard';
import { RoundResultOverlay, MatchResultOverlay } from './ResultOverlay';
import TrickHistoryModal from './TrickHistoryModal';
import MatchChartModal from './MatchChartModal';

// ─── Circular turn timer ──────────────────────────────────────

function TurnTimer({ timeLeft, totalSeconds }: { timeLeft: number; totalSeconds: number }) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const progress = timeLeft / Math.max(totalSeconds, 1);
  const dash = circ * progress;
  const urgent = timeLeft <= 7;

  return (
    <div className="relative w-8 h-8 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(201,162,39,0.12)" strokeWidth="2.5" />
        <circle
          cx="16" cy="16" r={r} fill="none"
          stroke={urgent ? '#e55050' : '#c9a227'}
          strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${urgent ? 'text-[#e55050]' : 'text-[#c9a227]'}`}
      >
        {timeLeft}
      </span>
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────

const MAX_ROUND_POINTS = 120;

function ScoreBar({ state }: { state: GameState }) {
  const { eyes, points, roundNumber, eggRound, trump, tricksWon, jClubOwnerSeat, playerNames, hands } = state;
  const sym = SUIT_SYMBOL[trump];
  const isRed = SUIT_IS_RED[trump];
  const jClubHolder = playerNames[jClubOwnerSeat];

  const teamAPct = Math.min(100, Math.round((points[0] / MAX_ROUND_POINTS) * 100));
  const teamBPct = Math.min(100, Math.round((points[1] / MAX_ROUND_POINTS) * 100));

  // Count remaining trumps across all hands in play
  const trumpsLeft = useMemo(
    () => hands.flat().filter(c => effectiveSuit(c, trump) === 'trump').length,
    [hands, trump]
  );
  // Max trumps: 4 Jacks + cards of trump suit (8 total in 32-card deck minus Jacks = 7 suit cards)
  const maxTrumps = 11; // 4 Jacks + 7 trump-suit non-Jacks

  return (
    <div
      className="relative flex items-center justify-between gap-2 flex-shrink-0 px-4 overflow-hidden border-b border-[#c9a227]/30"
      style={{
        paddingTop: 'max(12px, var(--safe-top))',
        paddingBottom: 14,
        backgroundImage: 'linear-gradient(to bottom, #1b3a24, #0d1e13)',
      }}
    >
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      {/* Team A */}
      <div className="relative flex flex-col items-start w-1/3 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#4ade80] mb-0.5">Мы</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white leading-none">{eyes[0]}</span>
          <span className="text-xs font-semibold text-white/30">/ 12</span>
        </div>
        <div className="grid grid-cols-6 gap-1 mt-2.5">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i < eyes[0] ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <div key={`pts0-${points[0]}`} className="mt-2.5 text-[10px] text-white/50 font-medium anim-score-tick whitespace-nowrap">
          {points[0]} оч. <span className="mx-1 opacity-30">•</span> {tricksWon[0]} взят.
        </div>
      </div>

      {/* Centre: trump + counters + round */}
      <div className="relative flex flex-col items-center flex-1 min-w-0">
        <div className="bg-black/40 backdrop-blur-md border border-[#c9a227]/50 rounded-full px-3 py-1.5 flex items-center gap-2.5 shadow-lg mb-3">
          <span className={`text-xl leading-none drop-shadow-sm ${isRed ? 'text-[#f87171]' : 'text-white'}`}>{sym}</span>
          <div className="flex flex-col items-center -space-y-1">
            <span className="text-[8px] font-extrabold uppercase tracking-tighter text-[#c9a227]">Козырь</span>
            <span className="text-[10px] font-bold text-white/90">{SUIT_NAME_RU[trump]}</span>
          </div>
          <span className={`text-xl leading-none drop-shadow-sm ${isRed ? 'text-[#f87171]' : 'text-white'}`}>{sym}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
            <span className={`text-xs ${isRed ? 'text-[#f87171]' : 'text-[#c9a227]'}`}>{sym}</span>
            <span className="text-[11px] font-bold text-white">
              {trumpsLeft} <span className="text-white/40 font-normal">/ {maxTrumps}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full pl-1 pr-2 py-0.5">
            <div className="w-4 h-5 bg-white rounded-[2px] flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-black text-black leading-none">J</span>
            </div>
            <span className="text-[10px] font-semibold text-white/80 max-w-[52px] truncate">{jClubHolder}</span>
          </div>
        </div>

        <div className="mt-3 text-[9px] font-black uppercase tracking-[0.25em] text-white/25 whitespace-nowrap">
          {eggRound ? '🥚 Яйцо' : `Раунд ${roundNumber}`}
        </div>
      </div>

      {/* Team B */}
      <div className="relative flex flex-col items-end w-1/3 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f87171] mb-0.5">Они</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-semibold text-white/30">12 /</span>
          <span className="text-3xl font-black text-white leading-none">{eyes[1]}</span>
        </div>
        <div className="grid grid-cols-6 gap-1 mt-2.5">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i < eyes[1] ? 'bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.6)]' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <div key={`pts1-${points[1]}`} className="mt-2.5 text-[10px] text-white/50 font-medium anim-score-tick whitespace-nowrap">
          {points[1]} оч. <span className="mx-1 opacity-30">•</span> {tricksWon[1]} взят.
        </div>
      </div>

      {/* Points progress stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[#4ade80] transition-all duration-700 ease-out"
          style={{ width: `${teamAPct / 2}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-[#f87171] transition-all duration-700 ease-out"
          style={{ width: `${teamBPct / 2}%` }}
        />
        <div className="absolute left-1/2 top-0 w-px h-full bg-[#c9a227]/40" />
      </div>
    </div>
  );
}

// ─── Player badge ─────────────────────────────────────────────

function PlayerBadge({ name, isActive, isDealer, teamA, hasJClub, size = 'md' }: {
  name: string; isActive: boolean; isDealer: boolean; teamA: boolean;
  hasJClub: boolean; size?: 'sm' | 'md';
}) {
  const dot  = teamA ? 'bg-[#7dd4a0]' : 'bg-[#d47d7d]';
  const ring = isActive
    ? (teamA ? 'border-[#7dd4a0]/80 player-active-glow' : 'border-[#d47d7d]/80 player-active-glow')
    : 'border-white/8';
  return (
    <div className={`inline-flex items-center gap-1.5 bg-black/60 border ${ring} rounded-full transition-all ${size === 'sm' ? 'px-2 py-[3px]' : 'px-3 py-1'}`}>
      <div className={`rounded-full flex-shrink-0 ${dot} ${size === 'sm' ? 'w-[5px] h-[5px]' : 'w-2 h-2'}`} />
      <span className={`text-[#c8dac9] font-semibold truncate ${size === 'sm' ? 'text-[9px] max-w-[44px]' : 'text-[11px] max-w-[72px]'}`}>
        {name}
      </span>
      {hasJClub && (
        <span className="text-[#c9a227] font-bold leading-none text-[8px]">♣</span>
      )}
      {isDealer && <span className="text-[#6a8a72] font-bold leading-none text-[8px]">D</span>}
      {isActive && <span className="text-[#c9a227] leading-none text-[9px] anim-pulse-gold">●</span>}
    </div>
  );
}

// ─── Trick area ────────────────────────────────────────────────

const TRICK_POS: Record<number, React.CSSProperties> = {
  0: { bottom: '6%',  left: '50%', transform: 'translateX(-50%)' },
  1: { top: '50%',   right: '6%', transform: 'translateY(-50%)' },
  2: { top: '6%',    left: '50%', transform: 'translateX(-50%)' },
  3: { top: '50%',   left: '6%',  transform: 'translateY(-50%)' },
};

// Normalized center coords (0–1) of each seat's card position in the trick area
const SEAT_CENTER: Record<number, [number, number]> = {
  0: [0.50, 0.88],
  1: [0.88, 0.50],
  2: [0.50, 0.12],
  3: [0.12, 0.50],
};

// Base CSS transforms applied via TRICK_POS (kept in sync so animation starts correctly)
const BASE_TRANSFORM: Record<number, string> = {
  0: 'translateX(-50%)',
  1: 'translateY(-50%)',
  2: 'translateX(-50%)',
  3: 'translateY(-50%)',
};

const PARTNER_SEAT = 2;

function TrickArea({ trick, trickWinner, trump, sizePx, phase }: {
  trick: TrickCard[]; trickWinner: number | null; trump: Suit; sizePx: number; phase: string;
}) {
  const cardSize = sizePx >= 210 ? 'md' : 'sm';
  const flashKey = trickWinner !== null ? `flash-${trickWinner}` : '';
  const isResolving = phase === 'TRICK_RESOLVING';
  const showingTrick = isResolving || phase === 'PLAYING';

  return (
    <div className="relative flex-shrink-0" style={{ width: sizePx, height: sizePx }}>
      {/* Embossed club medallion */}
      <div className="trick-medallion absolute inset-[10%] rounded-full" />

      {(
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={pandaCrest.url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1024}
            height={1024}
            className={`panda-table-mark w-[72%] h-[72%] object-contain select-none ${trick.length > 0 ? 'panda-table-mark-dim' : ''}`}

          />
        </div>
      )}


      {/* Soft trick win halo */}
      {trickWinner !== null && (
        <div
          key={flashKey}
          className="absolute inset-[12%] rounded-full anim-trick-flash pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(201,162,39,0.10) 0%, rgba(201,162,39,0.03) 45%, transparent 70%)',
            boxShadow: 'inset 0 0 40px rgba(201,162,39,0.06)',
          }}
        />
      )}


      {trick.map(({ seat, card }) => {
        const isWinner = trickWinner === seat;
        const isPartnerCard = seat === PARTNER_SEAT && showingTrick && trickWinner === null;

        // Collect animation: non-winner cards fly toward winner
        const shouldCollect = isResolving && trickWinner !== null && !isWinner;
        let collectStyle: React.CSSProperties = {};
        if (shouldCollect) {
          const [sx, sy] = SEAT_CENTER[seat];
          const [wx, wy] = SEAT_CENTER[trickWinner];
          const tx = Math.round((wx - sx) * sizePx);
          const ty = Math.round((wy - sy) * sizePx);
          collectStyle = {
            '--card-base-tx': BASE_TRANSFORM[seat].includes('X') ? '-50%' : '0%',
            '--card-base-ty': BASE_TRANSFORM[seat].includes('Y') ? '-50%' : '0%',
            '--collect-tx': `${tx}px`,
            '--collect-ty': `${ty}px`,
            '--collect-delay': '0.25s',
          } as React.CSSProperties;
        }

        return (
          <div
            key={card.id}
            className={`absolute ${shouldCollect ? 'card-collecting' : 'anim-play'}`}
            style={{
              ...TRICK_POS[seat],
              ...collectStyle,
              filter: isPartnerCard ? 'drop-shadow(0 0 8px rgba(125,212,160,0.8))' : undefined,
            }}
          >
            <PlayingCard card={card} trump={trump} size={cardSize} isWinner={isWinner} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Void suit computation ────────────────────────────────────

// Returns a map: seat → Set of effective suits that seat is void in
function computeVoids(trickHistory: CompletedTrick[], trump: Suit): Map<number, Set<string>> {
  const voids = new Map<number, Set<string>>();
  for (const trick of trickHistory) {
    if (trick.cards.length === 0) continue;
    const leadEff = effectiveSuit(trick.cards[0].card, trump) as string;
    for (const { seat, card } of trick.cards.slice(1)) {
      const eff = effectiveSuit(card, trump) as string;
      if (eff !== leadEff) {
        if (!voids.has(seat)) voids.set(seat, new Set());
        voids.get(seat)!.add(leadEff);
      }
    }
  }
  return voids;
}

// Small row of void suit symbols
const SUIT_SYM: Record<string, string> = { C: '♣', S: '♠', H: '♥', D: '♦', trump: '★' };
const SUIT_COLOR: Record<string, string> = { C: '#5a9a6a', S: '#7a9ab0', H: '#c06060', D: '#c06060', trump: '#c9a227' };

function VoidBadges({ voidSuits }: { voidSuits: Set<string> }) {
  if (voidSuits.size === 0) return null;
  return (
    <div className="flex items-center gap-[3px]">
      {[...voidSuits].map(suit => (
        <div
          key={suit}
          className="w-[14px] h-[14px] rounded-full border flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${SUIT_COLOR[suit]}55` }}
          title={`Нет ${suit === 'trump' ? 'козырей' : suit}`}
        >
          <span className="text-[7px] leading-none font-bold line-through opacity-70" style={{ color: SUIT_COLOR[suit] }}>
            {SUIT_SYM[suit]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Top opponent ─────────────────────────────────────────────

function TopOpponent({ seat, name, cardCount, isActive, isDealer, jClubOwnerSeat, voidSuits }: {
  seat: number; name: string; cardCount: number;
  isActive: boolean; isDealer: boolean; jClubOwnerSeat: number;
  voidSuits: Set<string>;
}) {
  const visible = Math.min(cardCount, 8);
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <PlayerBadge name={name} isActive={isActive} isDealer={isDealer}
        teamA={teamOf(seat) === 0} hasJClub={jClubOwnerSeat === seat} />
      <VoidBadges voidSuits={voidSuits} />
      <div className="flex">
        {Array.from({ length: visible }, (_, i) => (
          <div key={i} style={{ marginLeft: i === 0 ? 0 : -14 }}>
            <PlayingCard faceDown size="xs" dealIndex={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Side opponent ────────────────────────────────────────────

function SideOpponent({ seat, name, cardCount, isActive, isDealer, trickAreaH, jClubOwnerSeat, voidSuits }: {
  seat: number; name: string; cardCount: number;
  isActive: boolean; isDealer: boolean; trickAreaH: number; jClubOwnerSeat: number;
  voidSuits: Set<string>;
}) {
  const visible = Math.min(cardCount, 5);
  const stackH = visible > 0 ? (visible - 1) * 13 + 48 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 w-[64px] flex-shrink-0">
      <PlayerBadge name={name} isActive={isActive} isDealer={isDealer}
        teamA={teamOf(seat) === 0} hasJClub={jClubOwnerSeat === seat} size="sm" />
      <VoidBadges voidSuits={voidSuits} />
      <div className="relative flex-shrink-0" style={{ width: 32, height: Math.min(stackH, trickAreaH * 0.6) }}>
        {Array.from({ length: visible }, (_, i) => (
          <div key={i} className="absolute" style={{ top: i * 13, left: 0 }}>
            <PlayingCard faceDown size="xs" dealIndex={i} />
          </div>
        ))}
        {cardCount > 5 && (
          <div className="absolute text-[9px] text-[#c9a227] font-bold" style={{ top: 5 * 13 - 2, left: 4 }}>
            +{cardCount - 5}
          </div>
        )}
      </div>
      <span className="text-[#2e4a38] text-[9px] font-medium">{cardCount}</span>
    </div>
  );
}

// Suit display order for hand sorting: trump suits first, then by suit priority
const SUIT_SORT_ORDER: Record<string, number> = { trump: 0, C: 1, S: 2, H: 3, D: 4 };

// Sort hand: permanent trumps first, then trump suit, then non-trumps grouped by suit
function sortHand(hand: Card[], trump: Suit): Card[] {
  return [...hand].sort((a, b) => {
    const effA = effectiveSuit(a, trump) as string;
    const effB = effectiveSuit(b, trump) as string;
    const suitOrder = (SUIT_SORT_ORDER[effA] ?? 9) - (SUIT_SORT_ORDER[effB] ?? 9);
    if (suitOrder !== 0) return suitOrder;
    // Within same effective suit: sort by strength descending (strongest first)
    return cardStrength(b, effA, trump) - cardStrength(a, effA, trump);
  });
}

// ─── Human hand ───────────────────────────────────────────────

function HumanHand({ state, onPlayCard, timeLeft, totalSeconds, jClubOwnerSeat }: {
  state: GameState; onPlayCard: (id: string) => void;
  timeLeft: number | null; totalSeconds: number; jClubOwnerSeat: number;
}) {
  const { hands, currentTrick, trump, currentPlayer, phase } = state;
  const hand = hands[0];
  const isMyTurn = currentPlayer === 0 && phase === 'PLAYING';

  const [hintId, setHintId] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [sorted, setSorted] = useState(false);

  // Clear hint when turn changes
  useEffect(() => {
    setHintId(null);
    setHintUsed(false);
  }, [state.stateVersion]);

  const showHint = useCallback(() => {
    if (!isMyTurn || hintUsed) return;
    const suggested = botChooseCard(state, 0, 'hard');
    setHintId(suggested);
    setHintUsed(true);
    // Auto-clear after 3s
    setTimeout(() => setHintId(null), 3000);
  }, [state, isMyTurn, hintUsed]);

  // Keyboard shortcuts: digit keys 1–N play the N-th legal card, H shows hint
  useEffect(() => {
    if (!isMyTurn) return;
    const legalCards = getLegalMoves(hand, currentTrick, trump);
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        showHint();
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= legalCards.length) {
        onPlayCard(legalCards[n - 1].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMyTurn, hand, currentTrick, trump, onPlayCard, showHint]);

  const legalIds = useMemo(() => {
    if (!isMyTurn) return new Set<string>();
    return new Set(getLegalMoves(hand, currentTrick, trump).map(c => c.id));
  }, [hand, currentTrick, trump, isMyTurn]);

  const displayHand = useMemo(
    () => sorted ? sortHand(hand, trump) : hand,
    [hand, trump, sorted]
  );

  const statusText = isMyTurn ? 'Ваш ход'
    : phase === 'TRICK_RESOLVING' ? 'Взятка...'
    : 'Ход бота...';

  return (
    <div
      className="flex flex-col items-center gap-2 w-full flex-shrink-0"
      style={{ paddingBottom: 'max(10px, var(--safe-bottom))' }}
    >
      {/* Status + timer + hint row */}
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
          isMyTurn
            ? 'bg-[#c9a227]/22 border border-[#c9a227]/55 text-[#c9a227] anim-pulse-gold'
            : 'bg-black/25 border border-white/6 text-[#3a6248]'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isMyTurn ? 'bg-[#c9a227]' : 'bg-[#2a5038]'}`} />
          {statusText}
          {jClubOwnerSeat === 0 && <span className="text-[#c9a227] text-[10px] ml-0.5">♣</span>}
          {state.dealerSeat === 0 && <span className="text-[#6a8a72] text-[8px] ml-0.5">D</span>}
        </div>
        {isMyTurn && timeLeft !== null && <TurnTimer timeLeft={timeLeft} totalSeconds={totalSeconds} />}
        {/* Sort button — always visible */}
        <button
          onClick={() => setSorted(s => !s)}
          title={sorted ? 'Отменить сортировку' : 'Сортировать карты'}
          className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm leading-none transition-all active:scale-90 ${
            sorted
              ? 'bg-[#c9a227]/20 border-[#c9a227]/60 text-[#c9a227]'
              : 'bg-black/40 border-white/10 text-[#3a6248] hover:border-[#c9a227]/30 hover:text-[#c9a227]'
          }`}
        >
          ⇅
        </button>
        {/* Hint button */}
        {isMyTurn && (
          <button
            onClick={showHint}
            disabled={hintUsed}
            title="Подсказка лучшего хода"
            className={`w-8 h-8 flex items-center justify-center rounded-full border text-base leading-none transition-all active:scale-90 ${
              hintUsed
                ? 'bg-black/20 border-white/5 text-[#2e4a36] cursor-default'
                : 'bg-black/40 border-[#c9a227]/30 text-[#c9a227] hover:bg-[#c9a227]/15 hover:border-[#c9a227]/60'
            }`}
          >
            💡
          </button>
        )}
      </div>

      {/* Cards — dynamic overlap, hint card gets green glow */}
      <div className="flex items-end justify-center w-full px-2">
        {(() => {
          // Build an ordered list of legal cards for keyboard shortcut numbering
          const legalList = isMyTurn
            ? getLegalMoves(hand, currentTrick, trump)
            : [];
          const legalIndexMap = new Map(legalList.map((c, idx) => [c.id, idx + 1]));

          return displayHand.map((card, i) => {
            const legal = !isMyTurn || legalIds.has(card.id);
            const overlap = displayHand.length > 6 ? Math.min(32, Math.floor((displayHand.length - 6) * 4 + 18)) : 18;
            const isHint = card.id === hintId;
            const keyNum = legalIndexMap.get(card.id);
            return (
              <div
                key={card.id}
                className="relative"
                style={{
                  marginLeft: i === 0 ? 0 : -overlap,
                  zIndex: isHint ? 50 : i,
                  filter: isHint ? 'drop-shadow(0 0 10px rgba(125,212,160,1)) drop-shadow(0 0 22px rgba(125,212,160,0.6))' : undefined,
                  transform: isHint ? 'translateY(-28px) scale(1.08)' : undefined,
                  transition: 'transform 0.25s ease, filter 0.25s ease',
                }}
              >
                <PlayingCard
                  card={card} trump={trump} isLegal={legal}
                  size="lg" dealIndex={i}
                  onClick={isMyTurn && legal ? () => onPlayCard(card.id) : undefined}
                />
                {/* Keyboard shortcut badge — desktop hint */}
                {keyNum !== undefined && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-[#c9a227]/85 border border-[#c9a227] flex items-center justify-center pointer-events-none select-none z-10">
                    <span className="text-[#0d1a0a] text-[8px] font-black leading-none">{keyNum}</span>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

// ─── Dealing animation overlay ────────────────────────────────

function DealingOverlay() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div className="bg-black/65 backdrop-blur-[2px] px-8 py-4 rounded-2xl border border-[#c9a227]/30 anim-scale-in">
        <div className="flex items-center gap-3">
          <span className="text-[#c9a227] text-2xl anim-pulse-gold select-none">♣</span>
          <span className="text-[#c9a227] text-sm font-semibold tracking-[0.2em] uppercase">Раздача карт</span>
          <span className="text-[#c9a227] text-2xl anim-pulse-gold select-none">♠</span>
        </div>
      </div>
    </div>
  );
}

// ─── In-game menu ─────────────────────────────────────────────

function MenuModal({ onResume, onNewGame }: { onResume: () => void; onNewGame: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 anim-fade-in">
      <div className="bg-[#0f2a18] border border-[#c9a227]/40 rounded-2xl p-7 w-full max-w-xs mx-6 anim-scale-in shadow-2xl text-center">
        <p className="text-[#8aab92] text-[10px] uppercase tracking-widest mb-1">Меню</p>
        <h2 className="text-2xl font-bold text-[#f5edd2] mb-6" style={{ fontFamily: "'Playfair Display',serif" }}>Пауза</h2>
        <div className="flex flex-col gap-3">
          <button onClick={onResume}
            className="w-full py-3.5 rounded-xl bg-[#c9a227] hover:bg-[#e8c455] active:scale-95 text-[#0d1f10] font-bold tracking-wider uppercase transition-all"
            style={{ fontFamily: "'Playfair Display',serif" }}>
            Продолжить
          </button>
          <button onClick={onNewGame}
            className="w-full py-3.5 rounded-xl border border-[#c9a227]/40 hover:border-[#c9a227]/70 active:scale-95 text-[#c9a227] font-bold tracking-wider uppercase transition-all"
            style={{ fontFamily: "'Playfair Display',serif" }}>
            Новая игра
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────

const SIDEBAR_W = 64;

export default function GameTable({ state, isDealing, timeLeft, turnSeconds, tableTheme, onPlayCard, onNextRound, onNewMatch }: {
  state: GameState;
  isDealing: boolean;
  timeLeft: number | null;
  turnSeconds: number;
  tableTheme: string;
  onPlayCard: (cardId: string) => void;
  onNextRound: () => void;
  onNewMatch: () => void;
}) {
  const { playerNames, dealerSeat, currentPlayer, phase, currentTrick, trickWinner, trump, jClubOwnerSeat } = state;
  const active = (s: number) => currentPlayer === s && phase === 'PLAYING';
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);

  const calcTrickSize = () => Math.min(
    window.innerWidth - SIDEBAR_W * 2 - 8,
    window.innerHeight - 320,
    260
  );
  const [trickSize, setTrickSize] = useState(calcTrickSize);
  useEffect(() => {
    const onResize = () => setTrickSize(calcTrickSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const tableClass = themeClass(tableTheme);

  const voids = useMemo(
    () => computeVoids(state.trickHistory ?? [], trump),
    [state.trickHistory, trump]
  );

  // Trick points toast
  const [trickToast, setTrickToast] = useState<{ winnerName: string; points: number; teamA: boolean } | null>(null);
  const prevTrickCount = useRef(state.trickHistory?.length ?? 0);
  useEffect(() => {
    const count = state.trickHistory?.length ?? 0;
    if (count > prevTrickCount.current && state.trickHistory.length > 0) {
      const last = state.trickHistory[state.trickHistory.length - 1];
      setTrickToast({
        winnerName: state.playerNames[last.winnerSeat],
        points: last.points,
        teamA: teamOf(last.winnerSeat) === 0,
      });
      const id = setTimeout(() => setTrickToast(null), 2200);
      prevTrickCount.current = count;
      return () => clearTimeout(id);
    }
    prevTrickCount.current = count;
  }, [state.trickHistory, state.playerNames]);

  return (
    <div className={`club-table w-full h-full ${tableClass} table-frame flex flex-col overflow-hidden relative`}>

      {/* Score bar with menu button */}
      <div className="relative flex-shrink-0">
        <ScoreBar state={state} />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
          style={{ marginTop: 'calc(var(--safe-top) / 2)' }}
        >
          {(state.eyesHistory?.length ?? 0) > 0 && (
            <button
              onClick={() => setChartOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all"
              title="График матча"
            >
              <span className="text-sm leading-none">📈</span>
            </button>
          )}
          {(state.trickHistory?.length ?? 0) > 0 && (
            <button
              onClick={() => setHistoryOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all"
              title="История взяток"
            >
              <span className="text-sm leading-none">🃏</span>
              <span className="absolute -top-0.5 -right-0.5 w-[14px] h-[14px] rounded-full bg-[#c9a227] text-[#0d1f10] text-[8px] font-bold flex items-center justify-center leading-none">
                {state.trickHistory.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all"
          >
            <span className="text-lg leading-none">≡</span>
          </button>
        </div>
      </div>

      {/* Table body — keyed to roundNumber so opponents remount (dealing anim) */}
      <div key={state.roundNumber} className="tournament-felt flex-1 flex flex-col min-h-0 overflow-hidden relative">

        {/* Top opponent */}
        <div className="flex justify-center flex-shrink-0">
          <TopOpponent seat={2} name={playerNames[2]} cardCount={state.hands[2].length}
            isActive={active(2)} isDealer={dealerSeat === 2} jClubOwnerSeat={jClubOwnerSeat}
            voidSuits={voids.get(2) ?? new Set()} />
        </div>

        {/* Middle: left | trick | right */}
        <div className="flex-1 flex items-center justify-center gap-1 min-h-0 px-1">
          <SideOpponent seat={3} name={playerNames[3]} cardCount={state.hands[3].length}
            isActive={active(3)} isDealer={dealerSeat === 3}
            trickAreaH={trickSize} jClubOwnerSeat={jClubOwnerSeat}
            voidSuits={voids.get(3) ?? new Set()} />

          <div className="flex-1 flex items-center justify-center">
            <TrickArea trick={currentTrick} trickWinner={trickWinner} trump={trump} sizePx={trickSize} phase={phase} />
          </div>

          <SideOpponent seat={1} name={playerNames[1]} cardCount={state.hands[1].length}
            isActive={active(1)} isDealer={dealerSeat === 1}
            trickAreaH={trickSize} jClubOwnerSeat={jClubOwnerSeat}
            voidSuits={voids.get(1) ?? new Set()} />
        </div>

        {/* Human hand */}
        <div className="flex justify-center flex-shrink-0">
          <HumanHand state={state} onPlayCard={onPlayCard}
            timeLeft={timeLeft} totalSeconds={turnSeconds} jClubOwnerSeat={jClubOwnerSeat} />
        </div>
      </div>

      {/* Dealing overlay */}
      {isDealing && <DealingOverlay />}

      {/* Overlays */}
      {phase === 'ROUND_END' && state.lastRoundResult && (
        <RoundResultOverlay result={state.lastRoundResult} state={state} onNext={onNextRound} />
      )}
      {phase === 'MATCH_END' && (
        <MatchResultOverlay state={state} onNewMatch={onNewMatch} />
      )}
      {menuOpen && (
        <MenuModal
          onResume={() => setMenuOpen(false)}
          onNewGame={() => { setMenuOpen(false); onNewMatch(); }}
        />
      )}
      {historyOpen && (
        <TrickHistoryModal
          history={state.trickHistory ?? []}
          trump={state.trump}
          playerNames={state.playerNames}
          onClose={() => setHistoryOpen(false)}
        />
      )}
      {chartOpen && (
        <MatchChartModal
          history={state.eyesHistory ?? []}
          currentEyes={state.eyes}
          playerNames={state.playerNames}
          onClose={() => setChartOpen(false)}
        />
      )}

      {/* Trick points toast */}
      {trickToast && (
        <div
          key={state.trickHistory?.length}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none anim-trick-toast"
        >
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-2xl ${
            trickToast.teamA
              ? 'bg-[#0a2a14]/90 border-[#7dd4a0]/40'
              : 'bg-[#2a0a0a]/90 border-[#d47d7d]/40'
          }`}>
            <span className="text-lg leading-none">
              {trickToast.points > 0 ? '★' : '·'}
            </span>
            <div className="flex flex-col leading-none gap-0.5">
              <span
                className="text-[10px] font-bold"
                style={{ color: trickToast.teamA ? '#7dd4a0' : '#d47d7d' }}
              >
                {trickToast.winnerName}
              </span>
              <span className="text-[#c9a227] text-[11px] font-black">
                {trickToast.points > 0 ? `+${trickToast.points} очков` : 'взятка (0 оч.)'}
              </span>
            </div>
          </div>
        </div>
      )}

      <StickerBar />
    </div>
  );
}

function StickerBar() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<{ icon: string; key: number } | null>(null);
  const cosmetics = useMemo(() => loadCosmetics(), []);
  const icons = cosmetics.ownedStickers.map(id => stickerById(id));

  if (icons.length === 0) return null;

  return (
    <div className="absolute left-3 bottom-24 z-40 flex flex-col items-start gap-2">
      {shown && (
        <div key={shown.key} className="sticker-pop text-4xl pointer-events-none absolute -top-14 left-2">
          {shown.icon}
        </div>
      )}
      {open && (
        <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-black/70 border border-[#c9a227]/30">
          {icons.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setShown({ icon: s.icon, key: Date.now() });
                setOpen(false);
                setTimeout(() => setShown(null), 1700);
              }}
              className="text-2xl leading-none active:scale-90 transition-transform"
            >
              {s.icon}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-lg active:scale-90 transition-all"
        title="Стикеры"
      >
        {open ? '✕' : '😀'}
      </button>
    </div>
  );
}

