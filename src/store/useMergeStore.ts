import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface MergeItem {
  id: string;
  level: number; // 1 to 6
  isNew?: boolean;
  isMerged?: boolean;
}

export interface Order {
  id: string;
  targetLevel: number;
  count: number;
  reward: number;
}

interface MergeState {
  grid: (MergeItem | null)[][];
  orders: Order[];
  level: number;
  xp: number;
  totalOrdersFulfilled: number;

  // Actions
  moveOrMerge: (from: [number, number], to: [number, number]) => void;
  spawnItem: () => void;
  resetGame: () => void;
  fulfillOrder: (orderId: string) => void;
}

const GRID_SIZE = 5;

const ITEM_DATA = {
  1: { name: 'Seed', icon: '🌱' },
  2: { name: 'Sprout', icon: '🌿' },
  3: { name: 'Clover', icon: '☘️' },
  4: { name: 'Flower', icon: '🌸' },
  5: { name: 'Fruit', icon: '🍎' },
  6: { name: 'Gem', icon: '💎' },
};

export const useMergeStore = create<MergeState>()(
  persist(
    (set, get) => ({
      grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
      orders: [],
      level: 1,
      xp: 0,
      totalOrdersFulfilled: 0,

      moveOrMerge: (from, to) => {
        const { grid } = get();
        const [fr, fc] = from;
        const [tr, tc] = to;
        const fromItem = grid[fr][fc];
        const toItem = grid[tr][tc];

        if (!fromItem || (fr === tr && fc === tc)) return;

        // Check if merge-able
        if (toItem && toItem.level === fromItem.level && fromItem.level < 6) {
          const newGrid = grid.map(row => [...row]);
          newGrid[fr][fc] = null;
          newGrid[tr][tc] = { 
            id: `merged-${Math.random().toString(36).slice(2, 9)}`, 
            level: fromItem.level + 1,
            isMerged: true
          };
          set({ grid: newGrid, xp: get().xp + fromItem.level * 10 });
        } else if (!toItem) {
          // Move logic
          const newGrid = grid.map(row => [...row]);
          newGrid[tr][tc] = { ...fromItem, isMerged: false, isNew: false };
          newGrid[fr][fc] = null;
          set({ grid: newGrid });
        }
      },

      spawnItem: () => {
        const { grid } = get();
        const emptyCells: [number, number][] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (!grid[r][c]) emptyCells.push([r, c]);
          }
        }

        if (emptyCells.length === 0) return;

        const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newGrid = grid.map(row => [...row]);
        const level = Math.random() > 0.9 ? 2 : 1;
        newGrid[r][c] = { 
          id: `spawn-${Math.random().toString(36).slice(2, 9)}`, 
          level,
          isNew: true 
        };
        set({ grid: newGrid });
      },

      fulfillOrder: (orderId) => {
        const { grid, orders, xp, level, totalOrdersFulfilled } = get();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Check if items exist on grid
        let foundCount = 0;
        const itemsToRemove: [number, number][] = [];

        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c]?.level === order.targetLevel) {
              foundCount++;
              itemsToRemove.push([r, c]);
              if (foundCount === order.count) break;
            }
          }
          if (foundCount === order.count) break;
        }

        if (foundCount < order.count) return;

        // Remove items
        const newGrid = grid.map(row => [...row]);
        itemsToRemove.forEach(([r, c]) => { newGrid[r][c] = null; });

        // Update stats
        const newXp = xp + order.reward;
        let newLevel = level;
        let finalXp = newXp;

        if (newXp >= level * 100) {
          newLevel++;
          finalXp = newXp - (level * 100);
        }

        // Generate new order to replace this one
        const newOrders = orders.filter(o => o.id !== orderId);
        const nextOrderLevel = Math.min(6, Math.floor(Math.random() * Math.min(level, 4)) + 1);
        newOrders.push({
          id: Math.random().toString(36),
          targetLevel: nextOrderLevel,
          count: 1,
          reward: nextOrderLevel * 50
        });

        set({ 
          grid: newGrid, 
          orders: newOrders, 
          xp: finalXp, 
          level: newLevel,
          totalOrdersFulfilled: totalOrdersFulfilled + 1
        });
      },

      resetGame: () => {
        const initialGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        // Spawn 4 initial items
        for (let i = 0; i < 4; i++) {
          const r = Math.floor(Math.random() * GRID_SIZE);
          const c = Math.floor(Math.random() * GRID_SIZE);
          if (!initialGrid[r][c]) {
            initialGrid[r][c] = { id: Math.random().toString(36), level: 1, isMerged: false, isNew: false };
          }
        }

        const initialOrders = [
          { id: 'o1', targetLevel: 2, count: 1, reward: 50 },
          { id: 'o2', targetLevel: 3, count: 1, reward: 120 }
        ];

        set({
          grid: initialGrid,
          orders: initialOrders,
          level: 1,
          xp: 0,
          totalOrdersFulfilled: 0
        });
      }
    }),
    {
      name: 'merge-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
