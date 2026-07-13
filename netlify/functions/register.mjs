import { getStore } from '@netlify/blobs';
import { normalizeEmail, validPassword, hashPassword, signToken, json, readJson } from './lib/core.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const body = await readJson(req);
  const email = normalizeEmail(body && body.email);
  if (!email) return json(400, { error: 'email' });
  if (!validPassword(body.password)) return json(400, { error: 'password' });

  const users = getStore({ name: 'users', consistency: 'strong' });
  if (await users.get(email)) return json(409, { error: 'exists' });

  const { salt, hash } = hashPassword(body.password);
  await users.setJSON(email, { email, salt, hash, createdAt: new Date().toISOString() });
  return json(201, { token: signToken(email, process.env.AUTH_SECRET), email });
};

export const config = { path: '/api/register' };
