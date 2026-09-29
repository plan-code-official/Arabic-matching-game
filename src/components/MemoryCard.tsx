import React, { useRef, useState } from 'react';
import { ItemIllustration } from './ItemIllustrations';
import type { Card } from '../data/cardData';

interface MemoryCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
  isAIPreview?: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  card,
  onClick,
  disabled,
  isAIPreview = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  // Show front when: explicitly flipped by player/AI, matched, or during preview phase
  const showFront = card.isFlipped || card.isMatched || isAIPreview;

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick();
    }
  };

  return (
    <div
      className={`memory-card-slot ${disabled || card.isMatched ? 'disabled-card' : ''}`}
      onClick={handleClick}
      role="button"
      aria-label={showFront ? card.content : 'كرت مغلق - اضغط للكشف'}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className={`memory-card-inner ${showFront ? 'flipped' : ''}`}>
        {/* ── FRONT FACE (shown when flipped / matched / preview) ── */}
        <div
          className={`memory-card-front ${
            card.isMatched
              ? 'card-matched-front'
              : card.isFlipped
              ? 'card-flipped-front'
              : ''
          }`}
        >
          {card.type === 'image' ? (
            <div className="card-image-content">
              {card.customImage ? (
                <img src={card.customImage} alt={card.itemId} className="w-full h-full object-contain p-2 drop-shadow-md" />
              ) : (
                <ItemIllustration id={card.itemId} className="" />
              )}
            </div>
          ) : (
            <div className="card-word-content">
              <span className="card-word-label">{card.content}</span>
              <span className="card-word-hint">{card.itemId}</span>
              {card.audioUrl && <button type="button" className={`card-audio-button ${isPlayingAudio ? 'is-playing' : ''}`} aria-label="تشغيل صوت السؤال" onClick={(event) => { event.stopPropagation(); if (!audioRef.current) audioRef.current = new Audio(card.audioUrl!); audioRef.current.currentTime = 0; audioRef.current.onended = () => setIsPlayingAudio(false); audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false)); }}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4Z" /><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" /></svg>
              </button>}
            </div>
          )}

          {/* Matched check mark */}
          {card.isMatched && (
            <div
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 12 12" fill="none" style={{ width: '10px', height: '10px' }}>
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* ── BACK FACE (shown when not flipped and not preview) ── */}
        <div className="memory-card-back">
          <span className="card-star-tl">★</span>
          <span className="card-question-mark">?</span>
          <span className="card-star-br">★</span>
        </div>
      </div>
    </div>
  );
};
