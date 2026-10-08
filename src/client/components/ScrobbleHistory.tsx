import React, { useEffect, useState, useCallback } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from 'cn';
import type { ScrobbleHistoryItem } from '../../services/apiToken';
import { fetchHistory } from '../services/api';

export interface ScrobbleHistoryProps {
  className?: string;
}

export default function ScrobbleHistory({ className }: ScrobbleHistoryProps) {
  const [history, setHistory] = useState<ScrobbleHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const list = await fetchHistory();
      setHistory(list);
    } catch (err) {
      console.error('Failed to load scrobble history:', err);
    }
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <CardTitle>Recent Scrobbles</CardTitle>
          <Badge variant="secondary">{history.length}</Badge>
        </div>

        <CardAction>
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
        {history.length > 0 ? (
          <div className="divide-y divide-border">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 pr-4">
                  <div className="truncate font-medium">{item.trackName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.artistName}
                    {item.releaseName ? ` • ${item.releaseName}` : ''}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant={
                      item.status === 'forwarded'
                        ? 'outline'
                        : item.status === 'modified'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {item.status}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <History className="mb-2 size-8 stroke-1 opacity-50" />
            <p className="text-sm">No recent scrobbles recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

