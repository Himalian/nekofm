import { Hono } from 'hono';
import { getRules, setRules, type ScrobbleRule } from '../services/apiToken';

const rulesRouter = new Hono();

/**
 * GET /api/rules
 * Returns all configured scrobble rules.
 */
rulesRouter.get('/', async (c) => {
  const rules = await getRules(c.env);
  return c.json({ rules });
});

/**
 * PUT /api/rules
 * Saves or updates the complete list of rules.
 */
rulesRouter.put('/', async (c) => {
  try {
    const body = await c.req.json<{ rules: ScrobbleRule[] }>();
    if (!Array.isArray(body?.rules)) {
      return c.json({ error: 'Rules must be an array' }, 400);
    }
    await setRules(c.env, body.rules);
    return c.json({ success: true, rules: body.rules });
  } catch (error) {
    return c.json({ error: 'Failed to update rules' }, 500);
  }
});

export default rulesRouter;
