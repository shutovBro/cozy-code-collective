import type { ReactNode } from 'react';

interface Props {
  onPlayBots: () => void;
  onOnline: () => void;
  onShop: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onRules: () => void;
  onAchievements: () => void;
}

const ICONS: Record<string, ReactNode> = {
  bots: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <circle cx="9" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8 17v2M16 17v2M12 7V4M7 4h10" />
    </svg>
  ),
  online: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 3c2 3.5 3 7 3 10.5S14 20.5 12 23c-2-3-3-6.5-3-10S10 6.5 12 3z" />
    </svg>
  ),
  shop: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 8v13h18V8l-3-6H6z" />
      <path d="M12 11v8" />
      <path d="M9 21h6" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  rules: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),
  achievements: (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
};

const ITEMS = [
  { id: 'bots', label: 'С ботами', sub: 'Офлайн', icon: ICONS.bots, primary: true },
  { id: 'online', label: 'Онлайн', sub: 'Скоро', icon: ICONS.online, soon: true },
  { id: 'shop', label: 'Магазин', sub: 'Рубашки и темы', icon: ICONS.shop },
  { id: 'profile', label: 'Профиль', sub: 'Аватар и звание', icon: ICONS.profile },
  { id: 'settings', label: 'Настройки', sub: 'Имя и сложность', icon: ICONS.settings },
  { id: 'rules', label: 'Правила', sub: 'Как играть', icon: ICONS.rules },
  { id: 'achievements', label: 'Достижения', sub: 'Награды', icon: ICONS.achievements },
];

export default function MenuGrid({
  onPlayBots,
  onOnline,
  onShop,
  onProfile,
  onSettings,
  onRules,
  onAchievements,
}: Props) {
  const handlers: Record<string, () => void> = {
    bots: onPlayBots,
    online: onOnline,
    shop: onShop,
    profile: onProfile,
    settings: onSettings,
    rules: onRules,
    achievements: onAchievements,
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={handlers[item.id]}
          className={`menu-tile relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 min-h-[92px] overflow-hidden ${
            item.primary
              ? 'menu-tile-primary col-span-2 min-h-[104px] text-[#f5edd2]'
              : item.soon
              ? 'bg-black/20 border-white/6 text-[#6a8a72] opacity-60'
              : 'bg-black/28 border-white/8 text-[#dcead9]'
          }`}
        >
          <span
            className={`menu-tile-icon ${
              item.primary ? 'text-[#f4e3ac]' : item.soon ? 'text-[#7d9c85]' : 'text-[#c9a227]'
            }`}
          >
            {item.icon}
          </span>
          <span
            className={`text-[13px] font-semibold tracking-wide ${
              item.primary ? 'text-[#f7e9bd]' : item.soon ? 'text-[#6a8a72]' : 'text-[#f5edd2]'
            }`}
          >
            {item.label}
          </span>
          <span className="text-[9px] text-[#7d9c85]/80 leading-tight">{item.sub}</span>
          {item.soon && (
            <span className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#c9a227]/18 text-[#c9a227] border border-[#c9a227]/20">
              Скоро
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

