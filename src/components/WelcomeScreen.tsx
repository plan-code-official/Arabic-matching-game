import React, { useState, useEffect } from 'react';
import { GameAPI } from '../utils/api';
import type { ApiQuestion } from '../utils/api';

import QuestionCoin from '../assets/QuestionCoin.png';
import QuestionNumberBg from '../assets/QuestionNumber.png';
import DescriptionImg from '../assets/description.png';
import StartButtonBg from '../assets/startButton.png';
import DaddCoin from '../assets/daddcoin.webp';
import ExitButtonImg from '../assets/ExitButton.svg';

import { audio } from '../utils/audio';

interface WelcomeScreenProps {
  lessonId: string;
  token: string;
  onStart: (questions: ApiQuestion[], sessionId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  lessonId,
  token,
  onStart
}) => {
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = new GameAPI(token);
    Promise.all([
      api.getQuestions(lessonId),
      api.startSession(lessonId)
    ]).then(([qRes, sRes]) => {
      setQuestions(qRes.data.questions);
      setSessionId(sRes.data.id);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setError('فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
    });
  }, [lessonId, token]);

  const handleStart = () => {
    if (questions.length === 0 || !sessionId) return;
    audio.playClick();
    onStart(questions, sessionId);
  };

  const totalQuestions = questions.length;

  // Calculate XP based on 10 points per question
  const xpCount = totalQuestions;

  return (
    <div className="welcome-screen-new">

      {/* 1. Header (Stats Badge & Exit Button) */}
      <div className="welcome-header-new">
        <button className="welcome-exit-btn" onClick={() => window.history.back()}>
          <img src={ExitButtonImg} alt="Exit" />
        </button>
        <div
          className="welcome-stats-bg"
          style={{ backgroundImage: `url(${QuestionNumberBg})` }}
        >
          {/* Forced LTR ensures Question Coin is on the left, DaddCoin is on the right */}
          <img src={QuestionCoin} alt="Questions" className="welcome-q-coin" />
          <span className="welcome-stat-text q-count">{totalQuestions}</span>
          <span className="welcome-stat-arrow">{'='}</span>
          <span className="welcome-stat-text xp-count">{xpCount}</span>
          <img src={DaddCoin} alt="DaddCoin" className="welcome-dadd-coin" />
        </div>
      </div>

      {/* 2. Body (How to Play Description) */}
      <div className="welcome-body-new">
        <img
          src={DescriptionImg}
          alt="How to play"
          className="welcome-description-img"
        />
      </div>

      {/* 3. Footer (Start Button / Loading States) */}
      <div className="welcome-footer-new">
        {isLoading ? (
          <p className="welcome-loading">جاري تحميل الأسئلة...</p>
        ) : error ? (
          <div className="welcome-error-new">
            <p>{error}</p>
          </div>
        ) : totalQuestions === 0 ? (
          <div className="welcome-error-new">
            <p>لا توجد أسئلة </p>
          </div>
        ) : (
          <button
            className="welcome-start-btn-new"
            onClick={handleStart}
            style={{ backgroundImage: `url(${StartButtonBg})` }}
            disabled={isLoading}
          >
            ابدَأ!
          </button>
        )}
      </div>

    </div>
  );
};
