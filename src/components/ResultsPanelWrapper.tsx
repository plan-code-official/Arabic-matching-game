import React, { useEffect, useRef } from 'react';
import { ResultsPanel as VanillaResultsPanel } from '../ResultsPanel/ResultsPanel';

interface ResultsPanelWrapperProps {
  score: number;
  totalScore?: number;
  correctAnswers: number;
  wrongAnswers: number;
  coins: number;
  onRetry: () => void;
  onBack: () => void;
}

export const ResultsPanelWrapper: React.FC<ResultsPanelWrapperProps> = ({
  score,
  totalScore = 100,
  correctAnswers,
  wrongAnswers,
  coins,
  onRetry,
  onBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<VanillaResultsPanel | null>(null);

  // Initialize the VanillaResultsPanel once
  useEffect(() => {
    if (containerRef.current && !panelRef.current) {
      panelRef.current = new VanillaResultsPanel(containerRef.current, {
        onRetry,
        onBack
      });
    }
  }, [onRetry, onBack]);

  // Show/Update the panel whenever props change
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.show({
        score,
        totalScore,
        correctAnswers,
        wrongAnswers,
        coins
      });
    }
  }, [score, totalScore, correctAnswers, wrongAnswers, coins]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (panelRef.current) {
        panelRef.current.hide();
      }
    };
  }, []);

  return <div ref={containerRef} />;
};
