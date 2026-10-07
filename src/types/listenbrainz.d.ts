/**
 * ListenBrainz Submission JSON Type Definitions
 * Based on ListenBrainz API v1 specification:
 * https://listenbrainz.readthedocs.io/en/latest/users/json.html#submission-json
 */
export namespace ListenBrainz {
	export type ListenType = 'single' | 'playing_now' | 'import';

	export interface AdditionalInfo {
		recording_mbid?: string;
		release_mbid?: string;
		artist_mbids?: string[];
		release_group_mbid?: string;
		track_mbid?: string;
		work_mbids?: string[];

		tracknumber?: number | string;
		discnumber?: number;
		isrc?: string;
		duration?: number;
		duration_ms?: number;

		spotify_id?: string;
		origin_url?: string;

		media_player?: string;
		media_player_version?: string;
		submission_client?: string;
		submission_client_version?: string;

		music_service?: string;
		music_service_name?: string;

		[key: string]: unknown;
	}

	export interface TrackMetadata {
		artist_name: string;
		track_name: string;
		release_name?: string;
		additional_info?: AdditionalInfo;
	}

	export interface Listen {
		listened_at?: number | null;
		track_metadata: TrackMetadata;
	}

	export interface SubmitPayload {
		listen_type: ListenType;
		payload: Listen[];
	}
}

export default ListenBrainz;
