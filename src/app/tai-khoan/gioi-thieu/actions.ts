'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/server/auth';
import { WithdrawalError, requestWithdrawal } from '@/server/services/referral-store';

export interface WithdrawState {
  readonly error: string | null;
  readonly notice: string | null;
}

export async function requestWithdrawalAction(
  _prev: WithdrawState,
  formData: FormData,
): Promise<WithdrawState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };

  const raw = String(formData.get('amount') ?? '').replace(/[^\d.]/g, '');
  const major = Number.parseFloat(raw);
  if (!Number.isFinite(major) || major <= 0) {
    return { error: 'Số tiền không hợp lệ.', notice: null };
  }
  // Người dùng nhập theo USD; hệ thống làm việc bằng fils.
  const amountMinor = Math.round(major * 100);

  try {
    const req = requestWithdrawal(user.id, amountMinor);
    revalidatePath('/tai-khoan/gioi-thieu');
    return {
      error: null,
      notice: `Đã gửi yêu cầu rút ${(req.amountMinor / 100).toLocaleString('vi-VN')} USD. Bộ phận tài chính sẽ xử lý trong 3–5 ngày làm việc.`,
    };
  } catch (err) {
    return {
      error: err instanceof WithdrawalError ? err.message : 'Không gửi được yêu cầu rút tiền.',
      notice: null,
    };
  }
}
