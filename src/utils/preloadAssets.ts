import celebrationRobots from '../Celebration/assets/celbr.png';
import panelArt from '../assets/results-panel-empty.png';
import celebrationTitle from '../ResultsPanel/assets/good.png';
import exitButtonImage from '../assets/Exit1.png';
import retryButtonImage from '../assets/retry.png';
import fireworksSoundUrl from '../Celebration/fireworks.mp3';

let isPreloaded = false;

/**
 * Preloads celebration and results panel assets (images and audio)
 * so they are ready in cache before the game concludes.
 */
export const preloadCelebrationAndResultsAssets = (): void => {
  if (isPreloaded || typeof window === 'undefined') return;
  isPreloaded = true;

  const imageAssets = [
    celebrationRobots,
    panelArt,
    celebrationTitle,
    exitButtonImage,
    retryButtonImage,
  ];

  imageAssets.forEach((src) => {
    if (src) {
      const img = new Image();
      img.src = src;
    }
  });

  if (fireworksSoundUrl) {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = fireworksSoundUrl;
      audio.load();
    } catch (_) {
      // Audio preloading is optional and non-blocking
    }
  }
};
