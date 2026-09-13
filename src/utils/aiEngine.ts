import type { Card } from '../data/cardData';

export interface AIMemory {
  [cardId: string]: string; // Maps uniqueId to pairId
}

/**
 * Class simulating the AI opponent behavior.
 */
export class AIEngine {
  private knownCards: Map<string, { pairId: string; uniqueId: string }> = new Map();
  private recallRate: number = 0.6; // Probability of AI remembering a card position

  constructor(difficulty: 'easy' | 'medium' | 'hard') {
    // Set AI intelligence based on game difficulty
    if (difficulty === 'easy') {
      this.recallRate = 0.2; // Drastically reduced for easy
    } else if (difficulty === 'medium') {
      this.recallRate = 0.5; // Moderately reduced for medium
    } else {
      this.recallRate = 0.85; // Still tough for hard
    }
  }

  /**
   * AI learns card locations it sees flipped
   */
  remember(uniqueId: string, pairId: string) {
    // There's a chance the AI remembers it
    if (Math.random() <= this.recallRate) {
      this.knownCards.set(uniqueId, { pairId, uniqueId });
    }
  }

  /**
   * AI memorizes a subset of cards shown during initial preview phase
   */
  memorizeInitialPreview(deck: Card[]) {
    deck.forEach((card) => {
      // AI has a chance to memorize each card shown during preview
      // Severely nerf preview memory so it doesn't instantly solve from round 1
      if (Math.random() <= this.recallRate * 0.25) {
        this.knownCards.set(card.uniqueId, { pairId: card.pairId, uniqueId: card.uniqueId });
      }
    });
  }

  /**
   * Forget matched cards
   */
  forget(uniqueId: string) {
    this.knownCards.delete(uniqueId);
  }

  /**
   * Clear AI memory
   */
  clearMemory() {
    this.knownCards.clear();
  }

  /**
   * Determine AI's moves.
   * Returns a promise that resolves to the two card uniqueIds to flip.
   */
  makeMove(deck: Card[]): Promise<[string, string]> {
    return new Promise((resolve) => {
      // Filter unmatched cards
      const availableCards = deck.filter((c) => !c.isMatched && !c.isFlipped);
      if (availableCards.length < 2) {
        // Fallback safety
        resolve([availableCards[0]?.uniqueId || '', availableCards[1]?.uniqueId || '']);
        return;
      }

      // 1. Look in memory for any known matching pair
      let firstChoiceId = '';
      let secondChoiceId = '';

      const knownArray = Array.from(this.knownCards.values());
      
      // Let's see if we have two known cards that have the same pairId but different uniqueIds
      let matchedPairInMemory: [{ uniqueId: string; pairId: string }, { uniqueId: string; pairId: string }] | null = null;
      
      for (let i = 0; i < knownArray.length; i++) {
        for (let j = i + 1; j < knownArray.length; j++) {
          if (
            knownArray[i].pairId === knownArray[j].pairId && 
            knownArray[i].uniqueId !== knownArray[j].uniqueId &&
            // Ensure they are actually still available to play
            availableCards.some(c => c.uniqueId === knownArray[i].uniqueId) &&
            availableCards.some(c => c.uniqueId === knownArray[j].uniqueId)
          ) {
            matchedPairInMemory = [knownArray[i], knownArray[j]];
            break;
          }
        }
        if (matchedPairInMemory) break;
      }

      if (matchedPairInMemory) {
        // AI found a match in its memory!
        firstChoiceId = matchedPairInMemory[0].uniqueId;
        secondChoiceId = matchedPairInMemory[1].uniqueId;
        
        // Remove from memory as they will be matched
        this.forget(firstChoiceId);
        this.forget(secondChoiceId);
        
        // Simulate minor thinking delay
        setTimeout(() => {
          resolve([firstChoiceId, secondChoiceId]);
        }, 1200);
        return;
      }

      // 2. Otherwise, pick a random card as the first choice
      const randomFirstIndex = Math.floor(Math.random() * availableCards.length);
      const firstCard = availableCards[randomFirstIndex];
      firstChoiceId = firstCard.uniqueId;
      
      // Remember this first card
      this.remember(firstCard.uniqueId, firstCard.pairId);

      // 3. For the second choice, check if we know the location of its match
      const matchingCard = availableCards.find(
        (c) => c.pairId === firstCard.pairId && c.uniqueId !== firstCard.uniqueId
      );

      // Check if we remember the location of the matching card
      const remembersMatch = matchingCard && this.knownCards.has(matchingCard.uniqueId);

      if (remembersMatch && matchingCard && Math.random() <= this.recallRate) {
        secondChoiceId = matchingCard.uniqueId;
        this.forget(firstChoiceId);
        this.forget(secondChoiceId);
      } else {
        // Pick another random card (not the first one)
        const otherCards = availableCards.filter((c) => c.uniqueId !== firstChoiceId);
        const randomSecondIndex = Math.floor(Math.random() * otherCards.length);
        const secondCard = otherCards[randomSecondIndex];
        secondChoiceId = secondCard.uniqueId;
        
        // Remember both
        this.remember(secondCard.uniqueId, secondCard.pairId);
      }

      // Simulate human thinking delay
      setTimeout(() => {
        resolve([firstChoiceId, secondChoiceId]);
      }, 1500);
    });
  }
}
