import { Hono } from 'hono';
import { renderer } from './renderer';
import Dash from './dashboard/Dash';
import listenbrainzRouter from './api/listenbrainz';
import tokenRouter from './api/token';
import nowPlayingRouter from './api/nowPlaying';
import { getApiToken, getNowPlaying } from './services/storage';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(renderer);

// Dashboard pages with SSR initial state
app.get('/', async (c) => {
  const [token, nowPlaying] = await Promise.all([
    getApiToken(c.env),
    getNowPlaying(c.env),
  ]);
  return c.render(<Dash initialToken={token} initialNowPlaying={nowPlaying} />);
});

app.get('/dashboard', async (c) => {
  const [token, nowPlaying] = await Promise.all([
    getApiToken(c.env),
    getNowPlaying(c.env),
  ]);
  return c.render(<Dash initialToken={token} initialNowPlaying={nowPlaying} />);
});

// Mounted API sub-routers
app.route('/api/listenbrainz', listenbrainzRouter);
app.route('/api/token', tokenRouter);
app.route('/api/now-playing', nowPlayingRouter);

app.get('/api/test', (c) => c.text('Hello from hono'));

export default app;
