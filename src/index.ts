import { Hono } from 'hono';
import listenbrainzRouter from './api/listenbrainz';
import tokenRouter from './api/token';
import nowPlayingRouter from './api/nowPlaying';
import rulesRouter from './api/rules';
import historyRouter from './api/history';
import type { Env } from 'hono';

const app = new Hono();

// Mounted API sub-routers
app.route('/api/listenbrainz', listenbrainzRouter);
app.route('/api/token', tokenRouter);
app.route('/api/now-playing', nowPlayingRouter);
app.route('/api/rules', rulesRouter);
app.route('/api/history', historyRouter);

app.get('/apis/test', (c) => c.text(`Hello from NekoFM API,URL ${c.req.url}`));

app.get('/apis/get-url',(c) => c.text(new URL(c.req.url).origin))

export default app;
