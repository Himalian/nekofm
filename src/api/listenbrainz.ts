import { Hono } from 'hono';
import type { ListenBrainz } from '../types/listenbrainz';
import type { NowPlayingTrack } from '../types/scrobble_schema';
import { getApiToken, setNowPlaying } from '../services/storage';

const router = new Hono();

/**
 * Extracts and normalizes the bearer or token credential from the Authorization header.
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && (parts[0].toLowerCase() === 'token' || parts[0].toLowerCase() === 'bearer')) {
    return parts[1];
  }
  return null;
}

/**
 * GET /api/listenbrainz/1/validate-token
 * Standard endpoint used by Pano Scrobbler and other clients to verify user credentials.
 */
router.get('/1/validate-token', async (c) => {
  const authHeader = c.req.header('Authorization');
  let clientToken = extractToken(authHeader);

  // Fallback to query parameter '?token=...'
  if (!clientToken) {
    clientToken = c.req.query('token') || null;
  }

  const expectedToken = await getApiToken(c.env);

  if (!clientToken || clientToken !== expectedToken) {
    return c.json(
      {
        code: 401,
        message: 'Token invalid.',
        valid: false,
      },
      401
    );
  }

  return c.json({
    code: 200,
    message: 'Token valid.',
    valid: true,
    user_name: 'nekofm',
  });
});

/**
 * POST /api/listenbrainz/1/submit-listens
 * Standard endpoint for submitting scrobbles and now-playing notifications.
 */
router.post('/1/submit-listens', async (c) => {
  const authHeader = c.req.header('Authorization');
  const clientToken = extractToken(authHeader);
  const expectedToken = await getApiToken(c.env);

  if (!clientToken || clientToken !== expectedToken) {
    return c.json(
      {
        code: 401,
        error: 'Invalid authorization token. Please provide Authorization: Token <token>',
      },
      401
    );
  }

  let body: ListenBrainz.SubmitPayload;
  try {
    body = await c.req.json<ListenBrainz.SubmitPayload>();
  } catch {
    return c.json({ code: 400, error: 'Invalid JSON payload' }, 400);
  }

  if (!body.payload || !Array.isArray(body.payload) || body.payload.length === 0) {
    return c.json({ code: 400, error: 'Payload array cannot be empty' }, 400);
  }

  const latestListen = body.payload[0];
  const metadata = latestListen.track_metadata;

  if (!metadata || !metadata.artist_name || !metadata.track_name) {
    return c.json({ code: 400, error: 'Missing track_metadata, artist_name, or track_name' }, 400);
  }

  const durationMs =
    metadata.additional_info?.duration_ms ??
    (typeof metadata.additional_info?.duration === 'number'
      ? metadata.additional_info.duration * 1000
      : undefined);

  const nowPlayingRecord: NowPlayingTrack = {
    trackName: metadata.track_name,
    artistName: metadata.artist_name,
    releaseName: metadata.release_name,
    listenedAt: latestListen.listened_at ?? null,
    updatedAt: Date.now(),
    durationMs,
    mediaPlayer: metadata.additional_info?.media_player,
    submissionClient: metadata.additional_info?.submission_client,
    musicService: metadata.additional_info?.music_service ?? metadata.additional_info?.music_service_name,
    additionalInfo: metadata.additional_info,
    listenType: body.listen_type,
  };

  await setNowPlaying(c.env, nowPlayingRecord);

  return c.json({ status: 'ok' });
});

export default router;
