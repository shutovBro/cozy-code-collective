// Web Vibration API — works on Android PWA; iOS Safari ignores silently.
// Pattern arrays: [vibrate, pause, vibrate, ...]

function vibe(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
}

/** Short tap — card played */
export function hapticTap() { vibe(12); }

/** Double pulse — trick won by your team */
export function hapticTrickWin() { vibe([18, 40, 28]); }

/** Triple pulse — round end */
export function hapticRoundEnd() { vibe([25, 50, 25, 50, 40]); }

/** Victory rumble — match won */
export function hapticMatchWin() { vibe([40, 80, 40, 80, 80, 80, 100]); }

/** Sad thud — match lost */
export function hapticMatchLose() { vibe([60, 60, 80]); }

/** Urgent buzz — timer ≤ 5s */
export function hapticUrgent() { vibe([8, 120, 8]); }
