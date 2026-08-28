'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth';
import {
  TravelerError, addTraveler, markAllRead, removeTraveler, toggleFavorite,
} from '@/server/services/customer-store';
import {
  CancellationError, DisputeError, addDisputeMessage, cancelWithRefund, openDispute,
} from '@/server/services/dispute-store';
import { getBookingByReference } from '@/server/services/booking-store';
import { getServiceBySlug } from '@/server/services/catalog-store';

export interface AccountState {
  readonly error: string | null;
  readonly notice: string | null;
}

// ─── YÊU THÍCH ──────────────────────────────────────────────────────────────
export async function toggleFavoriteAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập để lưu yêu thích.', notice: null };

  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) return { error: 'Thiếu dịch vụ.', notice: null };

  const now = toggleFavorite(user.id, slug);
  revalidatePath('/tai-khoan/yeu-thich');
  revalidatePath(`/dich-vu/${slug}`);
  return { error: null, notice: now ? 'Đã lưu vào yêu thích.' : 'Đã bỏ khỏi yêu thích.' };
}

// ─── NGƯỜI ĐI CÙNG ──────────────────────────────────────────────────────────
const travelerSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().trim().max(2).optional(),
  passportNumber: z.string().trim().max(20).optional(),
  passportExpiry: z.string().optional(),
  isPrimary: z.string().optional(),
});

export async function addTravelerAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };

  const parsed = travelerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  try {
    addTraveler({
      userId: user.id,
      fullName: parsed.data.fullName,
      dateOfBirth: parsed.data.dateOfBirth || undefined,
      nationality: parsed.data.nationality || undefined,
      passportNumber: parsed.data.passportNumber || undefined,
      passportExpiry: parsed.data.passportExpiry || undefined,
      isPrimary: parsed.data.isPrimary === 'on',
    });
    revalidatePath('/tai-khoan/nguoi-di-cung');
    return { error: null, notice: 'Đã lưu người đi cùng.' };
  } catch (err) {
    return { error: err instanceof TravelerError ? err.message : 'Không lưu được.', notice: null };
  }
}

export async function removeTravelerAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };
  const ok = removeTraveler(user.id, String(formData.get('travelerId') ?? ''));
  revalidatePath('/tai-khoan/nguoi-di-cung');
  return ok
    ? { error: null, notice: 'Đã xoá.' }
    : { error: 'Không tìm thấy người này trong danh sách của bạn.', notice: null };
}

// ─── HUỶ ĐƠN ────────────────────────────────────────────────────────────────
export async function cancelBookingAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };

  const reference = String(formData.get('reference') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (reason.length < 5) return { error: 'Vui lòng cho biết lý do huỷ.', notice: null };

  const booking = getBookingByReference(reference);
  if (!booking) return { error: 'Không tìm thấy đơn hàng.', notice: null };
  // Chặn ở máy chủ: chỉ huỷ được đơn của chính mình.
  if (booking.userId !== user.id) {
    return { error: 'Bạn chỉ huỷ được đơn hàng của chính mình.', notice: null };
  }

  // Bậc hoàn tiền lấy từ chính sách của dịch vụ, không lấy từ form.
  const service = getServiceBySlug(booking.serviceSlug);
  const tiers = service?.policies?.cancellationTiers ?? [];

  try {
    const rec = cancelWithRefund({
      reference, requestedBy: user.id, actorRole: 'customer', reason, tiers,
    });
    revalidatePath('/tai-khoan/don-hang');
    return {
      error: null,
      notice: rec.refundAmountMinor > 0
        ? `Đã huỷ đơn. Bạn được hoàn ${(rec.refundAmountMinor / 100).toLocaleString('vi-VN')} AED (${rec.refundRateBps / 100}%). Tiền về tài khoản trong 5–10 ngày làm việc.`
        : 'Đã huỷ đơn. Theo chính sách của dịch vụ, đơn này không được hoàn tiền.',
    };
  } catch (err) {
    return { error: err instanceof CancellationError ? err.message : 'Không huỷ được đơn.', notice: null };
  }
}

// ─── KHIẾU NẠI ──────────────────────────────────────────────────────────────
const disputeSchema = z.object({
  reference: z.string().min(1),
  category: z.string().min(1),
  subject: z.string().trim().min(5, 'Tiêu đề quá ngắn'),
  description: z.string().trim().min(20, 'Vui lòng mô tả rõ vấn đề, ít nhất 20 ký tự'),
});

export async function openDisputeAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };

  const parsed = disputeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  try {
    const d = openDispute({
      bookingReference: parsed.data.reference,
      openedBy: user.id,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
    });
    revalidatePath('/tai-khoan/khieu-nai');
    return { error: null, notice: `Đã mở khiếu nại ${d.reference}. Chúng tôi phản hồi trong 1–2 ngày làm việc.` };
  } catch (err) {
    return { error: err instanceof DisputeError ? err.message : 'Không mở được khiếu nại.', notice: null };
  }
}

export async function replyDisputeAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };
  try {
    addDisputeMessage({
      disputeId: String(formData.get('disputeId') ?? ''),
      senderId: user.id,
      senderRole: 'customer',
      body: String(formData.get('body') ?? ''),
    });
    revalidatePath('/tai-khoan/khieu-nai');
    return { error: null, notice: 'Đã gửi.' };
  } catch (err) {
    return { error: err instanceof DisputeError ? err.message : 'Không gửi được.', notice: null };
  }
}

// ─── THÔNG BÁO ──────────────────────────────────────────────────────────────
export async function markAllReadAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  markAllRead(user.id);
  revalidatePath('/tai-khoan/thong-bao');
}
