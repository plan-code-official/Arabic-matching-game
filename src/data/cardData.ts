export interface CardItem {
  id: string; // e.g. 'apple'
  arabic: string; // e.g. 'تفاحة'
  english: string; // e.g. 'Apple'
  category: 'food' | 'transport' | 'animals' | 'study';
}

export const CARD_ITEMS: CardItem[] = [
  { id: 'apple', arabic: 'تفاحة', english: 'Apple', category: 'food' },
  { id: 'banana', arabic: 'موزة', english: 'Banana', category: 'food' },
  { id: 'cake', arabic: 'كعكة', english: 'Cake', category: 'food' },
  { id: 'car', arabic: 'سيارة', english: 'Car', category: 'transport' },
  { id: 'airplane', arabic: 'طائرة', english: 'Airplane', category: 'transport' },
  { id: 'train', arabic: 'قطار', english: 'Train', category: 'transport' },
  { id: 'cat', arabic: 'قطة', english: 'Cat', category: 'animals' },
  { id: 'dog', arabic: 'كلب', english: 'Dog', category: 'animals' },
  { id: 'rabbit', arabic: 'أرنب', english: 'Rabbit', category: 'animals' },
  { id: 'book', arabic: 'كتاب', english: 'Book', category: 'study' },
  { id: 'pencil', arabic: 'قلم', english: 'Pencil', category: 'study' },
  { id: 'clock', arabic: 'ساعة', english: 'Clock', category: 'study' }
];

export interface Card {
  uniqueId: string; // Unique identifier for DOM rendering
  pairId: string;  // Shared between matching cards (e.g. 'apple' or question id)
  type: 'image' | 'word';
  itemId: string;  // SVG case key or English word
  content: string; // Arabic word text or English depending on language setting
  isFlipped: boolean;
  isMatched: boolean;
  customImage?: string; // URL for API driven images
}

export interface DifficultyConfig {
  label: string;
  gridCols: number;
  pairCount: number;
  previewTime: number; // in seconds
  description: string;
}

export const DIFFICULTIES: Record<'easy' | 'medium' | 'hard', DifficultyConfig> = {
  easy: {
    label: 'سهل',
    gridCols: 4,
    pairCount: 6,
    previewTime: 30,
    description: '12 كارت (3×4) - وقت حفظ 30 ثانية'
  },
  medium: {
    label: 'وسط',
    gridCols: 4,
    pairCount: 8,
    previewTime: 15,
    description: '16 كارت (4×4) - وقت حفظ 15 ثانية'
  },
  hard: {
    label: 'صعب',
    gridCols: 6,
    pairCount: 12,
    previewTime: 8,
    description: '24 كارت (4×6) - وقت حفظ 8 ثوانٍ'
  }
};

export type MatchMode = 'image-word' | 'image-image';

/**
 * Generates and shuffles a deck of cards based on difficulty and match mode.
 */
export function generateDeck(
  difficulty: 'easy' | 'medium' | 'hard',
  matchMode: MatchMode,
  category: 'all' | 'food' | 'transport' | 'animals' | 'study' = 'all'
): Card[] {
  const config = DIFFICULTIES[difficulty];
  
  // Filter cards by category if selected
  let filteredItems = [...CARD_ITEMS];
  if (category !== 'all') {
    filteredItems = filteredItems.filter(item => item.category === category);
  }
  
  // If we don't have enough cards in that category, fall back to all items
  if (filteredItems.length < config.pairCount) {
    filteredItems = [...CARD_ITEMS];
  }
  
  // Shuffle items and pick the required number of pairs
  const shuffledItems = filteredItems.sort(() => Math.random() - 0.5);
  const selectedItems = shuffledItems.slice(0, config.pairCount);
  
  const deck: Card[] = [];
  
  selectedItems.forEach(item => {
    if (matchMode === 'image-word') {
      // 1 Image Card
      deck.push({
        uniqueId: `${item.id}-img`,
        pairId: item.id,
        type: 'image',
        itemId: item.id,
        content: item.arabic,
        isFlipped: false,
        isMatched: false
      });
      // 1 Word Card
      deck.push({
        uniqueId: `${item.id}-word`,
        pairId: item.id,
        type: 'word',
        itemId: item.id,
        content: item.arabic,
        isFlipped: false,
        isMatched: false
      });
    } else {
      // image-image
      deck.push({
        uniqueId: `${item.id}-img1`,
        pairId: item.id,
        type: 'image',
        itemId: item.id,
        content: item.arabic,
        isFlipped: false,
        isMatched: false
      });
      deck.push({
        uniqueId: `${item.id}-img2`,
        pairId: item.id,
        type: 'image',
        itemId: item.id,
        content: item.arabic,
        isFlipped: false,
        isMatched: false
      });
    }
  });
  
  // Final shuffle of the entire deck
  return deck.sort(() => Math.random() - 0.5);
}

/**
 * Generates and shuffles a deck of cards from the backend API.
 */
export function generateDeckFromApi(
  questions: any[],
  difficulty: 'easy' | 'medium' | 'hard',
  matchMode: MatchMode
): Card[] {
  const config = DIFFICULTIES[difficulty];
  
  // Shuffle questions and pick the required number of pairs
  const shuffledItems = [...questions].sort(() => Math.random() - 0.5);
  const selectedItems = shuffledItems.slice(0, config.pairCount);
  
  const deck: Card[] = [];
  
  selectedItems.forEach(item => {
    const qId = item.id.toString();
    const qText = item.question;
    const optionText = item.options?.[0]?.text || item.correctAnswer || qText;
    const qImage = item.imageUrl || item.options?.[0]?.imageUrl || undefined;

    if (matchMode === 'image-word') {
      // 1 Image Card
      deck.push({
        uniqueId: `${qId}-img`,
        pairId: qId,
        type: 'image',
        itemId: qText,
        content: optionText,
        isFlipped: false,
        isMatched: false,
        customImage: qImage
      });
      // 1 Word Card
      deck.push({
        uniqueId: `${qId}-word`,
        pairId: qId,
        type: 'word',
        itemId: qText,
        content: optionText,
        isFlipped: false,
        isMatched: false
      });
    } else {
      // image-image
      deck.push({
        uniqueId: `${qId}-img1`,
        pairId: qId,
        type: 'image',
        itemId: qText,
        content: optionText,
        isFlipped: false,
        isMatched: false,
        customImage: qImage
      });
      deck.push({
        uniqueId: `${qId}-img2`,
        pairId: qId,
        type: 'image',
        itemId: qText,
        content: optionText,
        isFlipped: false,
        isMatched: false,
        customImage: qImage
      });
    }
  });
  
  // Final shuffle of the entire deck
  return deck.sort(() => Math.random() - 0.5);
}
