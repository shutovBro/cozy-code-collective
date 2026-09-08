// Synthetic sounds via Web Audio API — no audio files needed.
// iOS requires AudioContext to be created on a user gesture.
// Call initAudio() on first tap, then all sounds work including from setTimeout.

let _ctx: AudioContext | null = null;
let _muted = false;
export function setSoundEnabled(on: boolean) { _muted = !on; }

export function initAudio() {
  if (_ctx) return;
  try {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {}
}

function getCtx(): AudioContext | null {
  if (_muted || !_ctx) return null;
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

function tone(freq: number, startTime: number, duration: number, volume = 0.18, type: OscillatorType = 'sine') {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {}
}

/** Short click when a card is played */
export function soundCardPlay() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  tone(1100, t, 0.04, 0.15, 'triangle');
  tone(600,  t + 0.03, 0.06, 0.08, 'sine');
}

/** Rising chime when a trick is won */
export function soundTrickWin() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  [523, 659, 784].forEach((freq, i) => tone(freq, t + i * 0.09, 0.22, 0.14));
}

/** Ascending fanfare when a round ends */
export function soundRoundEnd() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, t + i * 0.11, 0.28, 0.13));
}

/** Celebratory melody when match is won */
export function soundMatchWin() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  [523, 659, 784, 1047, 784, 1047, 1319].forEach((freq, i) =>
    tone(freq, t + i * 0.13, 0.32, 0.15)
  );
}

/** Low thud when match is lost */
export function soundMatchLose() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  [300, 250, 200].forEach((freq, i) => tone(freq, t + i * 0.15, 0.4, 0.12, 'triangle'));
}
