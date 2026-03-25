/**
 * LoricaMaris SDK V2 Type definitions
 * 
 * These types define the contract between LoricaMaris's runtime framework
 * and user-created games. Agents must conform to these interfaces.
 */

// ─── Game Manifest ───────────────────────────────────────────
export interface GameManifest {
  title: string;
  description: string;
  icon: string;          // Lucide icon name: "Brain", "Sparkles", etc.
  color: string;         // Tailwind bg class: "bg-pink-500"
  difficulty: "Easy" | "Medium" | "Hard";
}

// ─── Game Definition (UI Layout) ─────────────────────────────
// Declarative JSON that describes the game's visual structure.
// The GameRenderer interprets this to build real React components.

export type ComponentType =
  | "Grid"
  | "Cell"
  | "Button"
  | "Text"
  | "Timer"
  | "ScoreBoard"
  | "Container"
  | "Row"
  | "Column"
  | "Modal"
  | "Input"
  | "Table"
  | "Chart"
  | "Card"
  | "Select"
  | "Checkbox"
  | "Radio"
  | "Tabs"
  | "Divider";

export interface ComponentDef {
  id: string;
  type: ComponentType;
  props?: Record<string, unknown>;
  children?: string[];     // IDs of child components (adjacency list)
  bindState?: string;      // Bind to a state key for dynamic updates
  bindEvent?: string;      // Event handler name in the logic script
}

export interface GameDefinition {
  version: "1.0";
  root: string;            // ID of the root component
  components: ComponentDef[];
  initialState: Record<string, unknown>;
}

// ─── Sandbox API ─────────────────────────────────────────────
// These are the ONLY functions available to game logic scripts.
// Everything else (window, document, fetch, eval) is blocked.

export interface SandboxAPI {
  // ─── State & Data ───────────────────────────────────────────
  getState: () => Record<string, unknown>;
  setState: (patch: Record<string, unknown>) => void;
  updateState: (patch: Record<string, unknown>) => void; // Alias
  readonly state: Record<string, unknown>;

  // ─── Events & Lifecycle ─────────────────────────────────────
  registerHandler: (name: string, handler: (...args: any[]) => void) => void;
  endGame: (result: { status: "won" | "lost"; score: number }) => void;

  // ─── Utilities ──────────────────────────────────────────────
  wait: (ms: number) => Promise<void>;
  random: (min: number, max: number) => number;
  shuffle: <T>(arr: T[]) => T[];
  log: (...args: unknown[]) => void;

  // ─── Visual Effects (VFX) ───────────────────────────────────
  vfx: {
    confetti: () => void;
    shake: () => void;
  };

  // ─── Persistent Storage ─────────────────────────────────────
  storage: {
    save: (key: string, value: any) => void;
    load: (key: string) => any;
  };
  performance?: any;

  // ─── External Connectivity (Bridge) ─────────────────────────
  fetch: (url: string, options?: RequestInit) => Promise<any>;
  db: {
    getRow: (key: string) => Promise<any>;
    addRow: (key: string, value: any) => Promise<any>;
    updateRow: (key: string, value: any) => Promise<any>;
    deleteRow: (key: string) => Promise<any>;
  };
}

// ─── File Structure ──────────────────────────────────────────
// Each user game is stored as files on disk:
//
//   /app/data/user-games/[userId]/[gameSlug]/
//     ├── manifest.json      ← GameManifest
//     ├── definition.json    ← GameDefinition
//     └── logic.js           ← Game logic script (sandbox)
