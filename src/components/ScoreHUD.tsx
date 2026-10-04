import React from 'react';
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
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  currentTurn,
  onExit,
  p1Emoji,
  p2Emoji
}) => {
  return (
    <div className="game-header-bar">
      {/* Right Side: Exit Button & Player 1 (Orange/User) */}
      <div className="header-side header-side-right">
        <button onClick={onExit} className="header-exit-btn">
          <img src={ExitButtonImg} alt="Exit" />
        </button>
        
        <div className="header-player" style={{ position: 'relative' }}>
          {p1Emoji && (
            <div className="emoji-bubble emoji-bubble-right">
              {p1Emoji}
            </div>
          )}
          <div className="header-avatar-circle circle-orange">
            <img src={user1} alt={player1Name} />
          </div>
          <div className="header-score-pill">
            <img src={coin} alt="Coin" />
            <span>{player1Score}</span>
          </div>
        </div>
      </div>

      {/* Left Side: Player 2 (Blue/AI) */}
      <div className="header-side header-side-left">
        <div className="header-player" style={{ position: 'relative' }}>
          <div className="header-score-pill">
            <img src={coin} alt="Coin" />
            <span>{player2Score}</span>
          </div>
          <div className="header-avatar-circle circle-blue">
            <img src={user2} alt={player2Name} />
          </div>
          {p2Emoji && (
            <div className="emoji-bubble emoji-bubble-left">
              {p2Emoji}
            </div>
          )}
        </div>
      </div>
      
      {/* Center: Turn Indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center h-full pointer-events-none">
         <span className={`turn-indicator-badge rounded-full font-extrabold text-white shadow-lg transition-colors ${currentTurn === 'player1' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-sky-500 shadow-sky-500/50'}`}>
            {currentTurn === 'player1' ? 'دورك' : 'دور حكيم'}
         </span>
      </div>
    </div>
  );
};
