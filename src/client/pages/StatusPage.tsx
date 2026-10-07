import React, { useEffect, useState, useCallback } from 'react';
import { Music2, Radio, RefreshCw, History, CheckCircle2, AlertCircle } from 'lucide-react';
import type { NowPlayingTrack } from '../../types/scrobble_schema';
import type { ScrobbleHistoryItem } from '../../services/apiToken';
import { fetchNowPlaying, fetchHistory } from '../services/api';

export default function StatusPage() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack | null>(null);
  const [history, setHistory] = useState<ScrobbleHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [track, historyList] = await Promise.all([
        fetchNowPlaying(),
        fetchHistory(),
      ]);
      setNowPlaying(track);
      setHistory(historyList);
    } catch (err) {
      console.error('Failed to load status data:', err);
    }
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    if (!pollingActive) return;

    const timer = setInterval(() => {
      fetchNowPlaying().then((track) => {
        setNowPlaying(track);
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [pollingActive, loadData]);

  return (
    <div className="space-y-6">
      {/* Now Playing Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className={`w-5 h-5 ${nowPlaying ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
            <h2 className="text-lg font-semibold text-gray-900">Now Playing</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                nowPlaying
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {nowPlaying ? 'Active Stream' : 'Idle'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPollingActive(!pollingActive)}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {pollingActive ? 'Polling (4s): On' : 'Polling: Off'}
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {nowPlaying && nowPlaying.trackName ? (
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Music2 className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {nowPlaying.trackName}
                </h3>
                <p className="text-base font-medium text-gray-700 truncate">
                  {nowPlaying.artistName || 'Unknown Artist'}
                </p>
                {nowPlaying.releaseName && (
                  <p className="text-sm text-gray-500 truncate">
                    {nowPlaying.releaseName}
                  </p>
                )}
                {(nowPlaying.submissionClient || nowPlaying.mediaPlayer) && (
                  <div className="pt-2">
                    <span className="inline-flex items-center text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Client: {nowPlaying.submissionClient || nowPlaying.mediaPlayer}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Music2 className="w-10 h-10 mx-auto mb-2 stroke-[1.5] opacity-50" />
              <p className="text-sm">No track is currently playing</p>
            </div>
          )}
        </div>
      </div>

      {/* Scrobble History Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Scrobble Stream</h2>
          </div>
          <span className="text-xs text-gray-400">{history.length} records</span>
        </div>

        <div className="divide-y divide-gray-100">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="space-y-0.5 min-w-0 pr-4">
                  <div className="font-medium text-gray-900 truncate">{item.trackName}</div>
                  <div className="text-sm text-gray-600 truncate">{item.artistName} {item.releaseName ? `• ${item.releaseName}` : ''}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      item.status === 'forwarded'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'modified'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.status === 'forwarded' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400">
              <History className="w-10 h-10 mx-auto mb-2 stroke-[1.5] opacity-50" />
              <p className="text-sm">No recent scrobbles recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
