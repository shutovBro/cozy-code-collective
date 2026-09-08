import { useState } from 'react';
import { themeClass } from '../game/cosmetics';
import { TABLE_THEMES } from '../game/cosmetics';
import type { Settings, Difficulty, GameSpeed, TableTheme } from '../game/settings';

interface Props {
  settings: Settings;
  onBack: () => void;
  onStart: (next: Settings) => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; sub: string; icon: string }[] = [
  { id: 'easy', label: 'Лёгкий', sub: 'Боты ошибаются', icon: '🌱' },
  { id: 'normal', label: 'Средний', sub: 'Ровная игра', icon: '⚔' },
  { id: 'hard', label: 'Сложный', sub: 'Боты считают карты', icon: '🔥' },
];

const SPEEDS: { id: GameSpeed; label: string }[] = [
  { id: 'slow', label: 'Спокойно' },
  { id: 'normal', label: 'Обычно' },
  { id: 'fast', label: 'Быстро' },
];

const TIMES = [15, 25, 40, 0];

export default function MatchSetupScreen({ settings, onBack, onStart }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);
  const tableClass = themeClass(draft.tableTheme);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div
      className={`w-full h-full ${tableClass} table-frame flex flex-col relative overflow-hidden`}
      style={{ paddingTop: 'max(16px, var(--safe-top))', paddingBottom: 'max(16px, var(--safe-bottom))' }}
    >
      <div className="home-glow" aria-hidden="true" />

      <div className="relative z-[1] flex items-center gap-3 px-5 pb-2">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-full bg-black/35 border border-white/10 text-[#9db8a4] hover:text-[#f4e3ac] active:scale-90 transition-all flex items-center justify-center"
        >
          ←
        </button>
        <h2 className="text-xl font-bold gold-text" style={{ fontFamily: "'Playfair Display', serif" }}>
          Настройка партии
        </h2>
      </div>

      <div className="relative z-[1] flex-1 overflow-y-auto px-5 py-3 space-y-5">
        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7d9c85] mb-2">Сложность ботов</p>
          <div className="space-y-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => set('difficulty', d.id)}
                className={`menu-tile w-full flex items-center gap-3 rounded-2xl border p-3 text-left ${
                  draft.difficulty === d.id
                    ? 'menu-tile-primary text-[#f7e9bd]'
                    : 'bg-black/28 border-white/8 text-[#dcead9]'
                }`}
              >
                <span className="text-xl">{d.icon}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{d.label}</span>
                  <span className="block text-[10px] text-[#7d9c85]">{d.sub}</span>
                </span>
                {draft.difficulty === d.id && <span className="text-[#c9a227]">✓</span>}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7d9c85] mb-2">Темп игры</p>
          <div className="grid grid-cols-3 gap-2">
            {SPEEDS.map(s => (
              <button
                key={s.id}
                onClick={() => set('gameSpeed', s.id)}
                className={`menu-tile rounded-xl border py-2.5 text-xs font-semibold ${
                  draft.gameSpeed === s.id
                    ? 'menu-tile-primary text-[#f7e9bd]'
                    : 'bg-black/28 border-white/8 text-[#dcead9]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7d9c85] mb-2">Время на ход</p>
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map(t => (
              <button
                key={t}
                onClick={() => set('turnSeconds', t)}
                className={`menu-tile rounded-xl border py-2.5 text-xs font-semibold ${
                  draft.turnSeconds === t
                    ? 'menu-tile-primary text-[#f7e9bd]'
                    : 'bg-black/28 border-white/8 text-[#dcead9]'
                }`}
              >
                {t === 0 ? 'Без' : `${t}с`}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7d9c85] mb-2">Стол</p>
          <div className="grid grid-cols-3 gap-2">
            {TABLE_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => set('tableTheme', t.id as TableTheme)}
                className={`menu-tile rounded-xl border py-2.5 text-[11px] font-semibold ${
                  draft.tableTheme === t.id
                    ? 'menu-tile-primary text-[#f7e9bd]'
                    : 'bg-black/28 border-white/8 text-[#dcead9]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/28 p-3.5">
          <span className="text-sm text-[#dcead9]">Звук</span>
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
        </section>
      </div>

      <div className="relative z-[1] px-5 pt-2">
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
