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
