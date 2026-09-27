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
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  onExit
}) => {
  return (
    <div className="game-header-bar">
      {/* Right Side: Exit Button & Player 1 (Orange/User) */}
      <div className="header-side header-side-right">
        <button onClick={onExit} className="header-exit-btn">
          <img src={ExitButtonImg} alt="Exit" />
        </button>
        
        <div className="header-player">
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
        <div className="header-player">
          <div className="header-score-pill">
            <img src={coin} alt="Coin" />
            <span>{player2Score}</span>
          </div>
          <div className="header-avatar-circle circle-blue">
            <img src={user2} alt={player2Name} />
          </div>
        </div>
      </div>
    </div>
  );
};
