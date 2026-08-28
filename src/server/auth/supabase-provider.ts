/**
 * Xác thực bằng Supabase Auth.
 *
 * Vai trò và merchant KHÔNG lấy từ JWT mà đọc lại từ bảng user_roles ở mỗi lần
 * dựng phiên. Lý do: người dùng có thể bị thu hồi quyền giữa hai lần đăng nhập,
 * và JWT cũ vẫn còn hạn — đọc lại từ database là nguồn sự thật duy nhất.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/server/env';
import type { AuthProvider, AuthResult, SessionUser, SignInInput, SignUpInput, UserRole } from './types';

function anonClient(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Client quyền cao — CHỈ dùng phía server, bỏ qua RLS. */
function adminClient(): SupabaseClient | null {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function loadRoles(userId: string): Promise<{ roles: UserRole[]; merchantId: string | null }> {
  const admin = adminClient();
  if (!admin) return { roles: ['customer'], merchantId: null };
  const { data } = await admin
    .from('user_roles')
    .select('role_key, merchant_id')
    .eq('user_id', userId);
  const rows = (data ?? []) as { role_key: string; merchant_id: string | null }[];
  const roles = rows.map((r) => r.role_key as UserRole);
  const merchantId = rows.find((r) => r.merchant_id)?.merchant_id ?? null;
  return { roles: roles.length > 0 ? roles : ['customer'], merchantId };
}

async function buildSessionUser(
  id: string,
  email: string,
  fullName: string | null,
  emailVerified: boolean,
): Promise<SessionUser> {
  const { roles, merchantId } = await loadRoles(id);
  return { id, email, fullName, locale: 'vi', emailVerified, roles, merchantId };
}

export const supabaseAuthProvider: AuthProvider = {
  name: 'supabase',
  isMemoryMode: false,

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const { data, error } = await anonClient().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName, locale: input.locale ?? 'vi', referral_code: input.referralCode },
        emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/xac-minh-email`,
      },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user || !data.session) {
      return { ok: false, error: 'Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.' };
    }
    const user = await buildSessionUser(
      data.user.id,
      data.user.email ?? input.email,
      input.fullName,
      Boolean(data.user.email_confirmed_at),
    );
    return { ok: true, user, token: data.session.access_token };
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    const { data, error } = await anonClient().auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    // Không chuyển nguyên văn lỗi của Supabase ra ngoài — tránh lộ email nào tồn tại.
    if (error || !data.user || !data.session) {
      return { ok: false, error: 'Email hoặc mật khẩu không đúng' };
    }
    const meta = data.user.user_metadata as { full_name?: string } | null;
    const user = await buildSessionUser(
      data.user.id,
      data.user.email ?? input.email,
      meta?.full_name ?? null,
      Boolean(data.user.email_confirmed_at),
    );
    return { ok: true, user, token: data.session.access_token };
  },

  async getUserByToken(token: string): Promise<SessionUser | null> {
    const { data, error } = await anonClient().auth.getUser(token);
    if (error || !data.user) return null;
    const meta = data.user.user_metadata as { full_name?: string } | null;
    return buildSessionUser(
      data.user.id,
      data.user.email ?? '',
      meta?.full_name ?? null,
      Boolean(data.user.email_confirmed_at),
    );
  },

  async requestPasswordReset(email: string) {
    await anonClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/dat-lai-mat-khau`,
    });
    // Luôn trả cùng thông báo dù email có tồn tại hay không.
    return {
      ok: true,
      message: `Nếu ${email} đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.`,
    };
  },
};
