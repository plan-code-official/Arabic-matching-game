import React, { useState, useEffect } from 'react';
import { GameAPI } from '../utils/api';
import type { ApiQuestion } from '../utils/api';
import GameWelcomeScreen from './GameWelcomeScreen/GameWelcomeScreen';

import QuestionCoin from '../assets/QuestionCoin.png';
import QuestionNumberBg from '../assets/QuestionNumber.png';
import DescriptionImg from '../assets/description.png';
import StartButtonBg from '../assets/start_transparent.png';
import ExitButtonBg from '../assets/exit_transparent.png';
import DaddCoin from '../assets/daddcoin.webp';

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
      setError(`حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.`);
      setIsLoading(false);
    });
  }, [lessonId, token]);

  const handleStart = () => {
    if (questions.length === 0 || !sessionId) return;
    audio.playClick();
    onStart(questions, sessionId);
  };

  const totalQuestions = questions.length;
  const isReady = totalQuestions > 0 && !!sessionId && !error;

  return (
    <div className="welcome-screen-new">
    <GameWelcomeScreen
      statsBgImage={QuestionNumberBg}
      statLeftIcon={QuestionCoin}
      statLeftAlt="Questions"
      statLeftValue={totalQuestions}
      statRightValue={totalQuestions}
      statRightIcon={DaddCoin}
      statRightAlt="Points"
      heroImage={DescriptionImg}
      heroAlt="How to Play"
      startButtonImage={StartButtonBg}
      exitButtonImage={ExitButtonBg}
      onStart={handleStart}
      isLoading={isLoading}
      isReady={isReady}
    /> 
    </div>
  );
};
