import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';
import { subscribeUserProfile, fetchUserProfile, type UserProfile } from './utils/api';
import { preloadCelebrationAndResultsAssets } from './utils/preloadAssets';

function App() {
  const [view, setView] = useState<'welcome' | 'playing'>('welcome');

  const [gameData, setGameData] = useState<{ questions: any[], sessionId: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const lessonId = searchParams.get('lessonId') || '1';
  const token = searchParams.get('token') || searchParams.get('accesstoken') || '';

  useEffect(() => {
    // Preload celebration and results panel assets upfront
    preloadCelebrationAndResultsAssets();

    const unsubscribe = subscribeUserProfile((profile) => {
      setUserProfile(profile);
    });

    if (token) {
      fetchUserProfile(token);
    }

    return unsubscribe;
  }, [token]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      {view === 'welcome' && (
        <WelcomeScreen
          lessonId={lessonId}
          token={token}
          onStart={(questions, sessionId) => {
            setGameData({ questions, sessionId });
            setView('playing');
          }}
        />
      )}
      {view === 'playing' && gameData && (
        <GameScreen
          onBackToWelcome={() => setView('welcome')}
          lessonId={lessonId}
          token={token}
          userProfile={userProfile}
          initialQuestions={gameData.questions}
          initialSessionId={gameData.sessionId}
        />
      )}
    </div>
  );
}

export default App;
