import type { NowPlayingTrack } from '../types/scrobble_schema';

/**
 * Minimal interface representing a Cloudflare KV namespace.
 */
interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

declare const crypto: {
  getRandomValues(array: Uint8Array): Uint8Array;
};

const STORAGE_KEYS = {
  API_TOKEN: 'nekofm:api_token',
  NOW_PLAYING: 'nekofm:now_playing',
} as const;

// Module-level in-memory cache for local development and environments without KV bindings
const memoryStore = new Map<string, string>();

/**
 * Resolves the KV namespace from the Cloudflare Worker environment if available.
 */
function getKV(env?: unknown): KVLike | null {
  if (env && typeof env === 'object' && 'NEKOFM_KV' in env) {
    const kv = (env as Record<string, unknown>).NEKOFM_KV;
    if (kv && typeof kv === 'object' && 'get' in kv && 'put' in kv) {
      return kv as KVLike;
    }
  }
  return null;
}

/**
 * Generates a high-entropy API token.
 */
export function generateToken(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `neko_${hex}`;
}

/**
 * Resolves an initial API token from environment variables if configured.
 */
function getEnvToken(env?: unknown): string | null {
  if (env && typeof env === 'object') {
    const record = env as Record<string, unknown>;
    const envToken = record.API_TOKEN ?? record.NEKOFM_API_TOKEN;
    if (typeof envToken === 'string' && envToken.trim().length > 0) {
      return envToken.trim();
    }
  }
  return null;
}

/**
 * Retrieves the current API token. Automatically generates and stores an initial token if none exists.
 */
export async function getApiToken(env?: unknown): Promise<string> {
  const kv = getKV(env);
  let token: string | null = null;

  if (kv) {
    token = await kv.get(STORAGE_KEYS.API_TOKEN);
  } else {
    token = memoryStore.get(STORAGE_KEYS.API_TOKEN) ?? null;
  }

  if (!token) {
    token = getEnvToken(env) ?? generateToken();
    await setApiToken(env, token);
  }

  return token;
}

/**
 * Updates the API token with a specific value.
 */
export async function setApiToken(env: unknown, token: string): Promise<void> {
  const trimmed = token.trim();
  const kv = getKV(env);

  if (kv) {
    await kv.put(STORAGE_KEYS.API_TOKEN, trimmed);
  } else {
    memoryStore.set(STORAGE_KEYS.API_TOKEN, trimmed);
  }
}

/**
 * Generates a brand new API token and persists it.
 */
export async function generateNewApiToken(env?: unknown): Promise<string> {
  const newToken = generateToken();
  await setApiToken(env, newToken);
  return newToken;
}

/**
 * Retrieves the currently playing track from storage.
 */
export async function getNowPlaying(env?: unknown): Promise<NowPlayingTrack | null> {
  const kv = getKV(env);
  let rawJson: string | null = null;

  if (kv) {
    rawJson = await kv.get(STORAGE_KEYS.NOW_PLAYING);
  } else {
    rawJson = memoryStore.get(STORAGE_KEYS.NOW_PLAYING) ?? null;
  }

  if (!rawJson) {
    return null;
  }

  try {
    return JSON.parse(rawJson) as NowPlayingTrack;
  } catch {
    return null;
  }
}

/**
 * Persists the currently playing track state.
 */
export async function setNowPlaying(env: unknown, track: NowPlayingTrack): Promise<void> {
  const rawJson = JSON.stringify(track);
  const kv = getKV(env);

  if (kv) {
    await kv.put(STORAGE_KEYS.NOW_PLAYING, rawJson);
  } else {
    memoryStore.set(STORAGE_KEYS.NOW_PLAYING, rawJson);
  }
}
