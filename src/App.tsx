import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';

function App() {
  const [view, setView] = useState<'welcome' | 'playing'>('welcome');
  
  const searchParams = new URLSearchParams(window.location.search);
  const lessonId = searchParams.get('lessonId') || '1';
  const token = searchParams.get('token') || '';

  return (
    <div className="w-screen h-screen overflow-hidden">
      {view === 'welcome' && (
        <WelcomeScreen onStart={() => setView('playing')} />
      )}
      {view === 'playing' && (
        <GameScreen 
          onBackToWelcome={() => setView('welcome')} 
          lessonId={lessonId}
          token={token}
        />
      )}
    </div>
  );
}

export default App;
