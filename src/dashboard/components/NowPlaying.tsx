import { JSX } from "hono/jsx/jsx-runtime";
import type { NowPlayingTrack } from "../../types/scrobble_schema";

interface NowPlayingProps {
  initialNowPlaying?: NowPlayingTrack | null;
}

/**
 * NowPlaying component renders current track information or empty state.
 */
export default function NowPlaying({ initialNowPlaying }: NowPlayingProps): JSX.Element {
  return (
    <section id="now-playing-section" class="border p-4 rounded-md flex flex-col gap-3">
      <h2 class="text-xl font-semibold">Now Playing</h2>
      <div id="track-container" class={initialNowPlaying ? "flex flex-col gap-1" : "hidden"}>
        <div class="text-lg font-medium" id="track-name">
          {initialNowPlaying?.trackName ?? ""}
        </div>
        <div class="text-base text-gray-700" id="artist-name">
          {initialNowPlaying?.artistName ?? ""}
        </div>
        <div class="text-sm text-gray-500" id="release-name">
          {initialNowPlaying?.releaseName ?? ""}
        </div>
        <div class="text-xs text-gray-400 mt-2" id="client-info">
          {initialNowPlaying?.submissionClient || initialNowPlaying?.mediaPlayer
            ? `Client: ${initialNowPlaying.submissionClient || initialNowPlaying.mediaPlayer}`
            : ""}
        </div>
      </div>
      <div
        id="empty-state"
        class={initialNowPlaying ? "hidden" : "text-sm text-gray-500 py-2"}
      >
        No track currently playing.
      </div>
    </section>
  );
}
