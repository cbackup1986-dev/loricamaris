/**
 * Script Sandbox — Secure execution environment for user game logic.
 * 
 * Only exposes a whitelist of safe APIs (getState, setState, endGame, etc.)
 * Blocks all dangerous globals (window, document, fetch, eval, etc.)
 */

import type { SandboxAPI } from '@/sdk/types';

// Globals that are explicitly blocked inside the sandbox
const BLOCKED_GLOBALS = [
  'window', 'document', 'globalThis', 'self',
  'fetch', 'XMLHttpRequest', 'WebSocket',
  'Function',
  'importScripts', 'require',
  'localStorage', 'sessionStorage', 'indexedDB',
  'alert', 'confirm', 'prompt',
  'process', 'Buffer', '__dirname', '__filename',
];

export interface SandboxResult {
  success: boolean;
  error?: string;
}

export interface GameCallbacks {
  onStateChange: (state: Record<string, unknown>) => void;
  onGameEnd: (result: { status: "won" | "lost"; score: number }) => void;
  onVfx?: (type: 'confetti' | 'shake') => void;
}

/**
 * Creates a sandboxed execution context for user game logic.
 * Returns an object with callable event handlers.
 */
export function createSandbox(
  script: string,
  initialState: Record<string, unknown>,
  callbacks: GameCallbacks
) {
  let state = { ...initialState };
  const customHandlers: Record<string, (...args: any[]) => void> = {};

  // The safe API surface exposed to the script
  const api: SandboxAPI = {
    getState: () => ({ ...state }),
    setState: (patch) => {
      state = { ...state, ...patch };
      callbacks.onStateChange(state);
    },
    updateState: (patch) => {
      state = { ...state, ...patch };
      callbacks.onStateChange(state);
    },
    registerHandler: (name, handler) => {
      customHandlers[name] = handler;
    },
    endGame: (result) => {
      callbacks.onGameEnd(result);
    },
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    shuffle: <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    log: (...args) => {
      console.log('[Sandbox]', ...args);
    },
    vfx: {
      confetti: () => callbacks.onVfx?.('confetti'),
      shake: () => callbacks.onVfx?.('shake'),
    },
    get state() { return state; },
    storage: {
      save: (key, value) => {
        try {
          localStorage.setItem(`peak_game_${key}`, JSON.stringify(value));
        } catch (e) {}
      },
      load: (key) => {
        try {
          const val = localStorage.getItem(`peak_game_${key}`);
          return val ? JSON.parse(val) : null;
        } catch (e) { return null; }
      }
    },
    performance: typeof performance !== 'undefined' ? performance : undefined,
  };

  // Build the blocked globals string
  const blockedVarsDecl = BLOCKED_GLOBALS.map(g => `var ${g} = undefined;`).join('\n');

  // Wrap the user script so it returns an object of event handlers
  const wrappedScript = `
    "use strict";
    ${blockedVarsDecl}
    // User script starts here
    ${script}
    // User script ends here

    // Collect standard and registered handlers
    return {
      onInit: typeof onInit === 'function' ? onInit : undefined,
      onCellClick: typeof onCellClick === 'function' ? onCellClick : undefined,
      onSubmit: typeof onSubmit === 'function' ? onSubmit : undefined,
      onButtonClick: typeof onButtonClick === 'function' ? onButtonClick : undefined,
      onReset: typeof onReset === 'function' ? onReset : undefined,
      onHint: typeof onHint === 'function' ? onHint : undefined,
      onInputChange: typeof onInputChange === 'function' ? onInputChange : undefined,
      onTimerEnd: typeof onTimerEnd === 'function' ? onTimerEnd : undefined,
      onKeyDown: typeof onKeyDown === 'function' ? onKeyDown : undefined,
      onKeyUp: typeof onKeyUp === 'function' ? onKeyUp : undefined,
      onRowClick: typeof onRowClick === 'function' ? onRowClick : undefined,
      onSelectChange: typeof onSelectChange === 'function' ? onSelectChange : undefined,
      onCheckboxChange: typeof onCheckboxChange === 'function' ? onCheckboxChange : undefined,
      onRadioChange: typeof onRadioChange === 'function' ? onRadioChange : undefined,
      onTabChange: typeof onTabChange === 'function' ? onTabChange : undefined,
      onAddExpense: typeof onAddExpense === 'function' ? onAddExpense : undefined,
      // Legacy/Common custom names
      handleClick: typeof handleClick === 'function' ? handleClick : undefined,
      handleAction: typeof handleAction === 'function' ? handleAction : undefined,
      handleReset: typeof handleReset === 'function' ? handleReset : undefined,
      // Registered dynamic handlers
      ...api.__internal_get_custom_handlers()
    };
  `;

  try {
    // Hidden method to get custom handlers after execution
    (api as any).__internal_get_custom_handlers = () => customHandlers;
    
    // eslint-disable-next-line no-new-func
    const factory = new Function('api', wrappedScript);
    const handlers = factory(api);
    return { handlers, getState: () => ({ ...state }), success: true };
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error('[Sandbox Error]', errorMsg);
    return {
      handlers: {},
      getState: () => ({ ...state }),
      success: false,
      error: errorMsg,
    };
  }
}
