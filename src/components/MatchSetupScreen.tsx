import { useState } from 'react';
import { themeClass, TABLE_THEMES } from '../game/cosmetics';
import type { MatchStats } from '../game/stats';
import type { Settings, Difficulty, GameSpeed, TableTheme } from '../game/settings';

interface Props {
  settings: Settings;
  stats: MatchStats;
  onBack: () => void;
  onStart: (next: Settings) => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; sub: string; icon: string; bars: number }[] = [
  { id: 'easy', label: 'Лёгкий', sub: 'Боты ошибаются и не считают козыри', icon: '🌱', bars: 1 },
  { id: 'normal', label: 'Средний', sub: 'Ровная игра, боты держат партнёра', icon: '⚔', bars: 2 },
  { id: 'hard', label: 'Сложный', sub: 'Боты считают карты и ловят на ошибках', icon: '🔥', bars: 3 },
];

const SPEEDS: { id: GameSpeed; label: string; icon: string }[] = [
  { id: 'slow', label: 'Спокойно', icon: '🐢' },
  { id: 'normal', label: 'Обычно', icon: '▶' },
  { id: 'fast', label: 'Быстро', icon: '⚡' },
];

const TIMES = [15, 25, 40, 0];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#7d9c85]">{title}</p>
        {hint && <span className="text-[10px] text-[#6a8a72]/80">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export default function MatchSetupScreen({ settings, stats, onBack, onStart }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);
  const tableClass = themeClass(draft.tableTheme);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setDraft(d => ({ ...d, [k]: v }));

  const diff = DIFFICULTIES.find(d => d.id === draft.difficulty)!;
  const speed = SPEEDS.find(s => s.id === (draft.gameSpeed ?? 'normal'))!;

  return (
    <div
      key={draft.tableTheme}
      className={`w-full h-full ${tableClass} table-frame flex flex-col relative overflow-hidden`}
      style={{ paddingTop: 'max(16px, var(--safe-top))', paddingBottom: 'max(16px, var(--safe-bottom))' }}
    >
      <div className="home-glow" aria-hidden="true" />

      {/* Header */}
      <div className="relative z-[1] flex items-center gap-3 px-5 pb-1">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-full bg-black/35 border border-white/10 text-[#9db8a4] hover:text-[#f4e3ac] active:scale-90 transition-all flex items-center justify-center"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold gold-text leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Игра с ботами
          </h2>
          <p className="text-[10px] text-[#6a8a72] tracking-wide">Настройте партию перед раздачей</p>
        </div>
      </div>

      {/* Teams preview */}
      <div className="relative z-[1] mx-5 mt-3 rounded-2xl border border-[#c9a227]/20 bg-black/30 px-4 py-3 flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#c9a227]/80">Ваша пара</p>
          <p className="text-sm text-[#f5edd2] font-semibold mt-0.5">{settings.playerName || 'Вы'} + Бот 2</p>
        </div>
        <span className="px-2 text-[11px] text-[#6a8a72]">vs</span>
        <div className="text-center flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#7d9c85]">Соперники</p>
          <p className="text-sm text-[#dcead9] font-semibold mt-0.5">Бот 1 + Бот 3</p>
        </div>
      </div>

      {/* Scrollable options */}
      <div className="relative z-[1] flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <Section title="Сложность ботов">
          <div className="space-y-2">
            {DIFFICULTIES.map(d => {
              const active = draft.difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => set('difficulty', d.id)}
                  className={`menu-tile w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                    active
                      ? 'menu-tile-primary text-[#f7e9bd] ring-1 ring-[#c9a227]/50'
                      : 'bg-black/28 border-white/8 text-[#dcead9]'
                  }`}
                >
                  <span className="text-xl w-7 text-center">{d.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold">{d.label}</span>
                    <span className="block text-[10px] text-[#7d9c85] leading-snug">{d.sub}</span>
                  </span>
                  <span className="flex items-end gap-[3px] h-4">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className={`w-[3px] rounded-full ${i < d.bars ? 'bg-[#c9a227]' : 'bg-white/15'}`}
                        style={{ height: `${6 + i * 5}px` }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Темп игры" hint="скорость ходов ботов">
          <div className="grid grid-cols-3 gap-2">
            {SPEEDS.map(s => (
              <button
                key={s.id}
                onClick={() => set('gameSpeed', s.id)}
                className={`menu-tile rounded-xl border py-2.5 text-xs font-semibold flex flex-col items-center gap-1 ${
                  (draft.gameSpeed ?? 'normal') === s.id
                    ? 'menu-tile-primary text-[#f7e9bd] ring-1 ring-[#c9a227]/50'
                    : 'bg-black/28 border-white/8 text-[#dcead9]'
                }`}
              >
                <span className="text-sm">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Время на ход" hint="таймер вашего хода">
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map(t => (
              <button
                key={t}
                onClick={() => set('turnSeconds', t)}
                className={`menu-tile rounded-xl border py-2.5 text-xs font-semibold ${
                  draft.turnSeconds === t
                    ? 'menu-tile-primary text-[#f7e9bd] ring-1 ring-[#c9a227]/50'
                    : 'bg-black/28 border-white/8 text-[#dcead9]'
                }`}
              >
                {t === 0 ? 'Без' : `${t}с`}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Стол">
          <div className="grid grid-cols-3 gap-2">
            {TABLE_THEMES.map(t => {
              const unlocked = t.check(stats);
              const active = draft.tableTheme === t.id;
              return (
                <button
                  key={t.id}
                  disabled={!unlocked}
                  onClick={() => set('tableTheme', t.id as TableTheme)}
                  className={`rounded-xl border overflow-hidden text-[11px] font-semibold transition-all ${
                    active ? 'border-[#c9a227] ring-1 ring-[#c9a227]/50' : 'border-white/10'
                  } ${unlocked ? '' : 'opacity-45'}`}
                >
                  <span className="block h-9" style={{ background: t.bg }} />
                  <span className={`block py-1.5 bg-black/40 ${active ? 'text-[#f7e9bd]' : 'text-[#dcead9]'}`}>
                    {unlocked ? t.name : `🔒 ${t.name}`}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Звук">
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/28 p-3.5">
            <span className="text-sm text-[#dcead9]">Звуковые эффекты</span>
            <button
              onClick={() => set('soundEnabled', !draft.soundEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                draft.soundEnabled ? 'bg-[#c9a227]' : 'bg-black/50 border border-white/10'
              }`}
              aria-label="Звук"
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-[#f5edd2] transition-all ${
                  draft.soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </Section>
      </div>

      {/* Footer summary + start */}
      <div className="relative z-[1] px-5 pt-2 space-y-2">
        <p className="text-center text-[10px] text-[#7d9c85] tracking-wide">
          {diff.icon} {diff.label} · {speed.label} · {draft.turnSeconds === 0 ? 'без таймера' : `${draft.turnSeconds}с на ход`}
        </p>
        <button
          onClick={() => onStart(draft)}
          className="btn-gold w-full py-4 rounded-2xl font-bold tracking-[0.12em] uppercase"
        >
          Начать игру
        </button>
      </div>
    </div>
  );
}
