'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { ReviewError, respondToReview } from '@/server/services/review-store';

export interface RespondState {
  readonly error: string | null;
  readonly notice: string | null;
}

/** Đối tác chỉ PHẢN HỒI, không sửa hay xoá được đánh giá của khách. */
export async function respondReviewAction(
  _prev: RespondState,
  formData: FormData,
): Promise<RespondState> {
  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) return { error: 'Bạn không có quyền.', notice: null };
  const merchant = getMerchantForUser(user.id);
  if (!merchant) return { error: 'Tài khoản chưa gắn với đối tác nào.', notice: null };

  try {
    respondToReview(
      String(formData.get('reviewId') ?? ''),
      merchant.id,
      String(formData.get('body') ?? ''),
    );
    revalidatePath('/merchant/danh-gia');
    return { error: null, notice: 'Đã đăng phản hồi.' };
  } catch (err) {
    return { error: err instanceof ReviewError ? err.message : 'Không đăng được phản hồi.', notice: null };
  }
}
