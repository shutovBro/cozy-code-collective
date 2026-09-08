import { themeClass } from '../game/cosmetics';
import { useState } from 'react';
import type { MatchStats } from '../game/stats';
import AchievementsModal from './AchievementsModal';
import {
  AVATARS, FRAMES, SUITS, TITLES, frameById, levelInfo, titleById,
  type Profile,
} from '../game/profile';

interface Props {
  stats: MatchStats;
  profile: Profile;
  onSave: (p: Profile) => void;
  onBack: () => void;
  tableTheme?: string;
}

function HistoryDots({ history }: { history: ('W' | 'L')[] }) {
  if (!history.length) return null;
  return (
    <div className="flex gap-1 items-center justify-center flex-wrap">
      {history.slice(-12).map((r, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: r === 'W' ? '#7dd4a0' : '#d47d7d' }}
          title={r === 'W' ? 'Победа' : 'Поражение'}
        />
      ))}
    </div>
  );
}

function StatCard({ value, label, sub, color }: {
  value: string | number; label: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-black/30 border border-[#c9a227]/12 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display',serif", color: color ?? '#f5edd2' }}>
        {value}
      </p>
      <p className="text-[#4a6a52] text-[9px] uppercase tracking-widest leading-tight mt-0.5">{label}</p>
      {sub && <p className="text-[#c9a227] text-[9px] mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[#4a6a52] text-[9px] uppercase tracking-[0.2em]">{title}</p>
      {children}
    </div>
  );
}

function formatShare(p: Profile, stats: MatchStats): string {
  const total = stats.wins + stats.losses;
  const pct = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
  const { level } = levelInfo(stats);
  return [
    `${p.avatar} ${p.nickname || 'Игрок'} — ${titleById(p.titleId).label}`,
    `🃏 БЕЛКА · уровень ${level}`,
    `Победы: ${stats.wins}W / ${stats.losses}L (${pct}%)`,
    `Лучшая серия: ${stats.bestStreak}`,
    p.bio ? `«${p.bio}»` : '',
  ].filter(Boolean).join('\n');
}

export default function ProfileScreen({ stats, profile, onSave, onBack, tableTheme }: Props) {
  const tableClass = themeClass(tableTheme);
  const [draft, setDraft] = useState<Profile>(profile);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const p = editing ? draft : profile;
  const frame = frameById(p.frame);
  const { played, level, progress, toNext, xp } = levelInfo(stats);
  const winPct = played > 0 ? Math.round((stats.wins / played) * 100) : null;
  const avgRounds = played > 0 ? Math.round(stats.totalRounds / played) : null;
  const title = titleById(p.titleId);

  const set = (patch: Partial<Profile>) => setDraft(d => ({ ...d, ...patch }));

  const handleShare = async () => {
    const text = formatShare(profile, stats);
    try {
      if (navigator.share) await navigator.share({ title: 'БЕЛКА — профиль', text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const streakLabel = stats.streak > 0
    ? `🔥 Серия: ${stats.streak} побед`
    : stats.streak < 0
    ? `❄️ Серия: ${Math.abs(stats.streak)} пораж.`
    : null;

  return (
    <div
      className={`w-full h-full ${tableClass} table-frame flex flex-col relative overflow-hidden`}
      style={{ paddingTop: 'max(16px, var(--safe-top))', paddingBottom: 'max(16px, var(--safe-bottom))' }}
    >
      <div className="flex items-center gap-3 px-5 pb-3">
        <button
          onClick={() => (editing ? (setDraft(profile), setEditing(false)) : onBack())}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 border border-white/8 text-[#8aab92] hover:text-[#c9a227] active:scale-90 transition-all"
        >
          ‹
        </button>
        <h2 className="text-xl font-bold text-[#f5edd2] flex-1" style={{ fontFamily: "'Playfair Display',serif" }}>
          {editing ? 'Редактор профиля' : 'Профиль'}
        </h2>
        {!editing && (
          <button
            onClick={() => { setDraft(profile); setEditing(true); }}
            className="px-3 h-9 rounded-full border border-[#c9a227]/35 text-[#c9a227] text-[11px] font-semibold uppercase tracking-wider active:scale-95 transition-all"
          >
            Изменить
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3.5 max-w-sm w-full mx-auto">
        {/* Identity card */}
        <div
          className="rounded-2xl border bg-black/30 p-4 flex items-center gap-3.5"
          style={{ borderColor: `${frame.color}55`, boxShadow: `0 8px 30px -12px ${frame.glow}` }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background: 'rgba(0,0,0,0.45)',
              border: `2px solid ${frame.color}`,
              boxShadow: `0 0 18px ${frame.glow}`,
            }}
          >
            {p.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[#f5edd2] font-semibold truncate">{p.nickname || 'Игрок'}</p>
              <span className="text-sm" style={{ color: frame.color }}>{p.favoriteSuit}</span>
            </div>
            <p className="text-[10px] font-semibold mb-1" style={{ color: frame.color }}>{title.label}</p>
            <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: frame.color }} />
            </div>
            <p className="text-[#6a8a72] text-[9px] mt-1">
              Уровень {level} · {xp} XP · до следующего {toNext}
            </p>
          </div>
        </div>

        {p.bio && !editing && (
          <p className="text-center text-[11px] text-[#8aab92] italic px-4">«{p.bio}»</p>
        )}

        {editing ? (
          <>
            <Section title="Имя">
              <input
                value={draft.nickname}
                onChange={e => set({ nickname: e.target.value.slice(0, 16) })}
                placeholder="Как вас зовут за столом"
                className="w-full bg-black/35 border border-white/8 focus:border-[#c9a227]/60 outline-none rounded-xl px-4 py-3 text-[#f5edd2] text-sm"
              />
            </Section>

            <Section title="Аватар">
              <div className="grid grid-cols-8 gap-1.5">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => set({ avatar: a })}
                    className={`aspect-square rounded-lg text-lg flex items-center justify-center border transition-all active:scale-90 ${
                      draft.avatar === a ? 'bg-[#c9a227]/20 border-[#c9a227]/70' : 'bg-black/30 border-white/6'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Рамка">
              <div className="grid grid-cols-3 gap-2">
                {FRAMES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => set({ frame: f.id })}
                    className={`rounded-xl border py-2 flex flex-col items-center gap-1 active:scale-95 transition-all ${
                      draft.frame === f.id ? 'bg-black/45' : 'bg-black/25'
                    }`}
                    style={{ borderColor: draft.frame === f.id ? f.color : 'rgba(255,255,255,0.06)' }}
                  >
                    <span className="w-5 h-5 rounded-full" style={{ background: f.color, boxShadow: `0 0 10px ${f.glow}` }} />
                    <span className="text-[9px] text-[#8aab92]">{f.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Звание">
              <div className="space-y-1.5">
                {TITLES.map(t => {
                  const open = t.check(stats);
                  return (
                    <button
                      key={t.id}
                      disabled={!open}
                      onClick={() => set({ titleId: t.id })}
                      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                        draft.titleId === t.id
                          ? 'bg-[#c9a227]/15 border-[#c9a227]/60'
                          : open
                          ? 'bg-black/28 border-white/7 active:scale-[0.98]'
                          : 'bg-black/15 border-white/4 opacity-50'
                      }`}
                    >
                      <span>
                        <span className="block text-[12px] text-[#f5edd2] font-semibold">{t.label}</span>
                        <span className="block text-[9px] text-[#6a8a72]">{t.desc}</span>
                      </span>
                      <span className="text-[11px] text-[#c9a227]">{open ? (draft.titleId === t.id ? '✓' : '') : '🔒'}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Любимая масть">
              <div className="grid grid-cols-4 gap-2">
                {SUITS.map(s => (
                  <button
                    key={s}
                    onClick={() => set({ favoriteSuit: s })}
                    className={`py-2.5 rounded-xl border text-xl active:scale-95 transition-all ${
                      draft.favoriteSuit === s ? 'bg-[#c9a227]/18 border-[#c9a227]/60' : 'bg-black/28 border-white/6'
                    }`}
                    style={{ color: s === '♥' || s === '♦' ? '#d47d7d' : '#e6efe6' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Девиз">
              <input
                value={draft.bio}
                onChange={e => set({ bio: e.target.value.slice(0, 60) })}
                placeholder="Пара слов о себе"
                className="w-full bg-black/35 border border-white/8 focus:border-[#c9a227]/60 outline-none rounded-xl px-4 py-3 text-[#f5edd2] text-sm"
              />
              <p className="text-right text-[9px] text-[#3a5a42]">{draft.bio.length}/60</p>
            </Section>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setDraft(profile); setEditing(false); }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-[#8aab92] text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={() => { onSave(draft); setEditing(false); }}
                className="flex-1 py-3 rounded-xl bg-[#c9a227] text-[#0d1f10] text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                Сохранить
              </button>
            </div>
          </>
        ) : (
          <>
            {streakLabel && <p className="text-center text-[11px] font-semibold text-[#c9a227]">{streakLabel}</p>}

            <div className="grid grid-cols-3 gap-2">
              <StatCard value={stats.wins} label="Победы" color="#7dd4a0" />
              <StatCard value={winPct !== null ? `${winPct}%` : '—'} label="Процент" sub={`${played} матчей`} />
              <StatCard value={stats.losses} label="Пораж." color="#d47d7d" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard value={stats.bestStreak} label="Лучшая серия" color="#c9a227" />
              <StatCard value={avgRounds !== null ? avgRounds : '—'} label="Раундов/матч" />
              <StatCard value={stats.totalRounds} label="Всего раундов" />
            </div>

            <Section title="Витрина званий">
              <div className="flex flex-wrap gap-1.5">
                {TITLES.map(t => {
                  const open = t.check(stats);
                  return (
                    <span
                      key={t.id}
                      title={t.desc}
                      className={`px-2.5 py-1 rounded-full border text-[10px] ${
                        open ? 'border-[#c9a227]/40 text-[#f5edd2] bg-black/30' : 'border-white/6 text-[#3a5a42] bg-black/15'
                      }`}
                    >
                      {open ? t.label : `🔒 ${t.label}`}
                    </span>
                  );
                })}
              </div>
            </Section>

            {(stats.golayaWins > 0 || stats.golayaLosses > 0) && (
              <div className="bg-black/20 border border-[#c9a227]/10 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] text-[#4a6a52] uppercase tracking-wider">Голая</span>
                <span className="text-[11px] text-[#c8dac9]">🔥 {stats.golayaWins}W · {stats.golayaLosses}L</span>
              </div>
            )}

            {stats.history.length > 0 && (
              <div className="flex flex-col items-center gap-1">
                <p className="text-[#2e4a36] text-[9px] uppercase tracking-wider">Последние матчи</p>
                <HistoryDots history={stats.history} />
              </div>
            )}

            <button
              onClick={() => setShowAchievements(true)}
              className="w-full py-3 rounded-xl border border-[#c9a227]/30 bg-black/25 text-[#f5edd2] text-xs font-semibold tracking-wider uppercase hover:border-[#c9a227]/60 active:scale-95 transition-all"
            >
              Достижения
            </button>

            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl border border-[#c9a227]/25 hover:border-[#c9a227]/50 active:scale-95 text-[#6a8a72] hover:text-[#c9a227] text-[11px] font-semibold tracking-wider uppercase transition-all"
            >
              {copied ? '✓ Скопировано!' : '↗ Поделиться карточкой'}
            </button>
          </>
        )}
      </div>

      {showAchievements && <AchievementsModal stats={stats} onClose={() => setShowAchievements(false)} />}
    </div>
  );
}
