import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { audio } from '../utils/audio';

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
    <div className="preview-timer-header">
      <div className="header-main-group">
        {/* Right Avatar - Player/Tiger - Placed first so it renders on the Right in RTL */}
        <div className="header-avatar-container header-avatar-right">
          <img src="/src/assets/user1.png" alt="Player" className="preview-avatar" />
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
            Ready
          </button>
        </div>

        {/* Left Avatar - Hakim/Robot - Placed last so it renders on the Left in RTL */}
        <div className="header-avatar-container header-avatar-left">
          <img src="/src/assets/user2.png" alt="Hakim" className="preview-avatar" />
        </div>
      </div>

      {/* Action Button - Exit */}
      {onExit && (
        <button onClick={onExit} className="preview-action-btn header-logout-btn">
          <LogOut size={20} color="#1e293b" />
        </button>
      )}
    </div>
  );
};
