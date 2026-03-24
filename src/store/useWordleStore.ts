import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GameState {
  guesses: string[];
  currentGuess: string;
  solution: string;
  gameStatus: 'playing' | 'won' | 'lost';
  level: number;
  wordLength: number;
  history: {
    totalPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: Record<number, number>;
  };
  
  // Actions
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  resetGame: (newLevel?: number) => void;
  nextLevel: () => void;
}

const WORDS_4 = [
  'CHAT', 'GAME', 'PLAY', 'MIND', 'LOGI', 'TIME', 'STAY', 'BEST', 'CORE', 'DATA',
  'EASY', 'FAST', 'GOAL', 'HELP', 'IDEA', 'JUST', 'KEEP', 'LINK', 'MODE', 'NEXT'
];

const WORDS_5_SIMPLE = [
  'REACT', 'WORLD', 'GAMES', 'LOGIC', 'STAGE', 'POWER', 'SHIFT', 'LIGHT', 'BRAIN', 'CLEAR',
  'READY', 'START', 'FINISH', 'SCORE', 'BONUS', 'DAILY', 'SMART', 'DREAM', 'SHARP', 'BRIGHT'
];

const WORDS_5_COMPLEX = [
  'TYPES', 'FRAME', 'SPACE', 'REACH', 'TOUCH', 'TRACK', 'POINT', 'CRAFT', 'STORE', 'BOARD'
];

const getLevelConfig = (level: number) => {
  if (level <= 20) {
    return {
      wordLength: 4,
      words: WORDS_4
    };
  } else if (level <= 100) {
    return {
      wordLength: 5,
      words: WORDS_5_SIMPLE
    };
  } else {
    return {
      wordLength: 5,
      words: [...WORDS_5_SIMPLE, ...WORDS_5_COMPLEX]
    };
  }
};

export const useWordleStore = create<GameState>()(
  persist(
    (set, get) => ({
      guesses: [],
      currentGuess: '',
      solution: WORDS_4[Math.floor(Math.random() * WORDS_4.length)],
      gameStatus: 'playing',
      level: 1,
      wordLength: 4,
      history: {
        totalPlayed: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      },

      addLetter: (letter: string) => {
        const { currentGuess, gameStatus, wordLength } = get();
        if (gameStatus !== 'playing' || currentGuess.length >= wordLength) return;
        set({ currentGuess: currentGuess + letter.toUpperCase() });
      },

      removeLetter: () => {
        const { currentGuess, gameStatus } = get();
        if (gameStatus !== 'playing' || currentGuess.length === 0) return;
        set({ currentGuess: currentGuess.slice(0, -1) });
      },

      submitGuess: () => {
        const { currentGuess, guesses, solution, gameStatus, history, wordLength } = get();
        if (gameStatus !== 'playing' || currentGuess.length !== wordLength) return;

        const newGuesses = [...guesses, currentGuess];
        let newStatus: 'playing' | 'won' | 'lost' = gameStatus;
        let newHistory = { ...history };

        if (currentGuess === solution) {
          newStatus = 'won';
          newHistory.totalPlayed += 1;
          newHistory.wins += 1;
          newHistory.currentStreak += 1;
          newHistory.maxStreak = Math.max(newHistory.maxStreak, newHistory.currentStreak);
          
          const attempts = newGuesses.length;
          if (!newHistory.guessDistribution) {
            newHistory.guessDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
          }
          newHistory.guessDistribution[attempts] = (newHistory.guessDistribution[attempts] || 0) + 1;
        } else if (newGuesses.length >= 6) {
          newStatus = 'lost';
          newHistory.totalPlayed += 1;
          newHistory.currentStreak = 0;
        }

        set({
          guesses: newGuesses,
          currentGuess: '',
          gameStatus: newStatus,
          history: newHistory,
        });
      },

      resetGame: (specificLevel) => {
        const level = specificLevel || get().level;
        const config = getLevelConfig(level);
        const solution = config.words[Math.floor(Math.random() * config.words.length)];
        
        set({
          guesses: [],
          currentGuess: '',
          solution: solution.toUpperCase(),
          gameStatus: 'playing',
          level,
          wordLength: config.wordLength
        });
      },

      nextLevel: () => {
        const nextLv = get().level + 1;
        const config = getLevelConfig(nextLv);
        const solution = config.words[Math.floor(Math.random() * config.words.length)];
        
        set({
          guesses: [],
          currentGuess: '',
          solution: solution.toUpperCase(),
          gameStatus: 'playing',
          level: nextLv,
          wordLength: config.wordLength
        });
      }
    }),
    {
      name: 'wordle-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
