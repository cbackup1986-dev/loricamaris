"use client"

/**
 * GameRenderer — Dynamic runtime renderer for user-created games.
 * 
 * Takes a GameDefinition (declarative JSON) and a logic script string,
 * then builds real React components and wires up the sandbox for interactivity.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createSandbox } from '@/lib/sdk/ScriptSandbox';
import type { GameDefinition, ComponentDef } from '@/sdk/types';
import { RotateCcw, Trophy, Info } from 'lucide-react';

interface GameRendererProps {
  definition: GameDefinition;
  script: string;
  title: string;
  onGameEnd?: (result: { status: "won" | "lost"; score: number }) => void;
}

export default function GameRenderer({ definition, script, title, onGameEnd }: GameRendererProps) {
  // Utility to prevent React "Objects are not valid as a React child" crashes
  const safeText = useCallback((val: unknown): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }, []);

  const [gameState, setGameState] = useState<Record<string, unknown>>(definition?.initialState || {});
  const [gameResult, setGameResult] = useState<{ status: "won" | "lost"; score: number } | null>(null);
  const [error, setError] = useState<string | null>(null);  const [vfxActive, setVfxActive] = useState<{ confetti: boolean; shake: boolean }>({ confetti: false, shake: false });
  const [resetKey, setResetKey] = useState(0);

  // Initialize the sandbox
  const sandbox = useMemo(() => {
    return createSandbox(script, definition?.initialState || {}, {
      onStateChange: (newState) => setGameState({ ...newState }),
      onGameEnd: (result) => {
        setGameResult(result);
        onGameEnd?.(result);
      },
      onVfx: (type) => {
        if (type === 'confetti') {
          setVfxActive(prev => ({ ...prev, confetti: true }));
          setTimeout(() => setVfxActive(prev => ({ ...prev, confetti: false })), 3000);
        } else if (type === 'shake') {
          setVfxActive(prev => ({ ...prev, shake: true }));
          setTimeout(() => setVfxActive(prev => ({ ...prev, shake: false })), 500);
        }
      }
    });
  }, [script, definition?.initialState, resetKey]);

  // Call onInit when the game loads or resets
  useEffect(() => {
    if (sandbox.success && sandbox.handlers.onInit) {
      try {
        sandbox.handlers.onInit();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Init error');
      }
    } else if (!sandbox.success) {
      setError(sandbox.error || 'Failed to load game script');
    }
  }, [sandbox]);

  // Handle events from components
  const handleEvent = useCallback((eventName: string, ...args: unknown[]) => {
    const handler = sandbox.handlers[eventName];
    if (handler) {
      try {
        handler(...args);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Runtime error');
      }
    }
  }, [sandbox]);

  // Listen for keyboard events
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      handleEvent('onKeyDown', e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      handleEvent('onKeyUp', e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleEvent]);

  // Reset game
  const handleReset = useCallback(() => {
    setGameState({ ...definition?.initialState || {} });
    setGameResult(null);
    setError(null);
    setVfxActive({ confetti: false, shake: false });
    setResetKey(prev => prev + 1);
  }, [definition?.initialState]);


  // Build component map for quick lookup
  const componentMap = useMemo(() => {
    const map = new Map<string, ComponentDef>();
    (definition?.components || []).forEach(c => map.set(c.id, c));
    return map;
  }, [definition?.components]);

  // Recursive component renderer
  const renderComponent = useCallback((id: string): React.ReactNode => {
    const comp = componentMap.get(id);
    if (!comp) return null;

    const stateValue = comp.bindState ? gameState[comp.bindState] : undefined;
    const children = Array.isArray(comp.children) 
      ? comp.children.map(childId => renderComponent(childId))
      : null;

    switch (comp.type) {
      case 'Container':
        return (
          <div key={id} className={cn("w-full", comp.props?.className as string, typeof stateValue === 'string' ? stateValue : '')}>
            {children}
          </div>
        );

      case 'Row':
        return (
          <div key={id} className={cn("flex items-center gap-2", comp.props?.className as string, typeof stateValue === 'string' ? stateValue : '')}>
            {children}
          </div>
        );

      case 'Column':
        return (
          <div key={id} className={cn("flex flex-col gap-2", comp.props?.className as string, typeof stateValue === 'string' ? stateValue : '')}>
            {children}
          </div>
        );

      case 'Grid': {
        const cols = (comp.props?.cols as number) || 4;
        const gridData = (stateValue as unknown[]) || [];
        return (
          <div 
            key={id} 
            className={cn(`grid gap-1.5`, comp.props?.className as string)}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.isArray(gridData) ? gridData.map((cell, idx) => {
              const cellData = cell as Record<string, unknown>;
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEvent('onCellClick', idx, cellData)}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all",
                    cellData?.status === 'correct' && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20",
                    cellData?.status === 'wrong' && "bg-red-500 border-red-500 text-white",
                    cellData?.status === 'selected' && "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 scale-105",
                    cellData?.status === 'matched' && "bg-amber-500 border-amber-500 text-white",
                    (!cellData?.status || cellData?.status === 'default') && "border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                  )}
                >
                  {cellData?.value !== undefined ? safeText(cellData.value) : ''}
                </motion.button>
              );
            }) : null}
          </div>
        );
      }

      case 'Button':
        return (
          <motion.button
            key={id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEvent(comp.bindEvent || 'onButtonClick', comp.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
              comp.props?.variant === 'primary'
                ? "brand-gradient text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
              comp.props?.className as string,
            )}
          >
            {safeText(stateValue !== undefined ? stateValue : (comp.props?.label ?? 'Button'))}
          </motion.button>
        );

      case 'Text': {
        const textContent = safeText(stateValue !== undefined ? stateValue : (comp.props?.content ?? ''));
        const tag = (comp.props?.tag as string) || 'p';
        const textClass = cn(
          tag === 'h1' && "text-2xl font-black",
          tag === 'h2' && "text-xl font-bold",
          tag === 'h3' && "text-lg font-semibold",
          tag === 'p' && "text-sm text-muted-foreground",
          tag === 'span' && "text-xs",
          comp.props?.className as string,
        );
        return <div key={id} className={textClass}>{textContent}</div>;
      }

      case 'ScoreBoard': {
        const score = (stateValue as number) ?? 0;
        return (
          <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score</span>
            <span className="text-lg font-black text-indigo-500">{safeText(stateValue ?? 0)}</span>
          </div>
        );
      }

      case 'Timer': {
        const seconds = (stateValue as number) ?? 0;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return (
          <div key={id} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-sm font-bold">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        );
      }

      case 'Input':
        return (
          <input
            key={id}
            type="text"
            value={(stateValue as string) ?? ''}
            onChange={(e) => handleEvent('onInputChange', comp.id, e.target.value)}
            placeholder={(comp.props?.placeholder as string) ?? ''}
            className={cn(
              "px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500",
              comp.props?.className as string,
            )}
          />
        );

      case 'Table': {
        const stateValueRaw = comp.bindState ? gameState[comp.bindState] : undefined;
        const data = Array.isArray(stateValueRaw) ? (stateValueRaw as Array<Record<string, unknown>>) : [];
        const columnsRaw = comp.props?.columns;
        const columns = Array.isArray(columnsRaw) ? (columnsRaw as Array<{ key: string; label?: string; header?: string }>) : [];
        
        return (
          <div key={id} className={cn("w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800", comp.props?.className as string)}>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                      {safeText(col.label || col.header || col.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {Array.isArray(data) ? data.map((row, idx) => (
                  <tr key={idx} onClick={() => handleEvent('onRowClick', comp.id, row)} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 font-medium">{safeText(row[col.key] ?? '')}</td>
                    ))}
                  </tr>
                )) : null}
                {(!Array.isArray(data) || data.length === 0) && (
                  <tr>
                    <td colSpan={columns.length || 1} className="px-4 py-8 text-center text-muted-foreground italic">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }

      case 'Card':
        return (
          <div key={id} className={cn("p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800", comp.props?.className as string)}>
            {Boolean(comp.props?.title) && <h3 className="text-lg font-black mb-4">{safeText(comp.props!.title)}</h3>}
            {children}
          </div>
        );

      case 'Divider':
        return <hr key={id} className={cn("my-4 border-slate-200 dark:border-slate-800 w-full", comp.props?.className as string)} />;

      case 'Select': {
        const optionsRaw = comp.props?.options;
        const options = Array.isArray(optionsRaw) ? (optionsRaw as Array<{ value: string; label: string }>) : [];
        return (
          <select
            key={id}
            value={(stateValue as string) ?? ''}
            onChange={(e) => handleEvent('onSelectChange', comp.id, e.target.value)}
            className={cn(
              "px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full appearance-none",
              comp.props?.className as string
            )}
          >
            {Boolean(comp.props?.placeholder) && <option value="" disabled>{safeText(comp.props!.placeholder)}</option>}
            {Array.isArray(options) ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>{safeText(opt.label)}</option>
            )) : null}
          </select>
        );
      }

      case 'Checkbox': {
        const isChecked = !!stateValue;
        return (
          <label key={id} className={cn("flex items-center gap-3 cursor-pointer", comp.props?.className as string)}>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleEvent('onCheckboxChange', comp.id, e.target.checked)}
                className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 checked:border-indigo-500 checked:bg-indigo-500 transition-all"
              />
              <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {Boolean(comp.props?.label) && <span className="text-sm font-medium">{safeText(comp.props!.label)}</span>}
          </label>
        );
      }

      case 'Radio': {
        const isChecked = stateValue === comp.props?.value;
        return (
          <label key={id} className={cn("flex items-center gap-3 cursor-pointer", comp.props?.className as string)}>
            <div className="relative flex items-center">
              <input
                type="radio"
                name={(comp.props?.name as string) || comp.id}
                checked={isChecked}
                onChange={() => handleEvent('onRadioChange', comp.id, comp.props?.value)}
                className="peer h-5 w-5 appearance-none rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 checked:border-indigo-500 checked:bg-white transition-all"
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            {Boolean(comp.props?.label) && <span className="text-sm font-medium">{safeText(comp.props!.label)}</span>}
          </label>
        );
      }

      case 'Chart': {
        const stateValueRaw = comp.bindState ? gameState[comp.bindState] : undefined;
        const data = Array.isArray(stateValueRaw) ? (stateValueRaw as Array<Record<string, unknown>>) : [];
        const xKey = (comp.props?.xKey as string) || 'label';
        const yKey = (comp.props?.yKey as string) || 'value';
        
        const maxY = Array.isArray(data) && data.length > 0
          ? Math.max(...data.map(d => Number(d[yKey]) || 0), 1)
          : 1;

        return (
          <div key={id} className={cn("w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4", comp.props?.className as string)}>
            {Boolean(comp.props?.title) && <h4 className="font-bold text-sm text-center">{safeText(comp.props!.title)}</h4>}
            <div className="flex items-end justify-around h-40 gap-2 mt-4">
              {Array.isArray(data) ? data.map((d, i) => {
                const val = Number(d[yKey]) || 0;
                const heightPct = Math.max((val / maxY) * 100, 1);
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full relative flex justify-center h-full items-end">
                      <div className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-indigo-400" style={{ height: `${heightPct}%` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-2 py-0.5 rounded">
                          {val}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">{safeText(d[xKey] ?? '')}</span>
                  </div>
                );
              }) : null}
            </div>
          </div>
        );
      }

      case 'Tabs': {
        const tabsRaw = comp.props?.tabs;
        const tabs = Array.isArray(tabsRaw) ? (tabsRaw as Array<{ id: string; label: string }>) : [];
        const activeTab = (stateValue as string) || tabs[0]?.id;
        return (
          <div key={id} className={cn("w-full flex flex-col gap-4", comp.props?.className as string)}>
            <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800">
              {Array.isArray(tabs) ? tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleEvent('onTabChange', comp.id, tab.id)}
                  className={cn(
                    "px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.id 
                      ? "border-indigo-500 text-indigo-500" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {safeText(tab.label)}
                </button>
              )) : null}
            </div>
            <div className="w-full">
              {children}
            </div>
          </div>
        );
      }

      default:
        return <div key={id} className="text-red-500 text-xs">Unknown: {comp.type}</div>;
    }
  }, [componentMap, gameState, handleEvent]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
        <div className="p-4 bg-red-500/10 rounded-2xl">
          <Info size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold">Game Error</h3>
        <p className="text-sm text-muted-foreground max-w-sm font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">{safeText(error)}</p>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm">
          <RotateCcw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2 md:px-4 max-w-2xl mx-auto w-full overflow-hidden">
      {/* Game Result Overlay */}
      {gameResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card p-8 rounded-[2rem] shadow-2xl text-center space-y-6 max-w-sm w-full border-2 border-white/10"
          >
            <div className="inline-flex p-4 rounded-2xl brand-gradient text-white shadow-xl">
              {gameResult.status === 'won' ? <Trophy size={32} /> : <Info size={32} />}
            </div>
            <h3 className="text-3xl font-black">
              {gameResult.status === 'won' ? '🎉 You Won!' : 'Game Over'}
            </h3>
            <p className="text-muted-foreground">
              Score: <span className="font-black text-foreground text-xl">{gameResult.score}</span>
            </p>
            <button
              onClick={handleReset}
              className="w-full brand-gradient text-white py-4 rounded-2xl font-black text-base active:scale-95 transition-all shadow-xl"
            >
              Play Again
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* VFX: Confetti (Basic implementation using Framer Motion) */}
      {vfxActive.confetti && (
        <div className="fixed inset-0 pointer-events-none z-[99]">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: '50vw', 
                y: '50vh', 
                scale: 0,
                rotate: 0,
              }}
              animate={{ 
                x: `${Math.random() * 100}vw`, 
                y: `${Math.random() * 100}vh`, 
                scale: [0, 1, 0.5],
                rotate: 360,
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn(
                "absolute w-3 h-3 rounded-sm",
                ["bg-indigo-500", "bg-pink-500", "bg-yellow-500", "bg-emerald-500", "bg-blue-500"][i % 5]
              )}
            />
          ))}
        </div>
      )}

      {/* Rendered Game Components wrapped in Shake Container */}
      <motion.div
        animate={vfxActive.shake ? {
          x: [-2, 2, -2, 2, 0],
          y: [-1, 1, -1, 1, 0],
        } : {}}
        transition={{ duration: 0.1, repeat: 5 }}
        className="w-full flex justify-center"
      >
        {definition?.root ? renderComponent(definition.root) : <div className="text-muted-foreground text-xs italic">Empty game definition</div>}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold transition-all active:scale-95 text-xs"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}
