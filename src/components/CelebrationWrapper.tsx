import React, { useEffect, useRef } from 'react';
import { Celebration as VanillaCelebration } from '../Celebration/Celebration';

interface CelebrationWrapperProps {
  isVisible: boolean;
  onComplete: () => void;
  muted?: boolean;
  soundUrl?: string;
  imageSrc?: string;
}

export const CelebrationWrapper: React.FC<CelebrationWrapperProps> = ({
  isVisible,
  onComplete,
  muted = false,
  soundUrl,
  imageSrc
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<VanillaCelebration | null>(null);

  useEffect(() => {
    if (containerRef.current && !celebrationRef.current) {
      celebrationRef.current = new VanillaCelebration(containerRef.current, {
        muted,
        soundUrl,
        imageSrc
      });
    }
  }, [muted, soundUrl, imageSrc]);

  useEffect(() => {
    if (celebrationRef.current) {
      if (isVisible) {
        celebrationRef.current.show(onComplete);
      } else {
        celebrationRef.current.hide();
      }
    }
  }, [isVisible, onComplete]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (celebrationRef.current) {
        celebrationRef.current.hide();
      }
    };
  }, []);

  return <div ref={containerRef} />;
};
