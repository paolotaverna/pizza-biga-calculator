import { getStore } from '@netlify/blobs';
import { normalizeEmail, verifyPassword, signToken, json, readJson } from './lib/core.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const body = await readJson(req);
  const email = normalizeEmail(body && body.email);
  if (!email || typeof (body && body.password) !== 'string') return json(400, { error: 'input' });

  const users = getStore({ name: 'users', consistency: 'strong' });
  const user = await users.get(email, { type: 'json' });
  if (!user || !verifyPassword(body.password, user.salt, user.hash)) {
    await sleep(800); // rallenta i tentativi a vuoto
    return json(401, { error: 'credentials' });
  }
  return json(200, { token: signToken(email, process.env.AUTH_SECRET), email });
};

export const config = { path: '/api/login' };
