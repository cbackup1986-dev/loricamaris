import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConnectionGroup {
  category: string;
  words: string[];
  level: 1 | 2 | 3 | 4; // Difficulty: 1 (yellow), 2 (green), 3 (blue), 4 (purple)
}

interface ConnectionsState {
  words: string[];
  selectedWords: string[];
  solvedGroups: ConnectionGroup[];
  mistakesRemaining: number;
  gameStatus: 'playing' | 'won' | 'lost';
  
  // Actions
  toggleWord: (word: string) => void;
  submitGuess: () => void;
  shuffleWords: () => void;
  resetGame: () => void;
}

const ALL_WORDS: ConnectionGroup[] = [
  { category: "BOARD GAMES", words: ["CHESS", "RISK", "CLUE", "SORRY"], level: 1 },
  { category: "REPTILES", words: ["PYTHON", "COBRA", "VIPER", "MAMBA"], level: 2 },
  { category: "PROGRAMMING LANGUAGES", words: ["JAVA", "SWIFT", "RUST", "GO"], level: 3 },
  { category: "_____ BOARD", words: ["KEY", "DASH", "SOUND", "CHIP"], level: 4 }
];

export const useConnectionsStore = create<ConnectionsState>()(
  persist(
    (set, get) => ({
      words: ALL_WORDS.flatMap(g => g.words).sort(() => Math.random() - 0.5),
      selectedWords: [],
      solvedGroups: [],
      mistakesRemaining: 4,
      gameStatus: 'playing',

      toggleWord: (word) => {
        const { selectedWords, gameStatus } = get();
        if (gameStatus !== 'playing') return;

        if (selectedWords.includes(word)) {
          set({ selectedWords: selectedWords.filter(w => w !== word) });
        } else if (selectedWords.length < 4) {
          set({ selectedWords: [...selectedWords, word] });
        }
      },

      submitGuess: () => {
        const { selectedWords, solvedGroups, mistakesRemaining, words, gameStatus } = get();
        if (selectedWords.length !== 4 || gameStatus !== 'playing') return;

        const matchingGroup = ALL_WORDS.find(g => 
          g.words.every(w => selectedWords.includes(w))
        );

        if (matchingGroup) {
          const newSolvedGroups = [...solvedGroups, matchingGroup];
          const remainingWords = words.filter(w => !selectedWords.includes(w));
          
          set({
            solvedGroups: newSolvedGroups,
            selectedWords: [],
            words: remainingWords,
            gameStatus: newSolvedGroups.length === 4 ? 'won' : 'playing'
          });
        } else {
          const newMistakes = mistakesRemaining - 1;
          set({
            mistakesRemaining: newMistakes,
            gameStatus: newMistakes === 0 ? 'lost' : 'playing'
          });
        }
      },

      shuffleWords: () => {
        const { words } = get();
        set({ words: [...words].sort(() => Math.random() - 0.5) });
      },

      resetGame: () => {
        set({
          words: ALL_WORDS.flatMap(g => g.words).sort(() => Math.random() - 0.5),
          selectedWords: [],
          solvedGroups: [],
          mistakesRemaining: 4,
          gameStatus: 'playing'
        });
      },
    }),
    {
      name: 'connections-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
