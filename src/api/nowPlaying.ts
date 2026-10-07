import { Hono } from 'hono';
import { getNowPlaying } from '../services/apiToken';

const router = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * GET /api/now-playing
 * Returns currently playing track or null if idle.
 */
router.get('/', async (c) => {
  const track = await getNowPlaying(c.env);
  return c.json({ nowPlaying: track });
});

export default router;
