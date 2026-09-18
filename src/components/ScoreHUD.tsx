import React from 'react';
import { LogOut } from 'lucide-react';

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
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  currentTurn,
  onExit,
  p1Emoji
}) => {
  const isP1Turn = currentTurn === 'player1';

  return (
    <div className="new-game-header">
      <div className="header-main-group">
        {/* Right Avatar (Player 1) - Placed first so it renders on the Right in RTL */}
        <div className="header-avatar-container header-avatar-right">
          {p1Emoji && (
            <div className="header-speech-bubble bubble-right">
              {p1Emoji}
            </div>
          )}
          <div className="avatar-circle avatar-circle-orange">
            <img src="/src/assets/user1.png" alt={player1Name} className="header-avatar-img" />
          </div>
          <div className="avatar-score-badge">
            <img src="/src/assets/daddcoin.webp" alt="Coin" />
            <span>{player1Score}</span>
          </div>
        </div>

        {/* Center Turn Indicator */}
        <div className="header-turn-indicator">
          {isP1Turn ? (
            <>
              <img src="/src/assets/user1.png" alt="turn" className="turn-icon" />
              <span>{player1Name} Turn</span>
            </>
          ) : (
            <>
              <img src="/src/assets/user2.png" alt="turn" className="turn-icon" />
              <span>{player2Name} Turn</span>
            </>
          )}
        </div>

        {/* Left Avatar (Player 2 / Hakim) - Placed last so it renders on the Left in RTL */}
        <div className="header-avatar-container header-avatar-left">
          <div className="avatar-circle avatar-circle-blue">
            <img src="/src/assets/user2.png" alt={player2Name} className="header-avatar-img" />
          </div>
          <div className="avatar-score-badge badge-blue">
            <img src="/src/assets/daddcoin.webp" alt="Coin" />
            <span>{player2Score}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button onClick={onExit} className="preview-action-btn header-logout-btn">
        <LogOut size={20} color="#1e293b" />
      </button>
    </div>
  );
};
