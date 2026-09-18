import React, { useState, useEffect, useRef, useCallback } from 'react';

import { ScoreHUD } from './ScoreHUD';
import { ResultModal } from './ResultModal';
import { MemoryCard } from './MemoryCard';
import { PreviewTimerHeader } from './PreviewTimerHeader';
import { ModeSelectModal } from './ModeSelectModal';
import { DIFFICULTIES, generateDeckFromApi } from '../data/cardData';
import type { Card, MatchMode } from '../data/cardData';
import { GameAPI } from '../utils/api';
import type { ApiSubmitAnswer, ApiQuestion } from '../utils/api';
import { AIEngine } from '../utils/aiEngine';
import { MultiplayerService } from '../utils/multiplayer';
import { audio } from '../utils/audio';

interface GameScreenProps {
  onBackToWelcome: () => void;
  lessonId: string;
  token: string;
}


const CHAT_EMOJIS = ['😊', '😮', '😎', '🔥', '👏', '💔', '🤖', '👍'];

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToWelcome, lessonId, token }) => {
  // Configuration State
  const [isConfigured, setIsConfigured] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [matchMode, setMatchMode] = useState<MatchMode>('image-word');
  const [opponentType, setOpponentType] = useState<'ai' | 'local' | 'online'>('ai');
  const [category, setCategory] = useState<'all' | 'food' | 'transport' | 'animals' | 'study'>('all');

  const [opponentName] = useState('');

  // Game Play State
  const [deck, setDeck] = useState<Card[]>([]);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(30);

  const [activeTurn, setActiveTurn] = useState<'player1' | 'player2'>('player1');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  // Game stats for accuracy calculation
  const [player1Flips, setPlayer1Flips] = useState(0);
  const [player1CorrectFlips, setPlayer1CorrectFlips] = useState(0);

  // flippedIndices: indices of currently flipped (revealed) but not yet matched cards
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isWaitingForFlipBack, setIsWaitingForFlipBack] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Emojis reaction states
  const [p1Emoji, setP1Emoji] = useState('');

  // API State
  const [apiSessionId, setApiSessionId] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiRewards, setApiRewards] = useState<any>(null);

  // Refs to hold latest values for use inside timeouts/async code
  const apiRef = useRef(new GameAPI(token));
  const answersRef = useRef<ApiSubmitAnswer[]>([]);
  const turnStartTimeRef = useRef<number>(Date.now());
  const aiEngineRef = useRef<AIEngine | null>(null);
  const mpServiceRef = useRef<MultiplayerService | null>(null);

  const deckRef = useRef<Card[]>([]);
  const flippedIndicesRef = useRef<number[]>([]);
  const activeTurnRef = useRef<'player1' | 'player2'>('player1');
  const opponentTypeRef = useRef<'ai' | 'local' | 'online'>('ai');
  const difficultyRef = useRef<'easy' | 'medium' | 'hard'>('easy');
  const isWaitingForFlipBackRef = useRef(false);
  const isGameOverRef = useRef(false);
  const streakCountRef = useRef(0);
  const player1ScoreRef = useRef(0);
  const player2ScoreRef = useRef(0);
  const player1FlipsRef = useRef(0);
  const player1CorrectFlipsRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => { deckRef.current = deck; }, [deck]);
  useEffect(() => { flippedIndicesRef.current = flippedIndices; }, [flippedIndices]);
  useEffect(() => { activeTurnRef.current = activeTurn; }, [activeTurn]);
  useEffect(() => { opponentTypeRef.current = opponentType; }, [opponentType]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { isWaitingForFlipBackRef.current = isWaitingForFlipBack; }, [isWaitingForFlipBack]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { streakCountRef.current = streakCount; }, [streakCount]);
  useEffect(() => { player1ScoreRef.current = player1Score; }, [player1Score]);
  useEffect(() => { player2ScoreRef.current = player2Score; }, [player2Score]);
  useEffect(() => { player1FlipsRef.current = player1Flips; }, [player1Flips]);
  useEffect(() => { player1CorrectFlipsRef.current = player1CorrectFlips; }, [player1CorrectFlips]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mpServiceRef.current) mpServiceRef.current.leave();
    };
  }, []);

  // ─── CONFIG HANDLING ────────────────────────────────────────────────────
  const handleConfigSelected = async (config: {
    difficulty: 'easy' | 'medium' | 'hard';
    matchMode: MatchMode;
    opponent: 'ai' | 'local' | 'online';
    category: 'all' | 'food' | 'transport' | 'animals' | 'study';
  }) => {
    setDifficulty(config.difficulty);
    setMatchMode(config.matchMode);
    setOpponentType('ai'); // AI only mode
    setCategory(config.category);
    setIsConfigured(true);

    difficultyRef.current = config.difficulty;
    opponentTypeRef.current = 'ai';

    setApiLoading(true);
    try {
      const api = apiRef.current;
      const [questionsRes, sessionRes] = await Promise.all([
        api.getQuestions(lessonId),
        api.startSession(lessonId)
      ]);
      
      setApiSessionId(sessionRes.data.id);
      
      aiEngineRef.current = new AIEngine(config.difficulty);
      startNewGame(config.difficulty, config.matchMode, questionsRes.data.questions);
    } catch (error) {
      console.error(error);
      alert('فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      onBackToWelcome();
    } finally {
      setApiLoading(false);
    }
  };


  // ─── START NEW GAME ─────────────────────────────────────────────────────
  const startNewGame = useCallback((
    diff: 'easy' | 'medium' | 'hard',
    mode: MatchMode,
    questions: ApiQuestion[]
  ) => {
    const newDeck = generateDeckFromApi(questions, diff, mode);
    setDeck(newDeck);
    deckRef.current = newDeck;
    setPlayer1Score(0);
    player1ScoreRef.current = 0;
    setPlayer2Score(0);
    player2ScoreRef.current = 0;
    setStreakCount(0);
    streakCountRef.current = 0;
    setPlayer1Flips(0);
    player1FlipsRef.current = 0;
    setPlayer1CorrectFlips(0);
    player1CorrectFlipsRef.current = 0;
    setFlippedIndices([]);
    flippedIndicesRef.current = [];
    setIsWaitingForFlipBack(false);
    isWaitingForFlipBackRef.current = false;
    setIsGameOver(false);
    isGameOverRef.current = false;
    setIsAIThinking(false);
    setActiveTurn('player1');
    activeTurnRef.current = 'player1';

    if (aiEngineRef.current) {
      aiEngineRef.current.clearMemory();
    }
    
    answersRef.current = [];
    turnStartTimeRef.current = Date.now();

    startPreviewPhase(diff);
  }, [matchMode, category]);

  // ─── PREVIEW PHASE ──────────────────────────────────────────────────────
  const startPreviewPhase = (diff: 'easy' | 'medium' | 'hard' = difficultyRef.current) => {
    const limit = DIFFICULTIES[diff].previewTime;
    setPreviewTimeLeft(limit);
    setIsPreviewActive(true);
  };

  const finishPreviewPhase = useCallback(() => {
    setIsPreviewActive(false);
    // AI memorizes what it saw during preview
    if (opponentTypeRef.current === 'ai' && aiEngineRef.current) {
      aiEngineRef.current.memorizeInitialPreview(deckRef.current);
    }
  }, []);

  // Preview countdown
  useEffect(() => {
    if (!isPreviewActive || isGameOver) return;
    const interval = setInterval(() => {
      setPreviewTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishPreviewPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPreviewActive, isGameOver, finishPreviewPhase]);

  // ─── AI TURN TRIGGER ────────────────────────────────────────────────────
  useEffect(() => {
    if (isPreviewActive || isGameOver || isWaitingForFlipBack || isAIThinking) return;
    if (activeTurn !== 'player2') return;

    if (opponentType === 'ai') {
      triggerAIMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurn, isPreviewActive, isGameOver, isWaitingForFlipBack, isAIThinking]);

  // ─── CORE FLIP LOGIC (pure function, uses refs) ─────────────────────────
  const executeFlipCore = useCallback((clickedIdx: number) => {
    const currentDeck = [...deckRef.current];
    if (currentDeck[clickedIdx].isFlipped || currentDeck[clickedIdx].isMatched) return;

    // Flip the card
    currentDeck[clickedIdx] = { ...currentDeck[clickedIdx], isFlipped: true };
    setDeck([...currentDeck]);
    deckRef.current = [...currentDeck];
    audio.playClick();

    // AI observes the card
    if (opponentTypeRef.current === 'ai' && aiEngineRef.current) {
      aiEngineRef.current.remember(currentDeck[clickedIdx].uniqueId, currentDeck[clickedIdx].pairId);
    }

    const newFlipped = [...flippedIndicesRef.current, clickedIdx];
    setFlippedIndices(newFlipped);
    flippedIndicesRef.current = newFlipped;

    // Only evaluate when 2 cards are flipped
    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;

      // Track player1's attempts
      if (activeTurnRef.current === 'player1') {
        const newFlips = player1FlipsRef.current + 1;
        setPlayer1Flips(newFlips);
        player1FlipsRef.current = newFlips;

        const qId = parseInt(currentDeck[firstIdx].pairId, 10);
        const selectedText = currentDeck[secondIdx].content;
        const timeTaken = Math.max(1, Math.round((Date.now() - turnStartTimeRef.current) / 1000));
        answersRef.current.push({
          questionId: qId,
          selectedAnswer: selectedText,
          timeTaken
        });
      }

      if (currentDeck[firstIdx].pairId === currentDeck[secondIdx].pairId) {
        // ─── MATCH ───
        setTimeout(() => {
          const matchedDeck = [...deckRef.current];
          matchedDeck[firstIdx] = { ...matchedDeck[firstIdx], isMatched: true, isFlipped: false };
          matchedDeck[secondIdx] = { ...matchedDeck[secondIdx], isMatched: true, isFlipped: false };
          setDeck([...matchedDeck]);
          deckRef.current = [...matchedDeck];

          audio.playSuccess();

          if (activeTurnRef.current === 'player1') {
            const newScore = player1ScoreRef.current + 1;
            setPlayer1Score(newScore);
            player1ScoreRef.current = newScore;
            const newCorrect = player1CorrectFlipsRef.current + 1;
            setPlayer1CorrectFlips(newCorrect);
            player1CorrectFlipsRef.current = newCorrect;
          } else {
            const newScore = player2ScoreRef.current + 1;
            setPlayer2Score(newScore);
            player2ScoreRef.current = newScore;
          }

          const newStreak = streakCountRef.current + 1;
          setStreakCount(newStreak);
          streakCountRef.current = newStreak;

          setFlippedIndices([]);
          flippedIndicesRef.current = [];

          if (opponentTypeRef.current === 'ai' && aiEngineRef.current) {
            aiEngineRef.current.forget(matchedDeck[firstIdx].uniqueId);
            aiEngineRef.current.forget(matchedDeck[secondIdx].uniqueId);
          }

          const allMatched = matchedDeck.every((c) => c.isMatched);
          if (allMatched) {
            setIsGameOver(true);
            isGameOverRef.current = true;
          } else if (activeTurnRef.current === 'player2') {
            // Player 2 / AI keeps turn on match, make next move after delay
            // Fix double-trigger: just reset isAIThinking after a delay and let useEffect trigger it.
            setTimeout(() => {
              if (!isGameOverRef.current) {
                setIsAIThinking(false);
              }
            }, 1000);
          }
          // Player1 keeps turn on match - no action needed, just reset flipped
          turnStartTimeRef.current = Date.now();
        }, 600);
      } else {
        // ─── MISMATCH ───
        setIsWaitingForFlipBack(true);
        isWaitingForFlipBackRef.current = true;

        setTimeout(() => {
          const resetDeck = [...deckRef.current];
          resetDeck[firstIdx] = { ...resetDeck[firstIdx], isFlipped: false };
          resetDeck[secondIdx] = { ...resetDeck[secondIdx], isFlipped: false };
          setDeck([...resetDeck]);
          deckRef.current = [...resetDeck];

          const newStreak = 0;
          setStreakCount(newStreak);
          streakCountRef.current = newStreak;
          setFlippedIndices([]);
          flippedIndicesRef.current = [];
          setIsWaitingForFlipBack(false);
          isWaitingForFlipBackRef.current = false;
          setIsAIThinking(false);

          // Switch turn
          const nextTurn = activeTurnRef.current === 'player1' ? 'player2' : 'player1';
          setActiveTurn(nextTurn);
          activeTurnRef.current = nextTurn;
          turnStartTimeRef.current = Date.now();

          audio.playFailure();
        }, 1200);
      }
    }
  }, []);

  // ─── PLAYER CARD CLICK ──────────────────────────────────────────────────
  const handleCardClick = useCallback((clickedIdx: number) => {
    if (
      isGameOverRef.current ||
      isWaitingForFlipBackRef.current ||
      flippedIndicesRef.current.length >= 2
    ) return;

    const card = deckRef.current[clickedIdx];
    if (!card || card.isFlipped || card.isMatched) return;

    // In AI or Online mode, only player1 can click
    if (opponentTypeRef.current !== 'local' && activeTurnRef.current !== 'player1') return;

    executeFlipCore(clickedIdx);
  }, [executeFlipCore]);

  // ─── AI MOVE ─────────────────────────────────────────────────────────────
  const triggerAIMove = useCallback(async () => {
    if (!aiEngineRef.current) return;
    if (isGameOverRef.current) return;

    setIsAIThinking(true);

    const available = deckRef.current.filter((c) => !c.isMatched && !c.isFlipped);
    if (available.length < 2) {
      setIsAIThinking(false);
      return;
    }

    try {
      const [firstId, secondId] = await aiEngineRef.current.makeMove(deckRef.current);

      const firstIdx = deckRef.current.findIndex((c) => c.uniqueId === firstId && !c.isMatched && !c.isFlipped);
      if (firstIdx === -1) {
        setIsAIThinking(false);
        return;
      }
      executeFlipCore(firstIdx);

      setTimeout(() => {
        if (isGameOverRef.current) { setIsAIThinking(false); return; }
        const secondIdx = deckRef.current.findIndex((c) => c.uniqueId === secondId && !c.isMatched && !c.isFlipped);
        if (secondIdx !== -1) {
          executeFlipCore(secondIdx);
        } else {
          setIsAIThinking(false);
        }
      }, 900);
    } catch {
      setIsAIThinking(false);
    }
  }, [executeFlipCore]);


  // ─── EMOJI REACTIONS ─────────────────────────────────────────────────────
  const handleEmojiClick = (emoji: string) => {
    setP1Emoji(emoji);
    audio.playClick();
    setTimeout(() => setP1Emoji(''), 3000);
  };




  // ─── ACCURACY ────────────────────────────────────────────────────────────
  const calculateAccuracy = () => {
    if (player1Flips === 0) return 100;
    return Math.round((player1CorrectFlips / player1Flips) * 100);
  };

  // ─── LABELS ──────────────────────────────────────────────────────────────
  const p1Label = opponentType === 'local' ? 'اللاعب 1' : 'أنت (البطل)';
  const p2Label =
    opponentType === 'ai'
      ? 'حكيم الروبوت 🤖'
      : opponentType === 'local'
      ? 'اللاعب 2'
      : opponentName || 'يبحث...';

  // Determine if player can click cards right now
  const playerCanClick = !isGameOver
    && !isPreviewActive
    && !isWaitingForFlipBack
    && !isAIThinking
    && flippedIndices.length < 2
    && (opponentType === 'local' || activeTurn === 'player1');

  // ─── API COMPLETION ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isGameOver && apiSessionId) {
      const submitAndComplete = async () => {
        try {
          let answersToSubmit = answersRef.current;
          // Fallback if player did literally nothing and AI solved the whole game
          if (answersToSubmit.length === 0) {
             const firstCard = deckRef.current[0];
             answersToSubmit = [{
               questionId: parseInt(firstCard.pairId, 10),
               selectedAnswer: "No Answer Provided",
               timeTaken: 1
             }];
          }
          await apiRef.current.submitAnswers(apiSessionId, answersToSubmit);
          const completeRes = await apiRef.current.completeSession(apiSessionId);
          setApiRewards(completeRes.data);
        } catch (e) {
          console.error('API Error ending session', e);
        }
      };
      submitAndComplete();
    }
  }, [isGameOver, apiSessionId]);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  if (apiLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white font-bold text-xl gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        جاري تحميل اللعبة...
      </div>
    );
  }



  return (
    <div className="game-screen w-full h-full flex flex-col items-center relative bg-sky-gradient">
      {/* Animated background clouds */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="cloud-slow animate-cloud-move-slow" style={{ position:'absolute', top:'15%', left:'-8%', width:'18rem', height:'4rem' }} />
        <div className="cloud-fast animate-cloud-move-fast" style={{ position:'absolute', top:'60%', right:'-12%', width:'24rem', height:'5rem' }} />
      </div>

      {/* ─ 1. Configuration Modal ─ */}
      {!isConfigured && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:20, padding:'1rem' }}>
          <ModeSelectModal onSelect={handleConfigSelected} />
        </div>
      )}

      {/* ─ 3. Game Board ─ */}
      {isConfigured && (
        <div className="game-layout">
          {/* ── Compact Top Header ── */}
          <div className="game-header">
            {!isPreviewActive && (
              <ScoreHUD
                player1Name={p1Label}
                player2Name={p2Label}
                player1Score={player1Score}
                player2Score={player2Score}
                currentTurn={activeTurn}
                pairsMatched={deck.filter((c) => c.isMatched).length / 2}
                totalPairs={deck.length / 2}
                streakCount={streakCount}
                onExit={onBackToWelcome}
                p1Emoji={p1Emoji}
              />
            )}

            {/* Preview Timer (compact inline) */}
            {isPreviewActive && (
              <PreviewTimerHeader
                duration={DIFFICULTIES[difficulty].previewTime}
                timeLeft={previewTimeLeft}
                onSkip={finishPreviewPhase}
                onExit={onBackToWelcome}
              />
            )}

            {/* Turn Status - now handled by new header */}
          </div>

          {/* ── Cards Area (fills all remaining space) ── */}
          <div className="game-cards-area">
            <div className={`cards-fit-grid ${difficulty === 'hard' ? 'hard-mode' : 'normal-mode'}`}>
              {deck.map((card, idx) => (
                <MemoryCard
                  key={card.uniqueId}
                  card={card}
                  onClick={() => handleCardClick(idx)}
                  disabled={!playerCanClick || card.isMatched || card.isFlipped}
                  isAIPreview={isPreviewActive}
                />
              ))}
            </div>
          </div>

          {/* ── Emoji Bar ── */}
          <div className="emoji-bar-compact">
            <span className="emoji-bar-compact__label">تفاعل</span>
            <div className="emoji-bar-compact__buttons">
              {CHAT_EMOJIS.slice(0, 4).map((emoji) => (
                <button
                  key={emoji}
                  id={`emoji-btn-${emoji}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="emoji-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─ 4. Result Modal ─ */}
      {isGameOver && (
        <ResultModal
          player1Name={p1Label}
          player2Name={p2Label}
          player1Score={player1Score}
          player2Score={player2Score}
          accuracy={calculateAccuracy()}
          onRestart={() => {
            setIsConfigured(false);
            handleConfigSelected({ difficulty, matchMode, opponent: 'ai', category });
          }}
          onExit={onBackToWelcome}
          apiRewards={apiRewards}
        />
      )}
    </div>
  );
};
