import { useState, useEffect } from 'react';
import type { CompletedTrick, Suit } from '../game/types';
import { teamOf } from '../game/engine';
import PlayingCard, { SUIT_SYMBOL, SUIT_IS_RED } from './PlayingCard';

interface Props {
  history: CompletedTrick[];
  trump: Suit;
  playerNames: [string, string, string, string];
  onClose: () => void;
}

// ── Compass positions for the replay view ─────────────────────

const REPLAY_POS: Record<number, React.CSSProperties> = {
  0: { bottom: '4%',  left: '50%',  transform: 'translateX(-50%)' },
  1: { top:  '50%',  right: '4%', transform: 'translateY(-50%)' },
  2: { top:   '4%',  left: '50%',  transform: 'translateX(-50%)' },
  3: { top:  '50%',  left:  '4%', transform: 'translateY(-50%)' },
};

const SEAT_ARROW: Record<number, string> = { 0: '▼', 1: '▶', 2: '▲', 3: '◀' };

// ── Inline replay ─────────────────────────────────────────────

function TrickReplay({ trick, trump, playerNames, onDone }: {
  trick: CompletedTrick;
  trump: Suit;
  playerNames: [string, string, string, string];
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const done = step >= trick.cards.length;

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setStep(s => s + 1), 520);
    return () => clearTimeout(id);
  }, [step, done]);

  const visibleCards = trick.cards.slice(0, step);
  const pendingSeats = trick.cards.slice(step).map(tc => tc.seat);

  return (
    <div className="fixed inset-0 bg-black/92 z-[60] flex flex-col items-center justify-center gap-5 anim-fade-in">
      <p className="text-[#4a6a52] text-[10px] uppercase tracking-widest">
        Взятка {trick.trickNumber}
      </p>

      {/* Compass layout */}
      <div className="relative w-64 h-64">
        <div className="absolute inset-[20%] rounded-full border border-[#c9a227]/15 bg-black/30" />

        {/* Pending ghost slots */}
        {pendingSeats.map(seat => (
          <div
            key={`ghost-${seat}`}
            className="absolute w-10 h-[58px] rounded-lg border border-dashed border-[#2a4a32]/40"
            style={REPLAY_POS[seat]}
          />
        ))}

        {/* Played cards */}
        {visibleCards.map(({ seat, card }) => {
          const isWinner = seat === trick.winnerSeat;
          return (
            <div
              key={card.id}
              className="absolute anim-play"
              style={{
                ...REPLAY_POS[seat],
                filter: isWinner && done
                  ? 'drop-shadow(0 0 10px rgba(201,162,39,0.9))'
                  : undefined,
              }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-[#3a5a42]">
                {SEAT_ARROW[seat]}
              </div>
              <PlayingCard card={card} trump={trump} size="sm" isWinner={isWinner && done} />
            </div>
          );
        })}
      </div>

      {/* Player labels */}
      <div className="flex gap-3 flex-wrap justify-center">
        {trick.cards.map(({ seat }) => {
          const shown = visibleCards.some(vc => vc.seat === seat);
          const isWinner = seat === trick.winnerSeat;
          return (
            <span
              key={seat}
              className="text-[10px] font-semibold transition-opacity"
              style={{
                color: isWinner ? '#c9a227' : teamOf(seat) === 0 ? '#7dd4a0' : '#d47d7d',
                opacity: shown ? 1 : 0.25,
              }}
            >
              {isWinner && done ? '★ ' : ''}{playerNames[seat]}
            </span>
          );
        })}
      </div>

      {done && trick.points > 0 && (
        <div className="bg-[#c9a227]/15 border border-[#c9a227]/40 rounded-full px-4 py-1.5 anim-scale-in">
          <span className="text-[#c9a227] text-sm font-bold">
            +{trick.points} очков → {playerNames[trick.winnerSeat]}
          </span>
        </div>
      )}

      <button
        onClick={onDone}
        className="mt-1 px-6 py-2.5 rounded-xl border border-[#c9a227]/30 text-[#6a8a72] hover:text-[#c9a227] text-[11px] uppercase tracking-wider transition-all active:scale-95"
      >
        {done ? 'Закрыть' : 'Пропустить'}
      </button>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────

export default function TrickHistoryModal({ history, trump, playerNames, onClose }: Props) {
  const trumpSym = SUIT_SYMBOL[trump];
  const trumpRed = SUIT_IS_RED[trump];
  const [replayTrick, setReplayTrick] = useState<CompletedTrick | null>(null);

  return (
    <>
      <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center anim-fade-in">
        <div
          className="bg-[#0c2016] border border-[#c9a227]/30 rounded-t-3xl w-full max-w-sm anim-slide-up shadow-2xl flex flex-col"
          style={{ maxHeight: '82dvh', paddingBottom: 'max(20px, var(--safe-bottom))' }}
        >
          {/* Handle + header */}
          <div className="flex-shrink-0 pt-3 pb-1 flex flex-col items-center">
            <div className="w-10 h-1 rounded-full bg-[#c9a227]/25 mb-3" />
            <div className="flex items-center justify-between w-full px-5 pb-3 border-b border-white/5">
              <div>
                <p className="text-[#4a6a52] text-[9px] uppercase tracking-widest">Раунд</p>
                <h2 className="text-base font-bold text-[#f5edd2]" style={{ fontFamily: "'Playfair Display',serif" }}>
                  История взяток
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#c9a227]/12 border border-[#c9a227]/25 rounded-full px-2.5 py-1">
                  <span className={`text-sm ${trumpRed ? 'text-[#d45c50]' : 'text-[#ccd8e4]'}`}>{trumpSym}</span>
                  <span className="text-[#8a6a10] text-[9px]">козырь</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-white/8 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all text-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <p className="text-[#2a4a32] text-[9px] mt-2">Нажмите на взятку, чтобы воспроизвести ▶</p>
          </div>

          {/* Trick list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {history.length === 0 && (
              <div className="text-center py-10">
                <p className="text-[#2e4a36] text-sm">Взяток ещё нет</p>
              </div>
            )}
            {[...history].reverse().map(trick => {
              const winTeam = teamOf(trick.winnerSeat);
              const winnerName = playerNames[trick.winnerSeat];
              const teamColor = winTeam === 0 ? '#7dd4a0' : '#d47d7d';

              return (
                <button
                  key={trick.trickNumber}
                  className="w-full text-left bg-black/30 border border-white/5 rounded-2xl p-3 hover:border-[#c9a227]/25 hover:bg-black/40 active:scale-[0.98] transition-all"
                  onClick={() => setReplayTrick(trick)}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#3a5a42] text-[10px] uppercase tracking-wider font-semibold">
                        Взятка {trick.trickNumber}
                      </span>
                      <span className="text-[#c9a227]/35 text-[8px]">▶</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trick.points > 0 && (
                        <span className="text-[#c9a227] text-[10px] font-bold bg-[#c9a227]/10 px-2 py-0.5 rounded-full">
                          +{trick.points} оч.
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <div className="w-[5px] h-[5px] rounded-full" style={{ background: teamColor }} />
                        <span className="text-[10px] font-semibold" style={{ color: teamColor }}>
                          {winnerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-end">
                    {trick.cards.map(({ seat, card }) => {
                      const isWinner = seat === trick.winnerSeat;
                      return (
                        <div key={card.id} className="flex flex-col items-center gap-1">
                          <div className={isWinner ? 'relative' : ''}>
                            <PlayingCard card={card} trump={trump} size="xs" isWinner={isWinner} />
                            {isWinner && (
                              <div
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-[#0c2016] flex items-center justify-center"
                                style={{ background: '#c9a227', fontSize: 7 }}
                              >
                                ★
                              </div>
                            )}
                          </div>
                          <span
                            className="text-[8px] font-medium truncate max-w-[32px] text-center leading-tight"
                            style={{ color: teamOf(seat) === 0 ? '#7dd4a0' : '#d47d7d' }}
                          >
                            {playerNames[seat]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {replayTrick && (
        <TrickReplay
          trick={replayTrick}
          trump={trump}
          playerNames={playerNames}
          onDone={() => setReplayTrick(null)}
        />
      )}
    </>
  );
}
