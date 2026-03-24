import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface NumbrixState {
  grid: (number | null)[][];
  initialGrid: (number | null)[][];
  gameStatus: 'playing' | 'won';
  size: number;
  
  // Actions
  setCellValue: (row: number, col: number, value: number | null) => void;
  resetGame: (size?: number) => void;
}

const generateNumbrix = (size: number) => {
  // Simple predefined 5x5 for demo
  const solution = [
    [1, 2, 3, 4, 5],
    [10, 9, 8, 7, 6],
    [11, 12, 13, 14, 15],
    [20, 19, 18, 17, 16],
    [21, 22, 23, 24, 25]
  ];

  const grid = solution.map(row => row.map(val => (val === 1 || val === size * size || val % 5 === 0 ? val : null)));
  
  return { grid, solution };
};

export const useNumbrixStore = create<NumbrixState>()(
  persist(
    (set, get) => ({
      grid: Array(5).fill(null).map(() => Array(5).fill(null)),
      initialGrid: Array(5).fill(null).map(() => Array(5).fill(null)),
      gameStatus: 'playing',
      size: 5,

      setCellValue: (row, col, value) => {
        const { grid, initialGrid, size, gameStatus } = get();
        if (gameStatus !== 'playing' || initialGrid[row][col] !== null) return;

        const newGrid = grid.map((r, ri) => 
          r.map((v, ci) => (ri === row && ci === col ? value : v))
        );

        // Check if won
        let isWon = true;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            const val = newGrid[r][c];
            if (val === null) {
              isWon = false;
              break;
            }
            // Check adjacency (except for 1)
            if (val > 1) {
              let hasPrev = false;
              const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
              for (const [dr, dc] of neighbors) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && newGrid[nr][nc] === val - 1) {
                  hasPrev = true;
                  break;
                }
              }
              if (!hasPrev) {
                isWon = false;
                break;
              }
            }
          }
          if (!isWon) break;
        }

        set({ grid: newGrid, gameStatus: isWon ? 'won' : 'playing' });
      },

      resetGame: (size = 5) => {
        const { grid } = generateNumbrix(size);
        set({
          grid,
          initialGrid: grid.map(row => [...row]),
          gameStatus: 'playing',
          size
        });
      },
    }),
    {
      name: 'numbrix-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
