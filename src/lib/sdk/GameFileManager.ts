/**
 * Game File Manager — Handles reading/writing user game files on disk.
 * 
 * File structure:
 *   /app/data/user-works/[userId]/[gameSlug]/
 *     ├── manifest.json
 *     ├── definition.json
 *     └── logic.js
 */

import fs from 'fs/promises';
import path from 'path';
import type { GameManifest, GameDefinition } from '@/sdk/types';

const BASE_DIR = process.env.USER_WORKS_DIR || path.join(process.cwd(), 'data', 'user-works');

function gamePath(userId: string, slug: string): string {
  return path.join(BASE_DIR, userId, slug);
}

export async function ensureGameDir(userId: string, slug: string): Promise<string> {
  const dir = gamePath(userId, slug);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

// ─── Write Operations ────────────────────────────────────────

export async function saveManifest(userId: string, slug: string, manifest: GameManifest): Promise<void> {
  const dir = await ensureGameDir(userId, slug);
  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
}

export async function saveDefinition(userId: string, slug: string, definition: GameDefinition): Promise<void> {
  const dir = await ensureGameDir(userId, slug);
  await fs.writeFile(path.join(dir, 'definition.json'), JSON.stringify(definition, null, 2), 'utf-8');
}

export async function saveLogic(userId: string, slug: string, script: string): Promise<void> {
  const dir = await ensureGameDir(userId, slug);
  await fs.writeFile(path.join(dir, 'logic.js'), script, 'utf-8');
}

// ─── Read Operations ─────────────────────────────────────────

export async function readManifest(userId: string, slug: string): Promise<GameManifest | null> {
  const filePath = path.join(gamePath(userId, slug), 'manifest.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as GameManifest;
  } catch (error: any) {
    console.error(`[GameFileManager] Failed to read manifest at ${filePath}:`, error.message);
    return null;
  }
}

export async function readDefinition(userId: string, slug: string): Promise<GameDefinition | null> {
  const filePath = path.join(gamePath(userId, slug), 'definition.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as GameDefinition;
  } catch (error: any) {
    console.error(`[GameFileManager] Failed to read definition at ${filePath}:`, error.message);
    return null;
  }
}

export async function readLogic(userId: string, slug: string): Promise<string | null> {
  const filePath = path.join(gamePath(userId, slug), 'logic.js');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error: any) {
    console.error(`[GameFileManager] Failed to read logic at ${filePath}:`, error.message);
    return null;
  }
}

// ─── Delete Operations ───────────────────────────────────────

export async function deleteGameFiles(userId: string, slug: string): Promise<void> {
  try {
    await fs.rm(gamePath(userId, slug), { recursive: true, force: true });
  } catch {
    // Ignore if already deleted
  }
}

// ─── List Operations ─────────────────────────────────────────

export async function listUserGames(userId: string): Promise<string[]> {
  try {
    const userDir = path.join(BASE_DIR, userId);
    const entries = await fs.readdir(userDir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }
}
