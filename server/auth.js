import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const TOKEN_LIFETIME = '7d';

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function checkPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

export function createToken(user) {
  return jwt.sign({ id: user.id, matric: user.matric }, JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME,
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'You must be signed in to do that.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}
