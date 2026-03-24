import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SudokuState {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  solution: number[][];
  selectedCell: [number, number] | null;
  gameStatus: 'playing' | 'won';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  level: number;
  size: number;
  
  // Actions
  selectCell: (row: number, col: number) => void;
  setCellValue: (value: number | null) => void;
  resetGame: (level?: number) => void;
  nextLevel: () => void;
}

// Helper to generate a Sudoku solution and mask
const generateSudoku = (level: number) => {
  // Logic for grid size based on level
  let size = 9;
  if (level <= 10) size = 4;
  else if (level <= 30) size = 6;

  // Simple hardcoded solutions for demo/implementation
  // In a real app, use a proper algorithm or pre-generated seeds
  const solutions: Record<number, number[][]> = {
    4: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 3, 4, 1],
      [4, 1, 2, 3]
    ],
    6: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2]
    ],
    9: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  };

  const solution = solutions[size];
  
  // Difficulty scaling (masking)
  // Level 1 starts very easy (few blanks), getting harder
  let maskProbability = 0.3; // Level 1
  if (size === 4) maskProbability = 0.3 + (level * 0.02);
  else if (size === 6) maskProbability = 0.4 + ((level - 10) * 0.015);
  else maskProbability = 0.5 + ((level - 30) * 0.005);

  maskProbability = Math.min(maskProbability, 0.7); // Cap at 70% blank

  const board = solution.map(row => 
    row.map(val => Math.random() > maskProbability ? val : null)
  );
  
  return { board, solution, size };
};

export const useSudokuStore = create<SudokuState>()(
  persist(
    (set, get) => ({
      board: Array(4).fill(null).map(() => Array(4).fill(null)),
      initialBoard: Array(4).fill(null).map(() => Array(4).fill(null)),
      solution: Array(4).fill(0).map(() => Array(4).fill(0)),
      selectedCell: null,
      gameStatus: 'playing',
      difficulty: 'Easy',
      level: 1,
      size: 4,

      selectCell: (row, col) => set({ selectedCell: [row, col] }),

      setCellValue: (value) => {
        const { selectedCell, board, initialBoard, solution, gameStatus } = get();
        if (!selectedCell || gameStatus !== 'playing') return;
        
        const [r, c] = selectedCell;
        if (initialBoard[r][c] !== null) return;

        const newBoard = board.map((row, ri) => 
          row.map((val, ci) => (ri === r && ci === c ? value : val))
        );

        const isWon = newBoard.every((row, ri) => 
          row.every((val, ci) => val === solution[ri][ci])
        );

        set({ board: newBoard, gameStatus: isWon ? 'won' : 'playing' });
      },

      resetGame: (specificLevel) => {
        const targetLevel = specificLevel || get().level;
        const { board, solution, size } = generateSudoku(targetLevel);
        set({
          board: board,
          initialBoard: board.map(row => [...row]),
          solution,
          selectedCell: null,
          gameStatus: 'playing',
          level: targetLevel,
          size
        });
      },

      nextLevel: () => {
        const nextLv = get().level + 1;
        const { board, solution, size } = generateSudoku(nextLv);
        set({
          board: board,
          initialBoard: board.map(row => [...row]),
          solution,
          selectedCell: null,
          gameStatus: 'playing',
          level: nextLv,
          size
        });
      }
    }),
    {
      name: 'sudoku-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Force reset if state is inconsistent or from old version
        if (state && (!state.board || state.board.length !== state.size)) {
          state.resetGame(state.level || 1);
        }
      }
    }
  )
);
