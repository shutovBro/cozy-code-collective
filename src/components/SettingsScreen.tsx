import { themeClass } from '../game/cosmetics';
import { useState } from 'react';
import type { Settings, Difficulty, TableTheme, GameSpeed } from '../game/settings';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onBack: () => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy',   label: 'Лёгкий',   desc: 'Боты играют случайно' },
  { value: 'normal', label: 'Средний',   desc: 'Умная тактика' },
  { value: 'hard',   label: 'Сложный',   desc: 'Агрессивная игра' },
];

const SPEEDS: { value: GameSpeed; label: string; desc: string; icon: string }[] = [
  { value: 'slow',   label: 'Медленно', desc: 'Боты думают долго',   icon: '🐢' },
  { value: 'normal', label: 'Обычно',   desc: 'Стандартный темп',    icon: '⚡' },
  { value: 'fast',   label: 'Быстро',   desc: 'Молниеносная игра',   icon: '🔥' },
];

const THEMES: { value: TableTheme; label: string; color: string; bg: string }[] = [
  { value: 'green',   label: 'Лесной',   color: '#7dd4a0', bg: 'radial-gradient(ellipse at 50% 60%, #215535, #0b1f14)' },
  { value: 'blue',    label: 'Морской',  color: '#6ab5e8', bg: 'radial-gradient(ellipse at 50% 60%, #1a3060, #0b1220)' },
  { value: 'crimson', label: 'Рубин',    color: '#d47d7d', bg: 'radial-gradient(ellipse at 50% 60%, #5a1a1a, #1a0808)' },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <label className="block text-[#4a6a52] text-[10px] uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}

export default function SettingsScreen({ settings, onSave, onBack }: Props) {
  const [name, setName] = useState(settings.playerName);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);
  const [sound, setSound] = useState(settings.soundEnabled);
  const [turnSeconds, setTurnSeconds] = useState(settings.turnSeconds ?? 25);
  const [tableTheme, setTableTheme] = useState<TableTheme>(settings.tableTheme ?? 'green');
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>(settings.gameSpeed ?? 'normal');

  const trimmedName = name.trim() || 'Вы';

  const tableClass = themeClass(tableTheme);

  return (
    <div
      className={`w-full h-full ${tableClass} table-frame flex flex-col overflow-hidden`}
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
            Настройки
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Player name */}
        <section>
          <SectionLabel>Ваше имя</SectionLabel>
          <div className="relative">
            <input
              type="text"
              value={name}
              maxLength={16}
              onChange={e => setName(e.target.value)}
              placeholder="Введите имя"
              className="w-full bg-black/40 border border-[#c9a227]/20 focus:border-[#c9a227]/60 rounded-xl px-4 py-3 text-[#f5edd2] text-base outline-none transition-colors placeholder:text-[#3a5040]"
              style={{ fontFamily: "'Playfair Display',serif" }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e4030] text-[9px]">
              {name.length}/16
            </span>
          </div>
          <p className="text-[#2e4030] text-[10px] mt-1 ml-1">
            Будет отображаться за столом как «{trimmedName}»
          </p>
        </section>

        {/* Difficulty */}
        <section>
          <SectionLabel>Сложность ботов</SectionLabel>
          <div className="space-y-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-98 ${
                  difficulty === d.value
                    ? 'bg-[#c9a227]/18 border-[#c9a227]/55 text-[#c9a227]'
                    : 'bg-black/25 border-white/6 text-[#6a8a72] hover:border-white/15'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm leading-tight">{d.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{d.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                  difficulty === d.value ? 'border-[#c9a227] bg-[#c9a227]' : 'border-[#3a5040] bg-transparent'
                }`} />
              </button>
            ))}
          </div>
        </section>

        {/* Game speed */}
        <section>
          <SectionLabel>Скорость игры</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {SPEEDS.map(s => (
              <button
                key={s.value}
                onClick={() => setGameSpeed(s.value)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all active:scale-95 ${
                  gameSpeed === s.value
                    ? 'bg-[#c9a227]/18 border-[#c9a227]/55 text-[#c9a227]'
                    : 'bg-black/25 border-white/6 text-[#6a8a72] hover:border-white/15'
                }`}
              >
                <span className="text-xl leading-none">{s.icon}</span>
                <span className="text-[11px] font-semibold leading-tight">{s.label}</span>
                <span className="text-[9px] opacity-60 text-center leading-tight">{s.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Turn timer */}
        <section>
          <SectionLabel>Время хода</SectionLabel>
          <div className="bg-black/25 border border-white/6 rounded-xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8aab92] text-sm font-medium">Секунд на ход</span>
              <span className="text-[#c9a227] text-xl font-bold" style={{ fontFamily: "'Playfair Display',serif" }}>
                {turnSeconds}с
              </span>
            </div>
            <input
              type="range"
              min={10} max={60} step={5}
              value={turnSeconds}
              onChange={e => setTurnSeconds(Number(e.target.value))}
              className="w-full accent-[#c9a227] cursor-pointer"
              style={{ accentColor: '#c9a227' }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[#3a5040] text-[9px]">10с</span>
              <span className="text-[#3a5040] text-[9px]">60с</span>
            </div>
            <p className="text-[#3a5040] text-[10px] mt-2">
              При истечении автоматически сыграет дешевейшую карту
            </p>
          </div>
        </section>

        {/* Table theme */}
        <section>
          <SectionLabel>Тема стола</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button
                key={t.value}
                onClick={() => setTableTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 ${
                  tableTheme === t.value
                    ? 'border-[#c9a227]/70 bg-[#c9a227]/12'
                    : 'border-white/6 bg-black/25 hover:border-white/15'
                }`}
              >
                <div
                  className="w-full h-10 rounded-lg border border-white/10 flex-shrink-0"
                  style={{ background: t.bg }}
                />
                <span className="text-[11px] font-medium" style={{ color: tableTheme === t.value ? t.color : '#6a8a72' }}>
                  {t.label}
                </span>
                {tableTheme === t.value && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Sound */}
        <section>
          <SectionLabel>Звук</SectionLabel>
          <button
            onClick={() => setSound(prev => !prev)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-98 ${
              sound ? 'bg-[#c9a227]/18 border-[#c9a227]/55' : 'bg-black/25 border-white/6'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{sound ? '🔊' : '🔇'}</span>
              <div className="text-left">
                <p className={`font-semibold text-sm ${sound ? 'text-[#c9a227]' : 'text-[#6a8a72]'}`}>
                  {sound ? 'Звук включён' : 'Звук выключен'}
                </p>
                <p className="text-[10px] text-[#3a5040] mt-0.5">Звуковые эффекты при игре</p>
              </div>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${sound ? 'bg-[#c9a227]' : 'bg-[#1a3024]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${sound ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </section>

      </div>

      {/* Save button */}
      <div className="px-5 pt-3 flex-shrink-0">
        <button
          onClick={() => onSave({ playerName: trimmedName, difficulty, soundEnabled: sound, turnSeconds, tableTheme, gameSpeed })}
          className="w-full py-4 rounded-xl bg-[#c9a227] hover:bg-[#e8c455] active:scale-95 text-[#0d1f10] font-bold text-base tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(201,162,39,0.4)]"
          style={{ fontFamily: "'Playfair Display',serif" }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
