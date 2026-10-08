import type { ScrobbleHistoryItem } from '../types/scrobble_schema';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storage';

export type { ScrobbleHistoryItem };

/**
 * Retrieves scrobble history from storage. Returns an empty array if none exists.
 */
export async function getHistory(env?: unknown): Promise<ScrobbleHistoryItem[]> {
  const history = await getStorageItem<ScrobbleHistoryItem[]>(STORAGE_KEYS.HISTORY, env);
  return history ?? [];
}

/**
 * Appends a scrobble item to history, preserving all historical items.
 */
export async function addHistory(env: unknown, item: ScrobbleHistoryItem): Promise<void> {
  const list = await getHistory(env);
  const updated = [item, ...list];
  await setStorageItem(STORAGE_KEYS.HISTORY, updated, env);
}
