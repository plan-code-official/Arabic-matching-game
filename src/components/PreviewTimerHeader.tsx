import React, { useEffect } from 'react';
import { audio } from '../utils/audio';
import user1 from "../assets/user1.png";
import user2 from "../assets/user2.png";
import ExitButtonImg from '../assets/ExitButton.svg';

interface PreviewTimerHeaderProps {
  duration: number;
  timeLeft: number;
  onSkip: () => void;
  onExit?: () => void;
}

export const PreviewTimerHeader: React.FC<PreviewTimerHeaderProps> = ({ duration, timeLeft, onSkip, onExit }) => {
  const percentage = (timeLeft / duration) * 100;

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      audio.playClick();
    }
  }, [timeLeft]);

  return (
    <div className="game-header-bar">
      {/* Right Side: Exit Button & Player 1 (Orange/User) */}
      <div className="header-side header-side-right">
        {onExit && (
          <button onClick={onExit} className="header-exit-btn">
            <img src={ExitButtonImg} alt="Exit" />
          </button>
        )}

        <div className="header-player">
          <div className="header-avatar-circle circle-orange">
            <img src={user1} alt="Player" />
          </div>
        </div>
      </div>

      {/* Center Console */}
      <div className="preview-center-console">
        <div className="preview-bar-container">
          <span className="preview-time-text">{timeLeft}s</span>
          <div className="preview-progress-track">
            <div
              className="preview-progress-fill"
              style={{ width: `${percentage}%`, transition: 'width 1s linear' }}
            />
          </div>
        </div>
        <button
          onClick={() => { audio.playClick(); onSkip(); }}
          className="preview-ready-btn"
        >
          ابدأ
        </button>
      </div>

      {/* Left Side: Player 2 (Blue/AI) */}
      <div className="header-side header-side-left">
        <div className="header-player">
          <div className="header-avatar-circle circle-blue">
            <img src={user2} alt="Hakim" />
          </div>
        </div>
      </div>
    </div>
  );
};
