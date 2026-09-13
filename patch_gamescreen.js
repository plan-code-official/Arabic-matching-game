const fs = require('fs');
const file = '/Users/fady/Desktop/plan-code/madinatyGames/arabic-matching-game/src/components/GameScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<ScoreHUD[\s\S]*?opponentType={opponentType}\s*\/>/,
  `{!isPreviewActive && (
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
                opponentType={opponentType}
              />
            )}`
);

content = content.replace(
  /<PreviewTimerHeader[\s\S]*?onSkip={finishPreviewPhase}\s*\/>/,
  `<PreviewTimerHeader
                duration={DIFFICULTIES[difficulty].previewTime}
                timeLeft={previewTimeLeft}
                onSkip={finishPreviewPhase}
                onExit={onBackToWelcome}
              />`
);

fs.writeFileSync(file, content);
