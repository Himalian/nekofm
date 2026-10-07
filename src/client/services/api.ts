import type { NowPlayingTrack } from '../../types/scrobble_schema';
import type { ScrobbleRule, ScrobbleHistoryItem } from '../../services/apiToken';

export async function fetchNowPlaying(): Promise<NowPlayingTrack | null> {
  const res = await fetch('/api/now-playing');
  if (!res.ok) return null;
  const data = (await res.json()) as { nowPlaying?: NowPlayingTrack | null };
  return data.nowPlaying ?? null;
}

export async function fetchApiToken(): Promise<string> {
  const res = await fetch('/api/token');
  if (!res.ok) return '';
  const data = (await res.json()) as { apiToken?: string };
  return data.apiToken ?? '';
}

export async function generateApiToken(): Promise<string> {
  const res = await fetch('/api/token/generate', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate token');
  const data = (await res.json()) as { apiToken: string };
  return data.apiToken;
}

export async function updateApiToken(apiToken: string): Promise<string> {
  const res = await fetch('/api/token', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiToken }),
  });
  if (!res.ok) throw new Error('Failed to update token');
  const data = (await res.json()) as { apiToken: string };
  return data.apiToken;
}

export async function fetchRules(): Promise<ScrobbleRule[]> {
  const res = await fetch('/api/rules');
  if (!res.ok) return [];
  const data = (await res.json()) as { rules?: ScrobbleRule[] };
  return data.rules ?? [];
}

export async function saveRules(rules: ScrobbleRule[]): Promise<ScrobbleRule[]> {
  const res = await fetch('/api/rules', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rules }),
  });
  if (!res.ok) throw new Error('Failed to save rules');
  const data = (await res.json()) as { rules: ScrobbleRule[] };
  return data.rules;
}

export async function fetchHistory(): Promise<ScrobbleHistoryItem[]> {
  const res = await fetch('/api/history');
  if (!res.ok) return [];
  const data = (await res.json()) as { history?: ScrobbleHistoryItem[] };
  return data.history ?? [];
}
