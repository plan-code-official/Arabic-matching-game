import React from 'react';

export const EMOJI_TEXT_MAP: Record<string, string> = {
  '👍': 'أحسنت!',
  '👏': 'تصفيق',
  '🎉': 'احتفال',
  '😎': 'بطل!',
  '😂': 'ضحكة',
  '😲': 'واو!',
  '🤔': 'أفكر',
  '🔥': 'حماس',
  '💪': 'قوي',
  '❤️': 'إعجاب',
  '⭐': 'ممتاز',
  '⚡': 'سريع!',
};

interface Group944Props {
  emoji?: string;
  text?: string;
  side?: 'right' | 'left';
  className?: string;
  style?: React.CSSProperties;
}

export default function Group944({
  emoji = '',
  text,
  side = 'right',
  className = '',
  style
}: Group944Props) {
  const emojiText = text ?? (emoji ? EMOJI_TEXT_MAP[emoji] : '') ?? '';

  return (
    <div
      className={`group-944-container group-944-${side} ${className}`.trim()}
      style={style}
      data-name="Group 944"
      role="status"
      aria-live="polite"
      dir="rtl"
    >
      {/* Rectangle 714: Speech bubble body with linear gradient */}
      <div className="group-944-rectangle rounded-[20px] bg-linear-[175deg,#FFF2.38%,#0054A2816.94%]">
        <div className="group-944-content">
          <span className="group-944-emoji">{emoji}</span>
          {emojiText && <span className="group-944-text">{emojiText}</span>}
        </div>
      </div>

      {/* Polygon 6: Speech bubble tail pointing towards the avatar */}
      <div className="group-944-polygon" aria-hidden="true">
        {side === 'right' ? (
          /* Points to the right towards Player 1's avatar */
          <svg
            viewBox="0 0 12 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <polygon points="0,0 12,9 0,18" fill="#E9F0F7" />
          </svg>
        ) : (
          /* Points to the left towards Player 2's avatar */
          <svg
            viewBox="0 0 12 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <polygon points="12,0 0,9 12,18" fill="#E9F0F7" />
          </svg>
        )}
      </div>
    </div>
  );
}
