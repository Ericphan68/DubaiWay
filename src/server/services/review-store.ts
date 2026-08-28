/**
 * Đánh giá dịch vụ.
 *
 * Quy tắc cứng: CHỈ khách có booking ở trạng thái `completed` mới viết được đánh giá,
 * và mỗi booking chỉ một đánh giá. Merchant được phản hồi nhưng KHÔNG sửa hay xoá
 * đánh giá của khách — phản hồi lưu ở trường riêng.
 */
import { randomUUID } from 'node:crypto';
import { getBookingByReference } from './booking-store';

export interface Review {
  readonly id: string;
  readonly bookingReference: string;
  readonly serviceId: string;
  readonly serviceSlug: string;
  readonly merchantId: string;
  readonly userId: string;
  readonly authorName: string;
  readonly ratingOverall: number;
  readonly ratingQuality: number | null;
  readonly ratingValue: number | null;
  readonly ratingService: number | null;
  readonly ratingAccuracy: number | null;
  readonly comment: string;
  isHidden: boolean;
  hiddenReason: string | null;
  merchantResponse: string | null;
  readonly createdAt: string;
}

interface ReviewState { reviews: Review[] }
const g = globalThis as unknown as { __dubaiwayReviews?: ReviewState };
const state: ReviewState = (g.__dubaiwayReviews ??= { reviews: [] });

export class ReviewError extends Error {
  constructor(message: string) { super(message); this.name = 'ReviewError'; }
}

export interface CreateReviewInput {
  readonly bookingReference: string;
  readonly userId: string;
  readonly authorName: string;
  readonly ratingOverall: number;
  readonly ratingQuality?: number;
  readonly ratingValue?: number;
  readonly ratingService?: number;
  readonly ratingAccuracy?: number;
  readonly comment: string;
}

function validRating(n: number | undefined): number | null {
  if (n === undefined) return null;
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new ReviewError('Điểm đánh giá phải là số nguyên từ 1 đến 5');
  }
  return n;
}

export function createReview(input: CreateReviewInput): Review {
  const booking = getBookingByReference(input.bookingReference);
  if (!booking) throw new ReviewError('Không tìm thấy đơn hàng');

  // Chỉ chủ đơn mới đánh giá được đơn của mình.
  if (booking.userId !== input.userId) {
    throw new ReviewError('Bạn chỉ đánh giá được đơn hàng của chính mình');
  }
  // Chưa dùng dịch vụ thì chưa có gì để đánh giá.
  if (booking.status !== 'completed') {
    throw new ReviewError('Chỉ đánh giá được sau khi đã sử dụng dịch vụ');
  }
  if (state.reviews.some((r) => r.bookingReference === input.bookingReference)) {
    throw new ReviewError('Đơn hàng này đã được đánh giá');
  }
  if (!Number.isInteger(input.ratingOverall) || input.ratingOverall < 1 || input.ratingOverall > 5) {
    throw new ReviewError('Vui lòng chọn số sao từ 1 đến 5');
  }
  if (input.comment.trim().length < 10) {
    throw new ReviewError('Nhận xét cần ít nhất 10 ký tự để có ích cho khách khác');
  }

  const review: Review = {
    id: randomUUID(),
    bookingReference: booking.reference,
    serviceId: booking.serviceId,
    serviceSlug: booking.serviceSlug,
    merchantId: booking.merchantId,
    userId: input.userId,
    authorName: input.authorName,
    ratingOverall: input.ratingOverall,
    ratingQuality: validRating(input.ratingQuality),
    ratingValue: validRating(input.ratingValue),
    ratingService: validRating(input.ratingService),
    ratingAccuracy: validRating(input.ratingAccuracy),
    comment: input.comment.trim(),
    isHidden: false,
    hiddenReason: null,
    merchantResponse: null,
    createdAt: new Date().toISOString(),
  };
  state.reviews.push(review);
  return review;
}

export function listReviewsForService(serviceSlug: string): Review[] {
  return state.reviews
    .filter((r) => r.serviceSlug === serviceSlug && !r.isHidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listReviewsForUser(userId: string): Review[] {
  return state.reviews.filter((r) => r.userId === userId);
}

export function listReviewsForMerchant(merchantId: string): Review[] {
  return state.reviews.filter((r) => r.merchantId === merchantId);
}

export function getReviewForBooking(reference: string): Review | null {
  return state.reviews.find((r) => r.bookingReference === reference) ?? null;
}

/** Merchant chỉ được PHẢN HỒI, không sửa nội dung đánh giá. */
export function respondToReview(reviewId: string, merchantId: string, body: string): Review {
  const r = state.reviews.find((x) => x.id === reviewId);
  if (!r) throw new ReviewError('Không tìm thấy đánh giá');
  if (r.merchantId !== merchantId) throw new ReviewError('Đánh giá này không thuộc đơn vị của bạn');
  if (body.trim().length < 5) throw new ReviewError('Phản hồi quá ngắn');
  r.merchantResponse = body.trim();
  return r;
}

/** Admin ẩn đánh giá vi phạm — BẮT BUỘC nêu lý do. */
export function hideReview(reviewId: string, reason: string): Review {
  const r = state.reviews.find((x) => x.id === reviewId);
  if (!r) throw new ReviewError('Không tìm thấy đánh giá');
  if (!reason.trim()) throw new ReviewError('Phải nêu lý do khi ẩn đánh giá');
  r.isHidden = true;
  r.hiddenReason = reason.trim();
  return r;
}

export interface RatingSummary {
  readonly count: number;
  readonly average: number;
}

export function ratingSummary(serviceSlug: string): RatingSummary {
  const list = listReviewsForService(serviceSlug);
  if (list.length === 0) return { count: 0, average: 0 };
  const total = list.reduce((s, r) => s + r.ratingOverall, 0);
  return { count: list.length, average: Math.round((total / list.length) * 10) / 10 };
}

/** Chỉ dùng trong test. */
export function __resetReviews(): void { state.reviews.length = 0; }
