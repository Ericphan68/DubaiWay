'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { redeemVoucher } from '@/server/services/booking-store';

export interface ScanState {
  readonly outcome: 'idle' | 'success' | 'duplicate' | 'invalid' | 'expired' | 'cancelled' | 'wrong_merchant' | 'forbidden';
  readonly message: string;
  readonly detail?: {
    readonly reference: string;
    readonly serviceTitle: string;
    readonly guestName: string;
    readonly guestCount: number;
    readonly serviceDate: string;
    readonly redeemedAt: string | null;
  };
}

/**
 * Quét voucher.
 *
 * Ba lớp kiểm tra: (1) người quét phải là thành viên merchant,
 * (2) voucher phải thuộc merchant đó, (3) chỉ redeem thành công một lần.
 */
export async function scanVoucherAction(_prev: ScanState, formData: FormData): Promise<ScanState> {
  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) {
    return { outcome: 'forbidden', message: 'Bạn không có quyền quét voucher.' };
  }

  const merchant = getMerchantForUser(user.id);
  if (!merchant) {
    return { outcome: 'forbidden', message: 'Tài khoản của bạn chưa gắn với đối tác nào.' };
  }

  const code = String(formData.get('code') ?? '').trim();
  if (!code) return { outcome: 'invalid', message: 'Vui lòng nhập hoặc quét mã voucher.' };

  const result = redeemVoucher(code, merchant.id);
  revalidatePath('/merchant/quet-ma');

  return {
    outcome: result.outcome,
    message: result.message,
    detail: result.booking
      ? {
          reference: result.booking.reference,
          serviceTitle: result.booking.serviceTitle,
          guestName: result.booking.travelers[0]?.fullName ?? '—',
          guestCount: result.booking.voucher.guestCount,
          serviceDate: result.booking.voucher.serviceDate,
          redeemedAt: result.booking.voucher.redeemedAt,
        }
      : undefined,
  };
}
