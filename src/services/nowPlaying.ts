import type { NowPlayingTrack } from '../types/scrobble_schema';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storage';

/**
 * Retrieves the currently playing track from storage.
 */
export async function getNowPlaying(env?: unknown): Promise<NowPlayingTrack | null> {
  return await getStorageItem<NowPlayingTrack>(STORAGE_KEYS.NOW_PLAYING, env);
}

/**
 * Persists the currently playing track state.
 */
export async function setNowPlaying(env: unknown, track: NowPlayingTrack): Promise<void> {
  await setStorageItem(STORAGE_KEYS.NOW_PLAYING, track, env);
}
