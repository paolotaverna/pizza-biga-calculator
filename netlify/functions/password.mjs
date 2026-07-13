import { getStore } from '@netlify/blobs';
import { bearerEmail, validPassword, verifyPassword, hashPassword, json, readJson } from './lib/core.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const email = bearerEmail(req, process.env.AUTH_SECRET);
  if (!email) return json(401, { error: 'auth' });

  const body = await readJson(req);
  if (!body || typeof body.oldPassword !== 'string') return json(400, { error: 'input' });
  if (!validPassword(body.newPassword)) return json(400, { error: 'password' });

  const users = getStore({ name: 'users', consistency: 'strong' });
  const user = await users.get(email, { type: 'json' });
  if (!user || !verifyPassword(body.oldPassword, user.salt, user.hash)) {
    return json(401, { error: 'credentials' });
  }
  const { salt, hash } = hashPassword(body.newPassword);
  await users.setJSON(email, { ...user, salt, hash, updatedAt: new Date().toISOString() });
  return json(200, { ok: true });
};

export const config = { path: '/api/password' };
