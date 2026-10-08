import { STORAGE_KEYS, getRawItem, setRawItem } from './storage';
import type { ScrobbleRule, ScrobbleHistoryItem } from '../types/scrobble_schema';

// Re-export types for backward compatibility with existing imports
export type { ScrobbleRule, ScrobbleHistoryItem };

declare const crypto: {
  getRandomValues(array: Uint8Array): Uint8Array;
};

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
export function getEnvToken(env?: unknown): string | null {
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
  let token = await getRawItem(STORAGE_KEYS.API_TOKEN, env);

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
  await setRawItem(STORAGE_KEYS.API_TOKEN, trimmed, env);
}

/**
 * Generates a brand new API token and persists it.
 */
export async function generateNewApiToken(env?: unknown): Promise<string> {
  const newToken = generateToken();
  await setApiToken(env, newToken);
  return newToken;
}
