import type { Card, Suit } from '../game/types';
import { effectiveSuit } from '../game/engine';

export const SUIT_SYMBOL: Record<Suit, string> = { C: '♣', S: '♠', H: '♥', D: '♦' };
export const SUIT_IS_RED: Record<Suit, boolean> = { C: false, S: false, H: true, D: true };
export const RANK_RU: Record<string, string> = {
  '7': '7', '8': '8', '9': '9', '10': '10', 'J': 'В', 'Q': 'Д', 'K': 'К', 'A': 'Т',
};
export const SUIT_NAME_RU: Record<Suit, string> = {
  C: 'Трефы', S: 'Пики', H: 'Червы', D: 'Бубны',
};

interface Props {
  card?: Card;
  trump?: Suit;
  isLegal?: boolean;
  faceDown?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isWinner?: boolean;
  isPlayed?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  dealIndex?: number;
}

const DIMS: Record<string, { w: string; h: string; rankText: string; suitText: string; centerText: string; padding: string; radius: string }> = {
  xs: { w: 'w-8',  h: 'h-12',  rankText: 'text-[11px]', suitText: 'text-[8px]',  centerText: 'text-lg',  padding: 'p-[3px]', radius: 'rounded-[5px]' },
  sm: { w: 'w-10', h: 'h-[58px]', rankText: 'text-[13px]', suitText: 'text-[9px]',  centerText: 'text-2xl', padding: 'p-[4px]', radius: 'rounded-[6px]' },
  md: { w: 'w-14', h: 'h-[84px]', rankText: 'text-[17px]', suitText: 'text-[12px]', centerText: 'text-[34px]', padding: 'p-[5px]', radius: 'rounded-[7px]' },
  lg: { w: 'w-[62px]', h: 'h-[93px]', rankText: 'text-[19px]', suitText: 'text-[13px]', centerText: 'text-[38px]', padding: 'p-[6px]', radius: 'rounded-[8px]' },
};

export default function PlayingCard({
  card,
  trump,
  isLegal = true,
  faceDown = false,
  size = 'lg',
  isWinner = false,
  isPlayed = false,
  onClick,
  className = '',
  style,
  dealIndex,
}: Props) {
  const d = DIMS[size];

  if (faceDown || !card) {
    const delayClass = dealIndex !== undefined ? `anim-deal-${Math.min(dealIndex + 1, 8)}` : '';
    return (
      <div
        className={`${d.w} ${d.h} ${d.radius} card-back flex items-center justify-center flex-shrink-0 ${delayClass ? `anim-deal ${delayClass}` : ''} ${className}`}
        style={style}
      >
        <span className="card-back-mark select-none">✦</span>
      </div>
    );
  }

  const isTrump = trump ? effectiveSuit(card, trump) === 'trump' : false;
  const isPerm = card.isPermanentTrump;
  const isRed = SUIT_IS_RED[card.suit];
  const sym = SUIT_SYMBOL[card.suit];
  const rank = RANK_RU[card.rank];
  const textColor = isRed ? 'text-[#b52a20]' : 'text-[#18182e]';

  const delayClass = dealIndex !== undefined ? `anim-deal-${Math.min(dealIndex + 1, 8)}` : '';
  const dealAnim = dealIndex !== undefined ? `anim-deal ${delayClass}` : '';
  const playAnim = isPlayed ? 'anim-play' : '';

  let cardClass = 'card-face';
  if (isPerm) cardClass = 'card-face perm-trump-glow';
  else if (isTrump) cardClass = 'card-face trump-glow';

  let interactClass = '';
  if (onClick) {
    if (isLegal) {
      interactClass = 'card-playable touch-manipulation';
    } else {
      interactClass = 'opacity-35 cursor-not-allowed';
    }
  } else if (!isLegal && size === 'lg') {
    interactClass = 'opacity-35';
  }

  const winnerClass = isWinner ? 'winner-card' : '';

  const suitTone = isRed ? 'suit-red' : 'suit-black';

  return (
    <div
      className={`
        ${d.w} ${d.h} ${d.padding} ${d.radius}
        ${cardClass} ${interactClass} ${winnerClass} ${suitTone}
        ${dealAnim} ${playAnim}
        relative flex flex-col justify-between
        transition-all duration-150 flex-shrink-0 select-none overflow-hidden
        ${className}
      `}
      style={style}
      onClick={isLegal ? onClick : undefined}
    >
      {/* Top-left index */}
      <div className={`relative z-[2] flex flex-col items-center self-start leading-none ${textColor}`}>
        <span className={`card-rank ${d.rankText} leading-[0.85]`}>{rank}</span>
        <span className={`card-index-suit ${d.suitText} leading-none`}>{sym}</span>
      </div>

      {/* Centre suit glyph */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${d.centerText} ${textColor} card-center-glyph pointer-events-none`}
      >
        {sym}
      </div>

      {/* Permanent trump marker */}
      {isPerm && <div className="card-perm-star">★</div>}

      {/* Bottom-right index (rotated) */}
      <div className={`relative z-[2] flex flex-col items-center self-end leading-none ${textColor} rotate-180`}>
        <span className={`card-rank ${d.rankText} leading-[0.85]`}>{rank}</span>
        <span className={`card-index-suit ${d.suitText} leading-none`}>{sym}</span>
      </div>
    </div>
  );
}
