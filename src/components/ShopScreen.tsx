import { useState } from 'react';
import type { MatchStats } from '../game/stats';
import {
  CARD_BACKS, TABLE_THEMES, STICKERS, COLLECTION,
  themeClass, type Cosmetics,
} from '../game/cosmetics';

interface Props {
  onBack: () => void;
  tableTheme?: string;
  stats: MatchStats;
  cosmetics: Cosmetics;
  onCosmetics: (c: Cosmetics) => void;
  onTableTheme: (id: string) => void;
}

const TABS = [
  { id: 'backs', label: 'Рубашки', icon: '🃏' },
  { id: 'themes', label: 'Темы стола', icon: '🎨' },
  { id: 'stickers', label: 'Стикеры', icon: '😀' },
  { id: 'collection', label: 'Коллекция', icon: '🏅' },
];

function ProgressBar({ cur, goal }: { cur: number; goal: number }) {
  return (
    <div className="w-full h-1 rounded-full bg-black/50 overflow-hidden">
      <div
        className="h-full bg-[#c9a227]/70"
        style={{ width: `${Math.min(100, (cur / goal) * 100)}%` }}
      />
    </div>
  );
}

export default function ShopScreen({
  onBack, tableTheme, stats, cosmetics, onCosmetics, onTableTheme,
}: Props) {
  const [tab, setTab] = useState('backs');
  const [toast, setToast] = useState<string | null>(null);
  const tableClass = themeClass(tableTheme);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const chooseBack = (id: string, unlocked: boolean, name: string) => {
    if (!unlocked) return;
    onCosmetics({ ...cosmetics, cardBack: id });
    flash(`Рубашка «${name}» применена`);
  };

  const chooseTheme = (id: string, unlocked: boolean, name: string) => {
    if (!unlocked) return;
    onTableTheme(id);
    flash(`Тема «${name}» применена`);
  };

  const toggleSticker = (id: string, unlocked: boolean, name: string) => {
    if (!unlocked) return;
    const owned = cosmetics.ownedStickers.includes(id)
      ? cosmetics.ownedStickers.filter(s => s !== id)
      : [...cosmetics.ownedStickers, id].slice(-6);
    onCosmetics({ ...cosmetics, ownedStickers: owned, sticker: id });
    flash(owned.includes(id) ? `«${name}» в быстрой панели` : `«${name}» убран из панели`);
  };

  return (
    <div
      className={`w-full h-full ${tableClass} table-frame flex flex-col overflow-hidden relative`}
      style={{
        paddingTop: 'max(16px, var(--safe-top))',
        paddingBottom: 'max(20px, var(--safe-bottom))',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pb-4 border-b border-[#c9a227]/12 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/8 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all text-xl leading-none"
        >
          ‹
        </button>
        <div>
          <p className="text-[#4a6a52] text-[9px] uppercase tracking-widest">БЕЛКА</p>
          <h1 className="text-lg font-bold text-[#f5edd2]" style={{ fontFamily: "'Playfair Display',serif" }}>
            Магазин
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 pt-4 overflow-x-auto flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              tab === t.id
                ? 'bg-[#c9a227]/18 border-[#c9a227]/55 text-[#c9a227]'
                : 'bg-black/25 border-white/6 text-[#6a8a72] hover:border-white/12'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === 'backs' && (
          <div className="grid grid-cols-2 gap-3">
            {CARD_BACKS.map((b) => {
              const unlocked = b.check(stats);
              const active = cosmetics.cardBack === b.id;
              const p = b.progress(stats);
              return (
                <button
                  key={b.id}
                  onClick={() => chooseBack(b.id, unlocked, b.name)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all active:scale-95 ${
                    !unlocked
                      ? 'bg-black/20 border-white/6 opacity-60'
                      : active
                        ? 'bg-[#c9a227]/14 border-[#c9a227]/70'
                        : 'bg-black/30 border-[#c9a227]/25'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 text-[#c9a227] text-xs">✓</span>
                  )}
                  <div
                    className="w-12 h-16 rounded-lg border-2 border-white/10 shadow-lg"
                    style={{ background: b.preview }}
                  />
                  <p className={`text-xs font-semibold ${unlocked ? 'text-[#f5edd2]' : 'text-[#4a6a52]'}`}>
                    {b.name}
                  </p>
                  {unlocked ? (
                    <span className="text-[10px] text-[#7dd4a0]">{active ? 'Выбрана' : 'Применить'}</span>
                  ) : (
                    <div className="w-full space-y-1">
                      <span className="text-[10px] text-[#c9a227] block">🔒 {b.desc}</span>
                      <ProgressBar cur={p.cur} goal={p.goal} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {tab === 'themes' && (
          <div className="grid grid-cols-2 gap-3">
            {TABLE_THEMES.map((t) => {
              const unlocked = t.check(stats);
              const active = tableTheme === t.id;
              const p = t.progress(stats);
              return (
                <button
                  key={t.id}
                  onClick={() => chooseTheme(t.id, unlocked, t.name)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-95 ${
                    !unlocked
                      ? 'bg-black/20 border-white/6 opacity-60'
                      : active
                        ? 'bg-[#c9a227]/14 border-[#c9a227]/70'
                        : 'bg-black/30 border-[#c9a227]/25'
                  }`}
                >
                  {active && <span className="absolute top-2 right-2 text-[#c9a227] text-xs">✓</span>}
                  <div className="w-full h-16 rounded-lg border border-white/10" style={{ background: t.bg }} />
                  <p className={`text-xs font-semibold ${unlocked ? 'text-[#f5edd2]' : 'text-[#4a6a52]'}`}>
                    {t.name}
                  </p>
                  {unlocked ? (
                    <span className="text-[10px] text-[#7dd4a0]">{active ? 'Выбрана' : 'Применить'}</span>
                  ) : (
                    <div className="w-full space-y-1">
                      <span className="text-[10px] text-[#c9a227] block">🔒 {t.desc}</span>
                      <ProgressBar cur={p.cur} goal={p.goal} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {tab === 'stickers' && (
          <>
            <p className="text-[10px] text-[#6a8a72] mb-3">
              Нажмите, чтобы добавить стикер в быструю панель за игровым столом (до 6 штук).
            </p>
            <div className="grid grid-cols-4 gap-3">
              {STICKERS.map((s) => {
                const unlocked = s.check(stats);
                const owned = cosmetics.ownedStickers.includes(s.id);
                const p = s.progress(stats);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSticker(s.id, unlocked, s.name)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all active:scale-95 ${
                      !unlocked
                        ? 'bg-black/20 border-white/6 opacity-50'
                        : owned
                          ? 'bg-[#c9a227]/14 border-[#c9a227]/60'
                          : 'bg-black/30 border-white/8'
                    }`}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <p className="text-[10px] text-[#8aab92] text-center">{s.name}</p>
                    {unlocked ? (
                      <span className="text-[9px] text-[#7dd4a0]">{owned ? 'В панели' : '+'}</span>
                    ) : (
                      <div className="w-full space-y-1">
                        <span className="text-[9px] text-[#c9a227] block text-center">🔒</span>
                        <ProgressBar cur={p.cur} goal={p.goal} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === 'collection' && (
          <div className="space-y-3">
            {COLLECTION.map((c) => {
              const unlocked = c.check(stats);
              const p = c.progress(stats);
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    unlocked ? 'bg-[#c9a227]/10 border-[#c9a227]/25' : 'bg-black/20 border-white/6 opacity-70'
                  }`}
                >
                  <span className="text-2xl">{unlocked ? '🏅' : '🔒'}</span>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-semibold ${unlocked ? 'text-[#f5edd2]' : 'text-[#8aab92]'}`}>
                      {c.name}
                    </p>
                    <p className="text-[10px] text-[#6a8a72]">{c.desc}</p>
                    {!unlocked && (
                      <>
                        <ProgressBar cur={p.cur} goal={p.goal} />
                        <p className="text-[9px] text-[#4a6a52]">{p.cur} / {p.goal}</p>
                      </>
                    )}
                  </div>
                  {unlocked && <span className="text-[#7dd4a0] text-lg">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20 px-4 py-2 rounded-xl bg-black/80 border border-[#c9a227]/40 text-[#f5edd2] text-xs">
          {toast}
        </div>
      )}
    </div>
  );
}
