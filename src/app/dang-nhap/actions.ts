'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { AREA_HOME, AREA_SIGN_IN, areaForHost } from '@/config/hosts';
import { clearSessionCookie, getAuthProvider, setSessionCookie } from '@/server/auth';
import {
  getOrCreateReferralCode, getUserByCode, recordAttribution,
} from '@/server/services/referral-store';

export interface AuthFormState {
  readonly error: string | null;
  readonly notice?: string | null;
  readonly fieldErrors?: Record<string, string>;
  /**
   * Những giá trị cần điền lại vào form sau khi lỗi.
   * React 19 xoá trắng form sau mỗi form action, nên nếu không trả lại thì
   * người dùng phải gõ lại từ đầu — và lần bấm tiếp theo sẽ gửi ô rỗng.
   * KHÔNG BAO GIỜ đưa mật khẩu vào đây.
   */
  readonly values?: Record<string, string>;
  /**
   * Đích cần TẢI LẠI ĐẦY ĐỦ sau khi đăng nhập.
   *
   * Dùng cho khu đối tác và quản trị. `redirect()` của Next là điều hướng mềm,
   * mà điều hướng mềm giữ nguyên khung trang đã dựng lúc đầu — đăng nhập xong
   * vẫn thấy thanh menu của trang khách trên tên miền nội bộ. Để trình duyệt
   * tải lại thật thì khung trang được dựng lại đúng theo tên miền.
   */
  readonly hardRedirect?: string;
}

/** Đọc lại các ô an toàn để điền vào form. Bỏ qua mật khẩu và các ô nhạy cảm. */
function keepValues(formData: FormData, fields: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = formData.get(f);
    if (typeof v === 'string' && v !== '') out[f] = v;
  }
  return out;
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
  const keep = keepValues(formData, ['email']);
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: 'Vui lòng kiểm tra lại thông tin.',
      fieldErrors: fieldErrorsOf(parsed.error),
      values: keep,
    };
  }
  const result = await getAuthProvider().signIn({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (!result.ok) return { error: result.error, values: keep };

  await setSessionCookie(result.token);

  // Chỉ nhận đường dẫn nội bộ — chặn chuyển hướng sang tên miền lạ (open redirect).
  const raw = parsed.data.next;
  const safe = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : null;
  const area = areaForHost((await headers()).get('host') ?? '');

  // Mỗi khu về đúng nhà của mình; middleware sẽ chặn nếu đích không hợp lệ.
  const target = safe ?? AREA_HOME[area];
  if (area !== 'customer') return { error: null, hardRedirect: target };
  redirect(target);
}

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  referralCode: z.string().trim().optional(),
  accept: z.literal('on', { errorMap: () => ({ message: 'Bạn cần đồng ý với điều khoản' }) }),
});

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const keep = keepValues(formData, ['fullName', 'email', 'referralCode']);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: 'Vui lòng kiểm tra lại thông tin.',
      fieldErrors: fieldErrorsOf(parsed.error),
      values: keep,
    };
  }
  const result = await getAuthProvider().signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    referralCode: parsed.data.referralCode || undefined,
  });
  if (!result.ok) return { error: result.error, values: keep };

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
  const area = areaForHost((await headers()).get('host') ?? '');
  // Đăng xuất khỏi khu nội bộ thì về đúng trang đăng nhập của khu đó,
  // không đẩy người ta ra trang bán hàng cho khách.
  redirect(AREA_SIGN_IN[area]);
}

const resetSchema = z.object({ email: z.string().trim().email('Email không hợp lệ') });

export async function requestResetAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: fieldErrorsOf(parsed.error),
      values: keepValues(formData, ['email']),
    };
  }
  const r = await getAuthProvider().requestPasswordReset(parsed.data.email);
  return { error: null, notice: r.message };
}
