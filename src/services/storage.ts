import type { ScrobbleRule, ScrobbleHistoryItem, NowPlayingTrack } from '../types/scrobble_schema';

/**
 * Minimal interface representing a Cloudflare KV namespace.
 */
export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete?(key: string): Promise<void>;
}

export const STORAGE_KEYS = {
  API_TOKEN: 'nekofm:api_token',
  NOW_PLAYING: 'nekofm:now_playing',
  RULES: 'nekofm:rules',
  HISTORY: 'nekofm:history',
} as const;

// Module-level in-memory cache for local development and environments without KV bindings
export const memoryStore = new Map<string, string>();

/**
 * Resolves the KV namespace from the Cloudflare Worker environment if available.
 */
export function getKV(env?: unknown): KVLike | null {
  if (env && typeof env === 'object' && 'NEKOFM_KV' in env) {
    const kv = (env as Record<string, unknown>).NEKOFM_KV;
    if (kv && typeof kv === 'object' && 'get' in kv && 'put' in kv) {
      return kv as KVLike;
    }
  }
  return null;
}

/**
 * Retrieves a raw string value from KV or fallback in-memory cache.
 */
export async function getRawItem(key: string, env?: unknown): Promise<string | null> {
  const kv = getKV(env);
  if (kv) {
    return await kv.get(key);
  }
  return memoryStore.get(key) ?? null;
}

/**
 * Stores a raw string value to KV or fallback in-memory cache.
 */
export async function setRawItem(key: string, value: string, env?: unknown): Promise<void> {
  const kv = getKV(env);
  if (kv) {
    await kv.put(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

/**
 * Deletes an item from KV and in-memory cache.
 */
export async function deleteStorageItem(key: string, env?: unknown): Promise<void> {
  const kv = getKV(env);
  if (kv && 'delete' in kv && typeof kv.delete === 'function') {
    await kv.delete(key);
  }
  memoryStore.delete(key);
}

/**
 * Retrieves and deserializes a JSON object from storage.
 */
export async function getStorageItem<T>(key: string, env?: unknown): Promise<T | null> {
  const raw = await getRawItem(key, env);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Serializes and stores a JSON object to storage.
 */
export async function setStorageItem<T>(key: string, value: T, env?: unknown): Promise<void> {
  await setRawItem(key, JSON.stringify(value), env);
}

// Re-export domain types and methods for backward compatibility
export type { ScrobbleRule, ScrobbleHistoryItem, NowPlayingTrack };
export { generateToken, getApiToken, setApiToken, generateNewApiToken } from './apiToken';
export { getNowPlaying, setNowPlaying } from './nowPlaying';
export { getRules, setRules } from './rules';
export { getHistory, addHistory } from './history';
