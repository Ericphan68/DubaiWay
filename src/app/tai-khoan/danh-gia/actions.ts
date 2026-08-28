'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth';
import { ReviewError, createReview } from '@/server/services/review-store';

export interface ReviewFormState {
  readonly error: string | null;
  readonly notice: string | null;
}

const schema = z.object({
  reference: z.string().min(1),
  ratingOverall: z.coerce.number().int().min(1).max(5),
  ratingQuality: z.coerce.number().int().min(1).max(5).optional(),
  ratingValue: z.coerce.number().int().min(1).max(5).optional(),
  ratingService: z.coerce.number().int().min(1).max(5).optional(),
  ratingAccuracy: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(10, 'Nhận xét cần ít nhất 10 ký tự'),
});

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập để đánh giá.', notice: null };

  const raw = Object.fromEntries(formData);
  // Bỏ các trường điểm chi tiết để trống, tránh coerce('') thành 0.
  for (const k of ['ratingQuality', 'ratingValue', 'ratingService', 'ratingAccuracy']) {
    if (raw[k] === '' || raw[k] === undefined) delete raw[k];
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }

  try {
    createReview({
      bookingReference: parsed.data.reference,
      userId: user.id,
      authorName: user.fullName ?? user.email.split('@')[0],
      ratingOverall: parsed.data.ratingOverall,
      ratingQuality: parsed.data.ratingQuality,
      ratingValue: parsed.data.ratingValue,
      ratingService: parsed.data.ratingService,
      ratingAccuracy: parsed.data.ratingAccuracy,
      comment: parsed.data.comment,
    });
    revalidatePath('/tai-khoan/don-hang');
    revalidatePath('/tai-khoan/danh-gia');
    return { error: null, notice: 'Cảm ơn bạn! Đánh giá đã được đăng.' };
  } catch (err) {
    return {
      error: err instanceof ReviewError ? err.message : 'Không gửi được đánh giá.',
      notice: null,
    };
  }
}
