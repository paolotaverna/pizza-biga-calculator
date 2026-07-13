import { getStore } from '@netlify/blobs';
import { bearerEmail, json, readJson } from './lib/core.mjs';

const MAX_RECIPES = 200;
const MAX_NAME = 60;

// La lista viaggia sempre intera: con poche decine di ricette per utente la
// sincronizzazione resta banale e senza conflitti da unire.
export default async (req) => {
  const email = bearerEmail(req, process.env.AUTH_SECRET);
  if (!email) return json(401, { error: 'auth' });

  const store = getStore({ name: 'recipes', consistency: 'strong' });

  if (req.method === 'GET') {
    const list = (await store.get(email, { type: 'json' })) || [];
    return json(200, { recipes: list });
  }

  if (req.method === 'PUT') {
    const body = await readJson(req);
    const list = body && body.recipes;
    if (!Array.isArray(list) || list.length > MAX_RECIPES) return json(400, { error: 'recipes' });
    const clean = list
      .filter((r) => r && typeof r.name === 'string' && r.params && typeof r.params === 'object')
      .map((r) => ({
        name: String(r.name).slice(0, MAX_NAME),
        params: r.params,
        savedAt: typeof r.savedAt === 'string' ? r.savedAt : new Date().toISOString(),
      }));
    await store.setJSON(email, clean);
    return json(200, { recipes: clean });
  }

  return json(405, { error: 'method' });
};

export const config = { path: '/api/recipes' };
