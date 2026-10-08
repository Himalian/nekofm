import { Hono } from 'hono';
import { getHistory } from '../services/history';

const historyRouter = new Hono();

/**
 * GET /api/history
 * Returns recent scrobble history.
 */
historyRouter.get('/', async (c) => {
  const history = await getHistory(c.env);
  return c.json({ history });
});

export default historyRouter;
