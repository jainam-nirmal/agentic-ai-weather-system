import 'dotenv/config';
import jwt from 'jsonwebtoken';

/** Generate a valid signed JWT token */
export function generateToken(payload = {}) {
  return jwt.sign(
    { userId: 1, username: 'qa_engineer', role: 'tester', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/** Verify token — returns decoded payload or throws */
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/** Generate a token that is already expired */
export function generateExpiredToken() {
  return jwt.sign({ userId: 99 }, process.env.JWT_SECRET, { expiresIn: '1ms' });
}

/** Generate a token signed with the WRONG secret (tampered) */
export function generateTamperedToken() {
  return jwt.sign({ userId: 99 }, 'wrong_secret');
}

/** Build the Authorization header */
export function bearerHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Simulates a protected API endpoint that checks the JWT.
 * Returns { status: 200, user } on success or { status: 401, error } on failure.
 */
export function protectedEndpoint(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { status: 401, error: 'Missing or malformed Authorization header' };
  }
  const token = authHeader.split(' ')[1];
  try {
    const user = verifyToken(token);
    return { status: 200, user };
  } catch (err) {
    return { status: 401, error: err.message };
  }
}
