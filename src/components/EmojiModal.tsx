import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { audio } from '../utils/audio';

export interface ChatEmojiItem {
  id: string;
  emoji: string;
  name: string;
}

export const CHAT_EMOJI_LIST: ChatEmojiItem[] = [
  { id: 'thumbs_up', emoji: '👍', name: 'أحسنت!' },
  { id: 'clap', emoji: '👏', name: 'تصفيق' },
  { id: 'party', emoji: '🎉', name: 'احتفال' },
  { id: 'cool', emoji: '😎', name: 'بطل!' },
  { id: 'laugh', emoji: '😂', name: 'ضحكة' },
  { id: 'surprised', emoji: '😲', name: 'واو!' },
  { id: 'thinking', emoji: '🤔', name: 'أفكر' },
  { id: 'fire', emoji: '🔥', name: 'حماس' },
  { id: 'strong', emoji: '💪', name: 'قوي' },
  { id: 'heart', emoji: '❤️', name: 'إعجاب' },
  { id: 'star', emoji: '⭐', name: 'ممتاز' },
  { id: 'lightning', emoji: '⚡', name: 'سريع!' },
];

interface EmojiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiModal: React.FC<EmojiModalProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
}) => {
  // Listen for Escape key to close the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="emoji-modal-overlay select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="نافذة الرموز التعبيرية"
      dir="rtl"
    >
      <div
        className="emoji-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Glass Shimmer Flare */}
        <div className="emoji-modal-glass-flare pointer-events-none" />

        {/* Distinct Red 'X' Close Button */}
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="emoji-modal-close-btn"
          title="إغلاق النافذة"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Emoji Cards Grid */}
        <div className="emoji-modal-scroll custom-modal-scrollbar">
          <div className="emoji-modal-grid">
            {CHAT_EMOJI_LIST.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  onSelectEmoji(item.emoji);
                  onClose();
                }}
                className="emoji-grid-card"
              >
                <span className="emoji-grid-icon">
                  {item.emoji}
                </span>
                <span className="emoji-grid-name">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
