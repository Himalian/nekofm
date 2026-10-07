import { JSX } from "hono/jsx/jsx-runtime";
import type { NowPlayingTrack } from "../types/scrobble_schema";

interface DashProps {
  initialNowPlaying?: NowPlayingTrack | null;
  initialToken?: string;
}

export default function Dash(props: DashProps): JSX.Element {
  const { initialNowPlaying, initialToken = "" } = props;

  return (
    <main class="max-w-2xl mx-auto p-6 font-sans flex flex-col gap-8">
      {/* App Header */}
      <header>
        <h1 class="text-3xl font-bold tracking-tight">NekoFM</h1>
      </header>

      {/* Component 1: Now Playing */}
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

      {/* Component 2: API Token (View, New, Edit) */}
      <section id="token-section" class="border p-4 rounded-md flex flex-col gap-4">
        <h2 class="text-xl font-semibold">API Token</h2>

        {/* View Token & Endpoint */}
        <div class="flex flex-col gap-2">
          <label for="current-token" class="text-sm font-medium">
            Current Token
          </label>
          <div class="flex gap-2">
            <input
              id="current-token"
              type="text"
              readOnly
              value={initialToken}
              class="border px-3 py-1.5 rounded flex-1 font-mono text-sm bg-gray-50"
            />
            <button
              id="btn-copy-token"
              type="button"
              class="border px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-100"
            >
              Copy
            </button>
          </div>
          <p class="text-xs text-gray-500">
            Submission Endpoint:{" "}
            <code id="endpoint-url" class="bg-gray-100 px-1 py-0.5 rounded">
              /api/listenbrainz/1/submit-listens
            </code>
          </p>
        </div>

        {/* New (Generate Token) */}
        <div class="flex items-center gap-2 pt-2 border-t">
          <button
            id="btn-generate-token"
            type="button"
            class="border px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-100"
          >
            Generate New Token
          </button>
        </div>

        {/* Edit (Custom Token) */}
        <div class="flex flex-col gap-2 pt-2 border-t">
          <label for="custom-token-input" class="text-sm font-medium">
            Edit Custom Token
          </label>
          <div class="flex gap-2">
            <input
              id="custom-token-input"
              type="text"
              placeholder="Enter custom token..."
              class="border px-3 py-1.5 rounded flex-1 text-sm font-mono"
            />
            <button
              id="btn-save-token"
              type="button"
              class="border px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-100"
            >
              Save
            </button>
          </div>
          <span id="token-status" class="text-xs text-gray-600 min-h-4"></span>
        </div>
      </section>

      {/* Lightweight Interaction Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const currentTokenEl = document.getElementById('current-token');
              const customTokenInputEl = document.getElementById('custom-token-input');
              const tokenStatusEl = document.getElementById('token-status');
              const btnCopy = document.getElementById('btn-copy-token');
              const btnGenerate = document.getElementById('btn-generate-token');
              const btnSave = document.getElementById('btn-save-token');

              const trackContainer = document.getElementById('track-container');
              const emptyState = document.getElementById('empty-state');
              const trackNameEl = document.getElementById('track-name');
              const artistNameEl = document.getElementById('artist-name');
              const releaseNameEl = document.getElementById('release-name');
              const clientInfoEl = document.getElementById('client-info');

              function showStatus(msg, isError) {
                if (!tokenStatusEl) return;
                tokenStatusEl.textContent = msg;
                tokenStatusEl.style.color = isError ? 'red' : 'green';
                setTimeout(() => { tokenStatusEl.textContent = ''; }, 3000);
              }

              // Copy Token
              if (btnCopy && currentTokenEl) {
                btnCopy.addEventListener('click', async () => {
                  try {
                    await navigator.clipboard.writeText(currentTokenEl.value);
                    showStatus('Token copied to clipboard!', false);
                  } catch (e) {
                    showStatus('Failed to copy token', true);
                  }
                });
              }

              // Generate New Token
              if (btnGenerate) {
                btnGenerate.addEventListener('click', async () => {
                  try {
                    const res = await fetch('/api/token/generate', { method: 'POST' });
                    const data = await res.json();
                    if (data.apiToken && currentTokenEl) {
                      currentTokenEl.value = data.apiToken;
                      showStatus('New token generated successfully', false);
                    }
                  } catch (e) {
                    showStatus('Failed to generate token', true);
                  }
                });
              }

              // Edit / Save Custom Token
              if (btnSave && customTokenInputEl) {
                btnSave.addEventListener('click', async () => {
                  const val = customTokenInputEl.value.trim();
                  if (!val) {
                    showStatus('Token cannot be empty', true);
                    return;
                  }
                  try {
                    const res = await fetch('/api/token', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ apiToken: val })
                    });
                    const data = await res.json();
                    if (data.apiToken && currentTokenEl) {
                      currentTokenEl.value = data.apiToken;
                      customTokenInputEl.value = '';
                      showStatus('Custom token saved successfully', false);
                    }
                  } catch (e) {
                    showStatus('Failed to save token', true);
                  }
                });
              }

              // Poll Now Playing state every 4 seconds
              async function refreshNowPlaying() {
                try {
                  const res = await fetch('/api/now-playing');
                  if (!res.ok) return;
                  const data = await res.json();
                  const track = data.nowPlaying;

                  if (track && track.trackName) {
                    trackNameEl.textContent = track.trackName;
                    artistNameEl.textContent = track.artistName || '';
                    releaseNameEl.textContent = track.releaseName || '';
                    const client = track.submissionClient || track.mediaPlayer || '';
                    clientInfoEl.textContent = client ? 'Client: ' + client : '';
                    trackContainer.classList.remove('hidden');
                    emptyState.classList.add('hidden');
                  } else {
                    trackContainer.classList.add('hidden');
                    emptyState.classList.remove('hidden');
                  }
                } catch (e) {
                  // Silent fail for polling errors
                }
              }

              setInterval(refreshNowPlaying, 4000);
            })();
          `,
        }}
      />
    </main>
  );
}
