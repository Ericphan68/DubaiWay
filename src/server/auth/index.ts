/**
 * Điểm vào của lớp xác thực: chọn provider và đọc/ghi phiên qua cookie.
 *
 * Cookie phiên đặt httpOnly + sameSite=lax + secure ở production, để JavaScript
 * phía client không đọc được token (chống XSS đánh cắp phiên).
 */
import { cookies } from 'next/headers';
import { hasSupabase } from '@/server/env';
import { memoryAuthProvider } from './memory-provider';
import { supabaseAuthProvider } from './supabase-provider';
import type { AuthProvider, SessionUser } from './types';

export const SESSION_COOKIE = 'dw_session';

export function getAuthProvider(): AuthProvider {
  return hasSupabase ? supabaseAuthProvider : memoryAuthProvider;
}

/** Đọc người dùng của phiên hiện tại. Trả null nếu chưa đăng nhập. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await getAuthProvider().getUserByToken(token);
  } catch {
    // Token hỏng hoặc hết hạn — coi như chưa đăng nhập, không làm sập trang.
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export * from './permissions';
export * from './types';
