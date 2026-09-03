import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'clarity-digital-academy-secret-token-key-2026';

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

export function generateToken(user: AdminUser): string {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // expired
    }

    return {
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function authenticateAdminCredentials(email: string, password: string): AdminUser | null {
  const verification = db.verifyAdminCredentials(email, password);
  if (verification.success && verification.user) {
    return verification.user;
  }
  return null;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token.trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }

  req.admin = user;
  next();
}
