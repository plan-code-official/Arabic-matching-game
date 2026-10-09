import React from 'react';
import { MessageCircle } from 'lucide-react';
import user1 from "../assets/user1.png";
import user2 from "../assets/user2.png";
import coin from "../assets/daddcoin.webp";
import ExitButtonImg from '../assets/ExitButton.svg';

interface ScoreHUDProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  currentTurn: 'player1' | 'player2';
  pairsMatched: number;
  totalPairs: number;
  streakCount: number;
  onExit: () => void;
  p1Emoji?: string;
  p2Emoji?: string;
  onOpenChat?: () => void;
  player1Image?: string | null;
  player1Accessory?: string | null;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  currentTurn,
  onExit,
  p1Emoji,
  p2Emoji,
  onOpenChat,
  player1Image,
  player1Accessory
}) => {
  return (
    <div className="game-header-bar">
      {/* Right Side: Exit Button & Player 1 (Orange/User) */}
      <div className="header-side header-side-right">
        <button onClick={onExit} className="header-exit-btn" title="خروج" aria-label="خروج">
          <img src={ExitButtonImg} alt="Exit" />
        </button>
        
        <div className="header-player">
          <div className="header-avatar-wrapper">
            <div className="header-avatar-circle circle-orange">
              {p1Emoji ? (
                <span className="avatar-emoji-active">{p1Emoji}</span>
              ) : (
                <img
                  src={player1Image || user1}
                  alt={player1Name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = user1;
                  }}
                />
              )}
            </div>
            {player1Accessory && (
              <img
                src={player1Accessory}
                alt="Frame"
                className="header-avatar-frame"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Chat Icon Button beside avatar */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="header-chat-btn"
              title="تفاعل بالرموز التعبيرية"
              aria-label="تفاعل بالرموز التعبيرية"
            >
              <MessageCircle className="header-chat-icon" />
            </button>
          )}

          <div className="header-score-pill">
            <img src={coin} alt="Coin" />
            <span>{player1Score}</span>
          </div>
        </div>
      </div>

      {/* Center: Turn Indicator */}
      <div className="header-turn-indicator-wrap">
        <span className="turn-indicator-badge">
          {currentTurn === 'player1' ? 'دورك' : 'دور حكيم'}
        </span>
      </div>

      {/* Left Side: Player 2 (Blue/AI) */}
      <div className="header-side header-side-left">
        <div className="header-player">
          <div className="header-score-pill">
            <img src={coin} alt="Coin" />
            <span>{player2Score}</span>
          </div>
          <div className="header-avatar-circle circle-blue">
            {p2Emoji ? (
              <span className="avatar-emoji-active">{p2Emoji}</span>
            ) : (
              <img src={user2} alt={player2Name} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
