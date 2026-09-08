import type { EyesSnapshot } from '../game/types';

interface Props {
  history: EyesSnapshot[];
  currentEyes: [number, number];
  playerNames: [string, string, string, string];
  onClose: () => void;
}

const W = 300;
const H = 160;
const PAD = { top: 16, right: 12, bottom: 28, left: 28 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const MAX_EYES = 12;

function eyesToY(eyes: number) {
  return PAD.top + CHART_H - (eyes / MAX_EYES) * CHART_H;
}

function roundToX(roundIdx: number, total: number) {
  if (total <= 1) return PAD.left + CHART_W / 2;
  return PAD.left + (roundIdx / (total - 1)) * CHART_W;
}

function polyline(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export default function MatchChartModal({ history, currentEyes, playerNames, onClose }: Props) {
  // Build data points: start at 0,0 then each round snapshot
  const dataA: [number, number][] = [[0, 0], ...history.map(s => [s.roundNumber, s.eyes[0]] as [number,number])];
  const dataB: [number, number][] = [[0, 0], ...history.map(s => [s.roundNumber, s.eyes[1]] as [number,number])];
  const totalPoints = dataA.length;

  const ptsA = dataA.map(([, e], i) => [roundToX(i, totalPoints), eyesToY(e)] as [number, number]);
  const ptsB = dataB.map(([, e], i) => [roundToX(i, totalPoints), eyesToY(e)] as [number, number]);

  // Smooth path using bezier curves
  function smoothPath(pts: [number, number][]) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev[0] + curr[0]) / 2;
      d += ` C ${cpx} ${prev[1]}, ${cpx} ${curr[1]}, ${curr[0]} ${curr[1]}`;
    }
    return d;
  }

  const pathA = smoothPath(ptsA);
  const pathB = smoothPath(ptsB);

  // Area fill paths (close to bottom)
  function areaPath(pts: [number, number][]) {
    if (pts.length < 2) return '';
    const bottom = PAD.top + CHART_H;
    return `${smoothPath(pts)} L ${pts[pts.length - 1][0]} ${bottom} L ${pts[0][0]} ${bottom} Z`;
  }

  // Y-axis gridlines at 0, 3, 6, 9, 12
  const gridLines = [0, 3, 6, 9, 12];

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center anim-fade-in">
      <div
        className="bg-[#0c2016] border border-[#c9a227]/30 rounded-t-3xl w-full max-w-sm anim-slide-up shadow-2xl"
        style={{ paddingBottom: 'max(24px, var(--safe-bottom))' }}
      >
        {/* Handle + header */}
        <div className="pt-3 pb-1 flex flex-col items-center">
          <div className="w-10 h-1 rounded-full bg-[#c9a227]/25 mb-3" />
          <div className="flex items-center justify-between w-full px-5 pb-4 border-b border-white/5">
            <div>
              <p className="text-[#4a6a52] text-[9px] uppercase tracking-widest">Матч</p>
              <h2 className="text-base font-bold text-[#f5edd2]" style={{ fontFamily: "'Playfair Display',serif" }}>
                Прогресс очей
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-white/8 text-[#6a8a72] hover:text-[#c9a227] active:scale-90 transition-all text-lg"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 pt-3 pb-1 space-y-5">

          {/* SVG chart */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-3">
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-[#2e4a36] text-sm">
                Раунды ещё не завершены
              </div>
            ) : (
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
                <defs>
                  <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7dd4a0" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7dd4a0" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d47d7d" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#d47d7d" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {gridLines.map(v => {
                  const y = eyesToY(v);
                  return (
                    <g key={v}>
                      <line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <text x={PAD.left - 4} y={y + 4} fontSize="8" fill="#3a5a42"
                        textAnchor="end">{v}</text>
                    </g>
                  );
                })}

                {/* Finish line at 12 */}
                <line x1={PAD.left} y1={eyesToY(12)} x2={PAD.left + CHART_W} y2={eyesToY(12)}
                  stroke="rgba(201,162,39,0.25)" strokeWidth="1" strokeDasharray="4 3" />

                {/* Area fills */}
                <path d={areaPath(ptsA)} fill="url(#gradA)" />
                <path d={areaPath(ptsB)} fill="url(#gradB)" />

                {/* Lines */}
                <path d={pathA} fill="none" stroke="#7dd4a0" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d={pathB} fill="none" stroke="#d47d7d" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {ptsA.map(([x, y], i) => i > 0 && (
                  <circle key={i} cx={x} cy={y} r="3.5" fill="#7dd4a0"
                    stroke="#0c2016" strokeWidth="1.5" />
                ))}
                {ptsB.map(([x, y], i) => i > 0 && (
                  <circle key={i} cx={x} cy={y} r="3.5" fill="#d47d7d"
                    stroke="#0c2016" strokeWidth="1.5" />
                ))}

                {/* Round labels on X axis */}
                {dataA.slice(1).map(([r], i) => {
                  const x = roundToX(i + 1, totalPoints);
                  return (
                    <text key={i} x={x} y={H - 4} fontSize="8" fill="#3a5a42"
                      textAnchor="middle">{r}</text>
                  );
                })}

                {/* X axis label */}
                <text x={PAD.left + CHART_W / 2} y={H} fontSize="7" fill="#2a4232"
                  textAnchor="middle">раунд</text>
              </svg>
            )}
          </div>

          {/* Legend + current score */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { label: `${playerNames[0]} + ${playerNames[2]}`, eyes: currentEyes[0], color: '#7dd4a0' },
              { label: `${playerNames[1]} + ${playerNames[3]}`, eyes: currentEyes[1], color: '#d47d7d' },
            ] as const).map((t, i) => (
              <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-[9px] uppercase tracking-wider font-semibold truncate"
                    style={{ color: t.color }}>{t.label}</span>
                </div>
                <p className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display',serif" }}>
                  {t.eyes}
                  <span className="text-[#2e4030] text-sm font-normal">/12</span>
                </p>
              </div>
            ))}
          </div>

          {/* Round-by-round breakdown */}
          {history.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[#2e4a36] text-[9px] uppercase tracking-widest">По раундам</p>
              {history.map(snap => {
                const dA = snap.roundNumber === 1
                  ? snap.eyes[0]
                  : snap.eyes[0] - (history[snap.roundNumber - 2]?.eyes[0] ?? 0);
                const dB = snap.roundNumber === 1
                  ? snap.eyes[1]
                  : snap.eyes[1] - (history[snap.roundNumber - 2]?.eyes[1] ?? 0);
                return (
                  <div key={snap.roundNumber}
                    className="flex items-center justify-between bg-black/20 border border-white/4 rounded-lg px-3 py-1.5">
                    <span className="text-[#3a5a42] text-[10px] w-14">Раунд {snap.roundNumber}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#3a5a42]">{snap.pointsA}</span>
                      <span className="text-[#2a3a2a] text-[8px]">vs</span>
                      <span className="text-[10px] font-bold text-[#3a5a42]">{snap.pointsB}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold ${dA > 0 ? 'text-[#7dd4a0]' : 'text-[#2a4a2a]'}`}>
                        {dA > 0 ? `+${dA}` : '—'}
                      </span>
                      <span className={`text-[11px] font-bold ${dB > 0 ? 'text-[#d47d7d]' : 'text-[#4a2a2a]'}`}>
                        {dB > 0 ? `+${dB}` : '—'}
                      </span>
                    </div>
                    {snap.bonuses.length > 0 && (
                      <span className="text-[8px] text-[#c9a227]/60 max-w-[60px] truncate text-right">
                        {snap.bonuses[snap.bonuses.length - 1]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
