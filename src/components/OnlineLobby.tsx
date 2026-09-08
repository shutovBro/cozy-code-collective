import { themeClass } from '../game/cosmetics';
interface Props {
  onBack: () => void;
  tableTheme?: string;
}

export default function OnlineLobby({ onBack, tableTheme }: Props) {
  const tableClass =
    themeClass(tableTheme);

  return (
    <div
      className={`w-full h-full ${tableClass} table-frame flex flex-col items-center justify-center relative overflow-hidden p-6 text-center`}
      style={{
        paddingTop: 'max(20px, var(--safe-top))',
        paddingBottom: 'max(20px, var(--safe-bottom))',
      }}
    >
      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/8 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all text-xl leading-none"
        style={{ marginTop: 'var(--safe-top)' }}
      >
        ‹
      </button>

      <div className="flex flex-col items-center gap-5 max-w-xs anim-scale-in">
        <div className="w-20 h-20 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/25 flex items-center justify-center text-[#c9a227] shadow-[0_0_40px_rgba(201,162,39,0.18)]">
          <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9.5" />
            <path d="M2.5 12h19" />
            <path d="M12 3c2 3.5 3 7 3 10.5S14 20.5 12 23c-2-3-3-6.5-3-10S10 6.5 12 3z" />
          </svg>
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[#f5edd2] mb-2"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            Онлайн-режим
          </h1>
          <p className="text-[#8aab92] text-sm leading-relaxed">
            Скоро вы сможете играть с друзьями и другими игроками в режиме реального времени.
          </p>
        </div>
        <div className="w-full bg-black/25 border border-[#c9a227]/12 rounded-xl p-4 text-left space-y-2">
          <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-wider">В разработке:</p>
          <ul className="text-[#8aab92] text-xs space-y-1.5">
            <li className="flex items-center gap-2"><span>•</span> Создание комнат</li>
            <li className="flex items-center gap-2"><span>•</span> Игра с друзьями</li>
            <li className="flex items-center gap-2"><span>•</span> Рейтинговые матчи</li>
          </ul>
        </div>
        <button
          onClick={onBack}
          className="btn-gold px-10 py-3 rounded-xl font-bold text-base tracking-wider uppercase"
          style={{ fontFamily: "'Playfair Display',serif" }}
        >
          Назад
        </button>
      </div>
    </div>
  );
}
