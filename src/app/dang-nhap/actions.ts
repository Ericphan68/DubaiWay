'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearSessionCookie, getAuthProvider, setSessionCookie } from '@/server/auth';
import {
  getOrCreateReferralCode, getUserByCode, recordAttribution,
} from '@/server/services/referral-store';

export interface AuthFormState {
  readonly error: string | null;
  readonly notice?: string | null;
  readonly fieldErrors?: Record<string, string>;
}

function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[issue.path.join('.')] = issue.message;
  return out;
}

const signInSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  next: z.string().optional(),
});

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: 'Vui lòng kiểm tra lại thông tin.', fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const result = await getAuthProvider().signIn({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (!result.ok) return { error: result.error };

  await setSessionCookie(result.token);
  // Chỉ nhận đường dẫn nội bộ — chặn chuyển hướng sang tên miền lạ (open redirect).
  const next = parsed.data.next;
  redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : '/tai-khoan');
}

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  referralCode: z.string().trim().optional(),
  accept: z.literal('on', { errorMap: () => ({ message: 'Bạn cần đồng ý với điều khoản' }) }),
});

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: 'Vui lòng kiểm tra lại thông tin.', fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const result = await getAuthProvider().signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    referralCode: parsed.data.referralCode || undefined,
  });
  if (!result.ok) return { error: result.error };

  // Mỗi tài khoản có mã giới thiệu riêng ngay từ lúc đăng ký.
  getOrCreateReferralCode(result.user.id);

  // Ghi nhận người giới thiệu — CHỈ MỘT TẦNG, và chỉ khi mã hợp lệ.
  // recordAttribution tự chặn tự giới thiệu và chặn gán người thứ hai.
  if (parsed.data.referralCode) {
    const referrerId = getUserByCode(parsed.data.referralCode);
    if (referrerId) recordAttribution(result.user.id, referrerId);
  }

  await setSessionCookie(result.token);
  redirect('/tai-khoan');
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/');
}

const resetSchema = z.object({ email: z.string().trim().email('Email không hợp lệ') });

export async function requestResetAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: null, fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const r = await getAuthProvider().requestPasswordReset(parsed.data.email);
  return { error: null, notice: r.message };
}
