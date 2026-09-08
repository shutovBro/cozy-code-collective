import { useEffect, useMemo, useState } from 'react';
import type { GameState, RoundResult, Suit } from '../game/types';
import { teamOf } from '../game/engine';

// ─── Confetti ─────────────────────────────────────────────────

const CONFETTI_COLORS = ['#c9a227', '#7dd4a0', '#f5edd2', '#e8c455', '#d45c50', '#6ab5e8'];

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    fallDur: `${1.8 + Math.random() * 1.6}s`,
    swayDur: `${1.2 + Math.random() * 1}s`,
    delay: `${Math.random() * 0.9}s`,
    rotate: Math.random() > 0.5 ? 'rounded-full' : '',
    size: Math.random() > 0.6 ? 12 : 8,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.rotate}`}
          style={{
            left: p.left,
            background: p.color,
            width: p.size,
            height: p.size,
            '--fall-dur': p.fallDur,
            '--sway-dur': p.swayDur,
            '--fall-delay': p.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

const SUIT_SYMBOL: Record<Suit, string> = { C: '♣', S: '♠', H: '♥', D: '♦' };
const SUIT_IS_RED: Record<Suit, boolean> = { C: false, S: false, H: true, D: true };

function EyeDots({ total, filled, delta, teamA }: {
  total?: number; filled: number; delta: number; teamA: boolean;
}) {
  const cap = total ?? 12;
  const prevFilled = filled - delta;
  const color = teamA ? '#7dd4a0' : '#d47d7d';
  const newColor = teamA ? '#c9a227' : '#f5a623';
  return (
    <div className="flex flex-wrap gap-[4px]">
      {Array.from({ length: cap }, (_, i) => {
        const wasOn = i < prevFilled;
        const isNew = i >= prevFilled && i < filled;
        return (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all"
            style={{
              background: isNew ? newColor : wasOn ? color : 'rgba(255,255,255,0.07)',
              boxShadow: isNew ? `0 0 6px ${newColor}` : 'none',
              border: isNew ? `1px solid ${newColor}` : wasOn ? `1px solid ${color}60` : '1px solid rgba(255,255,255,0.08)',
            }}
          />
        );
      })}
    </div>
  );
}

function BonusBadge({ text, explain }: { text: string; explain: string }) {
  const isGolaya = text.includes('ГОЛАЯ');
  const isEgg = text.includes('ЯЙЦО') || text.includes('Яйцо');
  const isSpaas = text.includes('СПАС');
  const isClub = text.includes('Туз Треф');

  const bg = isGolaya ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
    : isEgg ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
    : isSpaas ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
    : isClub ? 'bg-[#c9a227]/20 border-[#c9a227]/50 text-[#c9a227]'
    : 'bg-white/10 border-white/20 text-[#c8dac9]';

  const icon = isGolaya ? '🔥' : isEgg ? '🥚' : isSpaas ? '🛡️' : isClub ? '♣' : '✦';

  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-sm font-bold">{text}</span>
      </div>
      <p className="text-[10px] opacity-70 leading-snug">{explain}</p>
    </div>
  );
}

function bonusExplain(b: string): string {
  if (b.includes('ГОЛАЯ')) return 'Одна команда взяла все 120 очков — мгновенная победа в матче!';
  if (b.includes('ЯЙЦО')) return 'Счёт 60:60 — очки не начисляются, следующий раунд удвоен (+4 очи победителю)';
  if (b.includes('Яйцо')) return 'Яичный раунд: победитель получает +4 очи сразу';
  if (b.includes('СПАС')) return 'Проигравшая команда набрала менее 30 очков — Спас! Победители получают бонус';
  if (b.includes('Туз Треф')) return 'Команда без J♣ (Туза Треф) автоматически получает +1 очко';
  return '';
}

// ─── Round Result ─────────────────────────────────────────────

interface RoundResultProps {
  result: RoundResult;
  state: GameState;
  onNext: () => void;
}

export function RoundResultOverlay({ result, state, onNext }: RoundResultProps) {
  const { playerNames, tricksWon, jClubOwnerSeat, trump, eyes, dealerSeat } = state;
  const prevEyes: [number, number] = [
    eyes[0] - result.eyesDelta[0],
    eyes[1] - result.eyesDelta[1],
  ];

  const teamA = [0, 2];
  const teamB = [1, 3];

  const title = result.golaya ? '🔥 ГОЛАЯ!'
    : result.eggTriggered ? '🥚 ЯЙЦО!'
    : 'Итоги раунда';

  const trumpSym = SUIT_SYMBOL[trump];
  const trumpRed = SUIT_IS_RED[trump];

  return (
    <div className="absolute inset-0 bg-black/75 flex items-end justify-center z-50 anim-fade-in overflow-y-auto">
      <div
        className="bg-[#0c2016] border border-[#c9a227]/35 rounded-t-3xl w-full max-w-sm anim-slide-up shadow-2xl"
        style={{ paddingBottom: 'max(28px, calc(var(--safe-bottom) + 20px))' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#c9a227]/30" />
        </div>

        {/* Header */}
        <div className="text-center px-6 pt-2 pb-4 border-b border-white/5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`text-lg ${trumpRed ? 'text-[#d45c50]' : 'text-[#ccd8e4]'}`}>{trumpSym}</span>
            <p className="text-[#8aab92] text-[10px] tracking-widest uppercase">Раунд {result.roundNumber}</p>
            <span className={`text-lg ${trumpRed ? 'text-[#d45c50]' : 'text-[#ccd8e4]'}`}>{trumpSym}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#f5edd2]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title}
          </h2>
        </div>

        <div className="px-5 pt-4 space-y-4">

          {/* Teams score cards */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { seats: teamA, teamIdx: 0, color: '#7dd4a0', label: 'Наша команда' },
              { seats: teamB, teamIdx: 1, color: '#d47d7d', label: 'Их команда' },
            ] as const).map(({ seats, teamIdx, color, label }) => (
              <div key={teamIdx} className="bg-black/30 border border-white/6 rounded-2xl p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color }}>
                  {label}
                </p>
                {/* Points */}
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {result.points[teamIdx]}
                  </span>
                  <span className="text-[#4a6a52] text-xs pb-1">/120</span>
                </div>
                <p className="text-[#4a6a52] text-[9px] mb-3">{tricksWon[teamIdx]} взят. из 8</p>

                {/* Player rows */}
                {seats.map(seat => {
                  const isJclub = jClubOwnerSeat === seat;
                  const isDealer = dealerSeat === seat;
                  return (
                    <div key={seat} className="flex items-center justify-between py-[3px]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[#c8dac9] text-[10px] truncate max-w-[60px]">{playerNames[seat]}</span>
                        {isJclub && <span className="text-[#c9a227] text-[9px]">♣</span>}
                        {isDealer && <span className="text-[#6a8a72] text-[9px]">D</span>}
                      </div>
                    </div>
                  );
                })}

                {/* Eyes delta */}
                {result.eyesDelta[teamIdx] > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[#c9a227] text-base font-bold leading-none">+{result.eyesDelta[teamIdx]}</span>
                    <span className="text-[#7a6020] text-[10px]">оч.</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Eyes progress */}
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-3">
            <p className="text-[#4a6a52] text-[9px] uppercase tracking-widest text-center mb-2">Прогресс очей</p>
            {([
              { label: `${playerNames[0]} + ${playerNames[2]}`, teamIdx: 0 as 0|1 },
              { label: `${playerNames[1]} + ${playerNames[3]}`, teamIdx: 1 as 0|1 },
            ]).map(({ label, teamIdx }) => (
              <div key={teamIdx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium" style={{ color: teamIdx === 0 ? '#7dd4a0' : '#d47d7d' }}>
                    {label}
                  </span>
                  <span className="text-[10px] text-[#8aab92]">
                    {prevEyes[teamIdx]} → <span className="text-[#c9a227] font-bold">{eyes[teamIdx]}</span>/12
                  </span>
                </div>
                <EyeDots
                  filled={eyes[teamIdx]}
                  delta={result.eyesDelta[teamIdx]}
                  teamA={teamIdx === 0}
                />
              </div>
            ))}
          </div>

          {/* Bonuses */}
          {result.bonuses.length > 0 && (
            <div className="space-y-2">
              {result.bonuses.map((b, i) => (
                <BonusBadge key={i} text={b} explain={bonusExplain(b)} />
              ))}
            </div>
          )}

          {/* Next button */}
          <button
            onClick={onNext}
            className="w-full py-3.5 rounded-xl bg-[#c9a227] hover:bg-[#e8c455] active:scale-95 text-[#0d1f10] font-bold tracking-wider uppercase transition-all mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {result.matchWinner !== null ? 'Смотреть итоги матча' : 'Следующий раунд'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Match Result ─────────────────────────────────────────────

interface MatchResultProps {
  state: GameState;
  onNewMatch: () => void;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ResultEmblem({ won }: { won: boolean }) {
  const gold = '#c9a227';
  const dim = '#7f8f84';
  const c = won ? gold : dim;

  return (
    <div className="relative mx-auto mb-4 w-32 h-32 flex items-center justify-center">
      {/* halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: won
            ? 'radial-gradient(circle, rgba(201,162,39,0.30) 0%, rgba(201,162,39,0) 68%)'
            : 'radial-gradient(circle, rgba(212,125,125,0.16) 0%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* rotating rays (win only) */}
      {won && (
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full emblem-rays opacity-40">
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x="99" y="6" width="2" height="46" rx="1"
              fill={gold}
              opacity={i % 2 ? 0.35 : 0.8}
              transform={`rotate(${i * 22.5} 100 100)`}
            />
          ))}
        </svg>
      )}

      {/* pulsing rings */}
      {[0, 1].map(i => (
        <span
          key={i}
          className="absolute w-24 h-24 rounded-full border emblem-ring"
          style={{ borderColor: won ? 'rgba(201,162,39,.5)' : 'rgba(212,125,125,.35)', animationDelay: `${i * 1.3}s` }}
        />
      ))}

      {/* sparks */}
      {won && [0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="absolute bottom-3 w-1.5 h-1.5 rounded-full emblem-spark"
          style={{
            left: `${18 + i * 16}%`,
            background: i % 2 ? '#f5edd2' : gold,
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}

      {/* main mark */}
      <svg
        viewBox="0 0 64 64"
        className={`relative w-20 h-20 ${won ? 'emblem-win' : 'emblem-lose'}`}
        fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      >
        {won ? (
          <>
            <path d="M20 10h24v12a12 12 0 0 1-24 0V10z" fill="rgba(201,162,39,0.18)" />
            <path d="M20 13h-6a8 8 0 0 0 8 8" />
            <path d="M44 13h6a8 8 0 0 1-8 8" />
            <path d="M32 34v8" />
            <path d="M24 50h16l-2-8H26l-2 8z" fill="rgba(201,162,39,0.14)" />
            <path d="M20 54h24" />
            <path d="M32 16l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7L32 16z" fill={gold} stroke="none" />
          </>
        ) : (
          <>
            <path d="M32 8l20 7v16c0 12-8.5 21-20 25C20.5 52 12 43 12 31V15l20-7z" fill="rgba(212,125,125,0.10)" stroke="#d47d7d" />
            <path d="M32 8v48" stroke="rgba(212,125,125,0.55)" strokeDasharray="4 5" />
            <path d="M25 26l7 8-5 4 6 6" stroke="#d47d7d" />
          </>
        )}
      </svg>
    </div>
  );
}

export function MatchResultOverlay({ state, onNewMatch }: MatchResultProps) {
  const { matchWinner, eyes, playerNames, lastRoundResult: result } = state;
  const playerWon = matchWinner === 0;

  const scoreA = useCountUp(eyes[0]);
  const scoreB = useCountUp(eyes[1]);
  const counted = [scoreA, scoreB];

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex items-end justify-center z-50 anim-fade-in overflow-y-auto">
      {playerWon && <Confetti />}
      <div
        className="relative overflow-hidden border border-[#c9a227]/50 rounded-t-3xl w-full max-w-sm anim-slide-up text-center"
        style={{
          paddingBottom: 'max(32px, calc(var(--safe-bottom) + 24px))',
          background: playerWon
            ? 'radial-gradient(120% 80% at 50% 0%, #16351f 0%, #0c2016 55%, #081710 100%)'
            : 'radial-gradient(120% 80% at 50% 0%, #22161a 0%, #0e1a15 55%, #081710 100%)',
          boxShadow: '0 -18px 60px rgba(0,0,0,0.65)',
        }}
      >
        {/* top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${playerWon ? '#e8c455' : '#d47d7d'}, transparent)` }}
        />

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#c9a227]/30" />
        </div>

        <div className="px-6 pt-4 pb-2">
          <ResultEmblem won={playerWon} />

          <p className="text-[#8aab92] text-[10px] tracking-[0.28em] uppercase mb-2">Матч завершён</p>
          <h2
            className="text-4xl font-bold mb-2 title-shine"
            style={{ fontFamily: "'Playfair Display', serif", color: playerWon ? '#c9a227' : '#d47d7d' }}
          >
            {playerWon ? 'Победа!' : 'Поражение'}
          </h2>
          <p className="text-[#8aab92] text-sm mb-6">
            {playerWon
              ? `${playerNames[0]} и ${playerNames[2]} победили!`
              : `${playerNames[1]} и ${playerNames[3]} победили`}
          </p>

          {/* Final score */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {([
              { label: `${playerNames[0]} + ${playerNames[2]}`, teamIdx: 0 as 0|1, color: '#7dd4a0' },
              { label: `${playerNames[1]} + ${playerNames[3]}`, teamIdx: 1 as 0|1, color: '#d47d7d' },
            ]).map(({ label, teamIdx, color }) => {
              const isWinner = matchWinner === teamIdx;
              return (
                <div
                  key={teamIdx}
                  className="relative rounded-2xl p-4 border transition-all"
                  style={{
                    background: isWinner
                      ? `linear-gradient(180deg, ${color}1f, rgba(0,0,0,0.35))`
                      : 'rgba(0,0,0,0.32)',
                    borderColor: isWinner ? `${color}66` : 'rgba(255,255,255,0.06)',
                    boxShadow: isWinner ? `0 8px 26px ${color}22` : 'none',
                  }}
                >
                  {isWinner && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-[2px] rounded-full text-[8px] font-bold uppercase tracking-widest"
                      style={{ background: color, color: '#0b1a12' }}
                    >
                      Победа
                    </span>
                  )}
                  <p className="text-[10px] font-medium mb-2 truncate" style={{ color }}>{label}</p>
                  <p
                    className="text-5xl font-bold text-white leading-none tabular-nums"
                    style={{ fontFamily: "'Playfair Display', serif", textShadow: `0 0 22px ${color}55` }}
                  >
                    {counted[teamIdx]}
                  </p>
                  <p className="text-[#4a6a52] text-[10px] mt-1">из 12 очей</p>
                  <div className="flex flex-wrap gap-[3px] mt-2 justify-center">
                    {Array.from({ length: 12 }, (_, i) => {
                      const on = i < eyes[teamIdx];
                      return (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full ${on ? 'dot-pop' : ''}`}
                          style={{
                            background: on ? color : 'rgba(255,255,255,0.07)',
                            boxShadow: on ? `0 0 8px ${color}88` : 'none',
                            animationDelay: on ? `${0.35 + i * 0.06}s` : undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {result?.golaya && (
            <div className="bg-orange-500/15 border border-orange-500/40 rounded-xl p-3 mb-5">
              <p className="text-orange-300 text-sm font-semibold">Голая — мгновенная победа!</p>
              <p className="text-orange-400/70 text-[10px] mt-0.5">Все 120 очков взяты одной командой</p>
            </div>
          )}

          <button
            onClick={onNewMatch}
            className="btn-gold w-full py-4 rounded-2xl text-[#0d1f10] font-bold tracking-[0.15em] uppercase transition-all active:scale-[0.98]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Новый матч
          </button>
        </div>
      </div>
    </div>
  );
}
