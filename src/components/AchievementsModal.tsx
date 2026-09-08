import { useEffect } from 'react';
import type { MatchStats } from '../game/stats';

interface Props {
  stats: MatchStats;
  onClose: () => void;
}

interface Achievement {
  id: string;
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
}

function getAchievements(stats: MatchStats): Achievement[] {
  const total = stats.wins + stats.losses;
  return [
    { id: 'first_win', icon: '🏆', label: 'Первая победа', desc: 'Выиграть первый матч', unlocked: stats.wins >= 1 },
    { id: 'streak3', icon: '🔥', label: 'Серия ×3', desc: '3 победы подряд', unlocked: stats.bestStreak >= 3 },
    { id: 'streak5', icon: '⚡', label: 'Серия ×5', desc: '5 побед подряд', unlocked: stats.bestStreak >= 5 },
    { id: 'golaya', icon: '💥', label: 'Голая!', desc: 'Победить с ГОЛОЙ', unlocked: stats.golayaWins >= 1 },
    { id: 'veteran', icon: '🎖️', label: 'Ветеран', desc: '10 матчей сыграно', unlocked: total >= 10 },
    { id: 'champion', icon: '👑', label: 'Чемпион', desc: '25 матчей сыграно', unlocked: total >= 25 },
    { id: 'perfect', icon: '✨', label: 'Безупречный', desc: 'Взять все 8 взяток в раунде', unlocked: (stats.perfectRounds ?? 0) >= 1 },
    { id: 'hardmode', icon: '💀', label: 'Против всех', desc: 'Победить на сложном уровне', unlocked: (stats.byDifficulty?.hard?.wins ?? 0) >= 1 },
  ];
}

export default function AchievementsModal({ stats, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const achievements = getAchievements(stats);
  const unlocked = achievements.filter((a) => a.unlocked).length;

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
          <div>
            <h2
              className="text-lg font-bold text-[#f5edd2]"
              style={{ fontFamily: "'Playfair Display',serif" }}
            >
              Достижения
            </h2>
            <p className="text-[#6a8a72] text-[10px] mt-0.5">
              Открыто {unlocked} из {achievements.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 border border-white/8 text-[#6a8a72] hover:text-[#c9a227] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-2.5">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                  a.unlocked
                    ? 'bg-[#c9a227]/10 border-[#c9a227]/30'
                    : 'bg-black/20 border-white/5 opacity-45'
                }`}
              >
                <span className="text-2xl leading-none">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${a.unlocked ? 'text-[#f5edd2]' : 'text-[#4a6a52]'}`}>
                    {a.label}
                  </p>
                  <p className="text-[10px] text-[#6a8a72] leading-tight">{a.desc}</p>
                </div>
                {a.unlocked && (
                  <span className="text-[#c9a227] text-lg">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#c9a227] text-[#0d1f10] font-bold text-sm tracking-wider uppercase hover:bg-[#e8c455] active:scale-95 transition-all"
            style={{ fontFamily: "'Playfair Display',serif" }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
