import { themeClass } from '../game/cosmetics';
import { useState } from 'react';
import type { MatchStats } from '../game/stats';
import crest from '../assets/squirrel-crest-512.webp';
import MenuGrid from './MenuGrid';
import RulesModal from './RulesModal';
import AchievementsModal from './AchievementsModal';

interface Props {
  onStart: () => void;
  stats: MatchStats;
  onSettings: () => void;
  onShop: () => void;
  onOnline: () => void;
  onProfile: () => void;
  tableTheme?: string;
}

export default function HomeScreen({ onStart, stats, onSettings, onShop, onOnline, onProfile, tableTheme }: Props) {
  const tableClass = themeClass(tableTheme);
  const [showRules, setShowRules] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <div
      className={`w-full h-full ${tableClass} table-frame flex flex-col items-center relative overflow-hidden`}
      style={{
        paddingTop: 'max(16px, var(--safe-top))',
        paddingBottom: 'max(16px, var(--safe-bottom))',
      }}
    >
      <div className="home-glow" aria-hidden="true" />

      {/* Settings button */}
      <button
        onClick={onSettings}
        aria-label="Настройки"
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-sm border border-[#c9a227]/20 text-[#9db8a4] hover:text-[#f4e3ac] hover:border-[#c9a227]/45 active:scale-90 transition-all z-10"
        style={{ marginTop: 'var(--safe-top)' }}
      >
        <span className="text-base leading-none">⚙</span>
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 anim-scale-in pt-6 relative z-[1]">
        <div className="relative">
          <div className="crest-halo" />
          <img
            src={crest}
            alt="Герб игры Белка"
            width={512}
            height={512}
            fetchPriority="high"
            decoding="async"
            className="relative w-28 h-28 object-contain anim-float-slow drop-shadow-[0_8px_28px_rgba(201,162,39,0.4)]"
          />
        </div>
        <h1
          className="text-[56px] font-bold gold-text tracking-[0.06em] uppercase leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Белка
        </h1>
        <div className="flex items-center gap-2 text-[#c9a227]/55 text-[11px] tracking-[0.35em] uppercase">
          <span className="block w-6 h-px bg-gradient-to-r from-transparent to-[#c9a227]/45" />
          ♠ ♥ ♦ ♣
          <span className="block w-6 h-px bg-gradient-to-l from-transparent to-[#c9a227]/45" />
        </div>
      </div>

      {/* Menu */}
      <div className="w-full max-w-xs px-6 anim-fade-in-up flex-1 flex flex-col justify-center py-4 relative z-[1]">
        <MenuGrid
          onPlayBots={onStart}
          onOnline={onOnline}
          onShop={onShop}
          onProfile={onProfile}
          onSettings={onSettings}
          onRules={() => setShowRules(true)}
          onAchievements={() => setShowAchievements(true)}
        />
      </div>

      <div className="w-full px-6 max-w-xs relative z-[1]">
        <p className="text-[#6a8a72]/70 text-[10px] text-center tracking-wide">
          Вы + Бот 2 против Бот 1 + Бот 3
        </p>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showAchievements && <AchievementsModal stats={stats} onClose={() => setShowAchievements(false)} />}
    </div>
  );
}
