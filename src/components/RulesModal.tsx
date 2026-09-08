import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

const RULES = [
  { icon: '♠', title: 'Состав', text: '4 игрока делятся на 2 команды: Вы + Бот 2 против Бот 1 + Бот 3.' },
  { icon: '🃏', title: 'Колода', text: 'Играют 32 карты: от 7 до туза по каждой масти. По 8 карт каждому.' },
  { icon: '★', title: 'Козыри', text: 'Валеты всегда козырные. Остальные козыри — карты объявленной масти.' },
  { icon: '🎯', title: 'Цель', text: 'Первыми набрать 12 очей (взяток) выигрывает матч.' },
  { icon: '▶', title: 'Ход', text: 'Первый игрок задаёт масть. Остальные должны отдать карту той же масти, если есть.' },
  { icon: '🏆', title: 'Взятка', text: 'Старшая карция в заказанной масти берёт взятку. Козырь бьёт любую масть.' },
  { icon: '⚡', title: 'Голая', text: 'Если команда забирает все 8 взяток в раунде — это «Голая» и бонус.' },
];

export default function RulesModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm max-h-[80vh] overflow-hidden rounded-2xl border border-[#c9a227]/25 bg-[#0d1f10] shadow-[0_24px_60px_rgba(0,0,0,0.7)] anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c9a227]/12">
          <h2
            className="text-lg font-bold text-[#f5edd2]"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            Правила игры
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 border border-white/8 text-[#6a8a72] hover:text-[#c9a227] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-3">
          {RULES.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-[#c9a227]/10 bg-black/25 px-3 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c9a227]/30 bg-black/40 text-sm text-[#c9a227]">
                {r.icon}
              </span>
              <div>
                <p className="text-[#f5edd2] text-sm font-semibold">{r.title}</p>
                <p className="text-[#8aab92] text-xs leading-relaxed mt-0.5">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#c9a227] text-[#0d1f10] font-bold text-sm tracking-wider uppercase hover:bg-[#e8c455] active:scale-95 transition-all"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
