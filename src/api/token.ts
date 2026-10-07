import { Hono } from 'hono';
import { generateNewApiToken, getApiToken, setApiToken } from '../services/storage';

const router = new Hono();

/**
 * GET /api/token
 * Returns current API token.
 */
router.get('/', async (c) => {
  const token = await getApiToken(c.env);
  return c.json({ apiToken: token });
});

/**
 * POST /api/token/generate
 * Generates and returns a fresh high-entropy API token.
 */
router.post('/generate', async (c) => {
  const token = await generateNewApiToken(c.env);
  return c.json({ apiToken: token });
});

/**
 * PUT /api/token
 * Updates the API token with user-specified custom value.
 */
router.put('/', async (c) => {
  let body: { apiToken?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ code: 400, error: 'Invalid JSON request body' }, 400);
  }

  if (typeof body.apiToken !== 'string' || body.apiToken.trim().length === 0) {
    return c.json({ code: 400, error: 'Token must be a non-empty string' }, 400);
  }

  const newToken = body.apiToken.trim();
  await setApiToken(c.env, newToken);

  return c.json({ apiToken: newToken });
});

export default router;
