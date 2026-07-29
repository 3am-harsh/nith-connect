import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'nith_app_session';
const JWT_SECRET = process.env.JWT_SECRET || 'nith-campus-secret-key-12345';
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'nith-campus-secret-key-12345')) {
  console.warn("WARNING: JWT_SECRET environment variable is missing or insecure in production!");
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  roll_number?: string;
  department?: string;
  hostel?: string;
  blood_group?: string;
  profile_picture?: string;
  role: string;
}

// Encrypt and sign session object
export function encryptSession(data: UserSession): string {
  const payload = JSON.stringify(data);
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

// Decrypt and verify session string
export function decryptSession(sessionStr: string): UserSession | null {
  try {
    const raw = Buffer.from(sessionStr, 'base64').toString('utf8');
    const { payload, signature } = JSON.parse(raw);
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    
    if (signature === expectedSignature) {
      return JSON.parse(payload) as UserSession;
    }
  } catch {
    // Invalid session
  }
  return null;
}

// Server functions for session retrieve
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie) return null;
  return decryptSession(sessionCookie.value);
}

// Server function to set session cookie
export async function setSession(user: UserSession) {
  const cookieStore = await cookies();
  const encrypted = encryptSession(user);
  cookieStore.set(SESSION_COOKIE, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

// Server function to delete session cookie
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Validate NITH email domain restriction
export function validateNithEmail(email: string): boolean {
  const devEmailsEnv = process.env.DEVELOPER_EMAILS || '';
  const devEmails = devEmailsEnv.split(',').map(e => e.trim().toLowerCase());
  const hardcodedDevs = ['sharmaharsh.exe@gmail.com', '25bec047@gmail.com', '25bec047@nith.ac.in'];
  return email.endsWith('@nith.ac.in') || devEmails.includes(email.toLowerCase()) || hardcodedDevs.includes(email.toLowerCase());
}
