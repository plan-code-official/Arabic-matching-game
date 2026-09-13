export interface Question {
  id: string;
  word: string;
  choices: string[];
  correctChoice: string;
}

export const QUESTIONS: Question[] = [
  {
    id: '1',
    word: 'تفاحة',
    choices: ['cake', 'apple', 'banana'],
    correctChoice: 'apple'
  },
  {
    id: '2',
    word: 'موزة',
    choices: ['banana', 'cake', 'apple'],
    correctChoice: 'banana'
  },
  {
    id: '3',
    word: 'كعكة',
    choices: ['apple', 'banana', 'cake'],
    correctChoice: 'cake'
  },
  {
    id: '4',
    word: 'طائرة',
    choices: ['car', 'airplane', 'train'],
    correctChoice: 'airplane'
  },
  {
    id: '5',
    word: 'سيارة',
    choices: ['train', 'car', 'airplane'],
    correctChoice: 'car'
  },
  {
    id: '6',
    word: 'قطار',
    choices: ['airplane', 'train', 'car'],
    correctChoice: 'train'
  },
  {
    id: '7',
    word: 'قطة',
    choices: ['dog', 'cat', 'rabbit'],
    correctChoice: 'cat'
  },
  {
    id: '8',
    word: 'كلب',
    choices: ['cat', 'rabbit', 'dog'],
    correctChoice: 'dog'
  },
  {
    id: '9',
    word: 'أرنب',
    choices: ['rabbit', 'dog', 'cat'],
    correctChoice: 'rabbit'
  },
  {
    id: '10',
    word: 'كتاب',
    choices: ['pencil', 'book', 'clock'],
    correctChoice: 'book'
  },
  {
    id: '11',
    word: 'قلم',
    choices: ['clock', 'pencil', 'book'],
    correctChoice: 'pencil'
  },
  {
    id: '12',
    word: 'ساعة',
    choices: ['book', 'clock', 'pencil'],
    correctChoice: 'clock'
  }
];

export function getRandomQuestions(count: number = 10): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => {
    // Shuffle choices for each question as well
    const shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5);
    return {
      ...q,
      choices: shuffledChoices
    };
  });
}
