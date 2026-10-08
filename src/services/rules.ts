import type { ScrobbleRule } from '../types/scrobble_schema';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storage';

export type { ScrobbleRule };

/**
 * Retrieves configured scrobble rules from storage.
 */
export async function getRules(env?: unknown): Promise<ScrobbleRule[]> {
  const rules = await getStorageItem<ScrobbleRule[]>(STORAGE_KEYS.RULES, env);
  return rules ?? [];
}

/**
 * Saves configured scrobble rules to storage.
 */
export async function setRules(env: unknown, rules: ScrobbleRule[]): Promise<void> {
  await setStorageItem(STORAGE_KEYS.RULES, rules, env);
}
