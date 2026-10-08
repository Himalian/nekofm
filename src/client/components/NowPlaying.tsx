import React, { useEffect, useState, useCallback } from 'react';
import { Music2, Radio, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';
import type { NowPlayingTrack } from '../../types/scrobble_schema';
import { fetchNowPlaying } from '../services/api';

export interface NowPlayingProps {
  className?: string;
}

export default function NowPlaying({ className }: NowPlayingProps) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const track = await fetchNowPlaying();
      setNowPlaying(track);
    } catch (err) {
      console.error('Failed to load now playing track:', err);
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
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-muted-foreground" />
          <CardTitle>Now Playing</CardTitle>
          <Badge variant={nowPlaying ? 'default' : 'secondary'}>
            {nowPlaying ? 'Active' : 'Idle'}
          </Badge>
        </div>

        <CardAction className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setPollingActive((prev) => !prev)}
          >
            {pollingActive ? 'Polling (4s): On' : 'Polling: Off'}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleManualRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {nowPlaying && nowPlaying.trackName ? (
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Music2 className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="truncate text-base font-medium">
                {nowPlaying.trackName}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {nowPlaying.artistName || 'Unknown Artist'}
                {nowPlaying.releaseName ? ` • ${nowPlaying.releaseName}` : ''}
              </p>
              {(nowPlaying.submissionClient || nowPlaying.mediaPlayer) && (
                <p className="font-mono text-xs text-muted-foreground">
                  Client: {nowPlaying.submissionClient || nowPlaying.mediaPlayer}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Music2 className="mb-2 size-8 stroke-1 opacity-50" />
            <p className="text-sm">No track is currently playing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

