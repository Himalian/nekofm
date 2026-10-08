import type { ListenBrainz } from './listenbrainz';

/**
 * Internal schema representing the current playing track state.
 */
export interface NowPlayingTrack {
  trackName: string;
  artistName: string;
  releaseName?: string;
  listenedAt?: number | null;
  updatedAt: number;
  durationMs?: number;
  mediaPlayer?: string;
  submissionClient?: string;
  musicService?: string;
  additionalInfo?: ListenBrainz.AdditionalInfo;
  listenType: ListenBrainz.ListenType;
}

/**
 * Internal schema for application credentials and configuration.
 */
export interface AppConfig {
  apiToken: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Internal schema representing a scrobble rule for filtering and modifying tracks.
 */
export interface ScrobbleRule {
  id: string;
  name: string;
  enabled: boolean;
  field: 'track' | 'artist' | 'release';
  operator: 'contains' | 'equals' | 'regex';
  pattern: string;
  action: 'replace' | 'trim' | 'drop';
  replaceValue?: string;
}

/**
 * Internal schema representing an ingested scrobble history record.
 */
export interface ScrobbleHistoryItem {
  id: string;
  trackName: string;
  artistName: string;
  releaseName?: string;
  timestamp: number;
  status: 'forwarded' | 'modified' | 'dropped';
  ruleApplied?: string;
}

