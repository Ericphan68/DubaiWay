'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { fromMajorUnits } from '@/core/money';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import {
  CatalogError, createServiceDraft, getService, setServiceStatus, updateService,
} from '@/server/services/catalog-store';
import { serviceState } from '@/core/state-machines';

export interface ServiceFormState {
  readonly error: string | null;
  readonly notice: string | null;
}

/** Tách chuỗi nhiều dòng thành mảng, bỏ dòng trống. */
function lines(value: string | undefined): string[] {
  return (value ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
}

const schema = z.object({
  titleVi: z.string().trim().min(5, 'Tên tiếng Việt cần ít nhất 5 ký tự'),
  titleEn: z.string().trim().min(5, 'Tên tiếng Anh cần ít nhất 5 ký tự'),
  summaryVi: z.string().trim().min(20, 'Mô tả ngắn tiếng Việt cần ít nhất 20 ký tự'),
  summaryEn: z.string().trim().min(20, 'Mô tả ngắn tiếng Anh cần ít nhất 20 ký tự'),
  descriptionVi: z.string().trim().min(50, 'Mô tả chi tiết tiếng Việt cần ít nhất 50 ký tự'),
  descriptionEn: z.string().trim().min(50, 'Mô tả chi tiết tiếng Anh cần ít nhất 50 ký tự'),
  categorySlug: z.string().min(1, 'Vui lòng chọn danh mục'),
  city: z.string().trim().min(2),
  meetingPoint: z.string().trim().max(300).optional().default(''),
  durationMinutes: z.coerce.number().int().min(15).max(20160),
  languages: z.string().optional().default('en'),
  minGuests: z.coerce.number().int().min(1).max(200),
  maxGuests: z.coerce.number().int().min(1).max(500),
  priceAdult: z.coerce.number().positive('Giá người lớn phải lớn hơn 0'),
  priceChild: z.string().optional().default(''),
  // Đối tác nhập theo phần trăm cho dễ hiểu; hệ thống làm việc bằng basis points.
  taxRatePercent: z.coerce.number().min(0).max(100).default(5),
  bookingCutoffHours: z.coerce.number().int().min(0).max(720).default(24),
  instantConfirmation: z.string().optional(),
  freeCancellation: z.string().optional(),
  pickupAvailable: z.string().optional(),
  highlights: z.string().optional().default(''),
  included: z.string().optional().default(''),
  excluded: z.string().optional().default(''),
  cancellationText: z.string().trim().max(500).optional().default(''),
});

async function requireMerchant() {
  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) return null;
  const merchant = getMerchantForUser(user.id);
  return merchant ? { user, merchant } : null;
}

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const ctx = await requireMerchant();
  if (!ctx) return { error: 'Bạn không có quyền tạo dịch vụ.', notice: null };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  const d = parsed.data;

  try {
    const service = createServiceDraft({
      merchantId: ctx.merchant.id,
      titleVi: d.titleVi, titleEn: d.titleEn,
      summaryVi: d.summaryVi, summaryEn: d.summaryEn,
      descriptionVi: d.descriptionVi, descriptionEn: d.descriptionEn,
      categorySlug: d.categorySlug,
      city: d.city,
      meetingPoint: d.meetingPoint,
      durationMinutes: d.durationMinutes,
      languages: d.languages.split(',').map((l) => l.trim()).filter(Boolean),
      minGuests: d.minGuests, maxGuests: d.maxGuests,
      priceAdult: fromMajorUnits(d.priceAdult, 'AED'),
      priceChild: d.priceChild ? fromMajorUnits(Number(d.priceChild), 'AED') : null,
      taxRateBps: Math.round(d.taxRatePercent * 100),
      instantConfirmation: d.instantConfirmation === 'on',
      freeCancellation: d.freeCancellation === 'on',
      pickupAvailable: d.pickupAvailable === 'on',
      bookingCutoffHours: d.bookingCutoffHours,
      highlightsVi: lines(d.highlights),
      includedVi: lines(d.included),
      excludedVi: lines(d.excluded),
      cancellationText: d.cancellationText,
    });
    revalidatePath('/merchant/dich-vu');
    redirect(`/merchant/dich-vu/${service.id}?created=1`);
  } catch (err) {
    // redirect() ném một lỗi đặc biệt của Next.js — không được nuốt nó.
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    return {
      error: err instanceof CatalogError ? err.message : 'Không tạo được dịch vụ.',
      notice: null,
    };
  }
}

export async function updateServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const ctx = await requireMerchant();
  if (!ctx) return { error: 'Bạn không có quyền sửa dịch vụ.', notice: null };

  const serviceId = String(formData.get('serviceId') ?? '');
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  const d = parsed.data;

  try {
    const s = updateService(serviceId, ctx.merchant.id, {
      titleVi: d.titleVi, titleEn: d.titleEn,
      summaryVi: d.summaryVi, summaryEn: d.summaryEn,
      descriptionVi: d.descriptionVi, descriptionEn: d.descriptionEn,
      categorySlug: d.categorySlug,
      city: d.city, meetingPoint: d.meetingPoint,
      durationMinutes: d.durationMinutes,
      languages: d.languages.split(',').map((l) => l.trim()).filter(Boolean),
      minGuests: d.minGuests, maxGuests: d.maxGuests,
      priceAdult: fromMajorUnits(d.priceAdult, 'AED'),
      priceChild: d.priceChild ? fromMajorUnits(Number(d.priceChild), 'AED') : null,
      taxRateBps: Math.round(d.taxRatePercent * 100),
      instantConfirmation: d.instantConfirmation === 'on',
      freeCancellation: d.freeCancellation === 'on',
      pickupAvailable: d.pickupAvailable === 'on',
      bookingCutoffHours: d.bookingCutoffHours,
      highlightsVi: lines(d.highlights),
      includedVi: lines(d.included),
      excludedVi: lines(d.excluded),
      cancellationText: d.cancellationText,
    });
    revalidatePath('/merchant/dich-vu');
    revalidatePath(`/merchant/dich-vu/${serviceId}`);
    return {
      error: null,
      notice: s.status === 'submitted'
        ? 'Đã lưu. Vì dịch vụ đang bán nên thay đổi cần DubaiWay duyệt lại trước khi hiển thị.'
        : 'Đã lưu thay đổi.',
    };
  } catch (err) {
    return { error: err instanceof CatalogError ? err.message : 'Không lưu được.', notice: null };
  }
}

/** Đối tác nộp dịch vụ nháp để DubaiWay duyệt. */
export async function submitForReviewAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const ctx = await requireMerchant();
  if (!ctx) return { error: 'Bạn không có quyền.', notice: null };

  const serviceId = String(formData.get('serviceId') ?? '');
  const s = getService(serviceId);
  if (!s) return { error: 'Không tìm thấy dịch vụ.', notice: null };
  if (s.merchantId !== ctx.merchant.id) {
    return { error: 'Dịch vụ không thuộc đơn vị của bạn.', notice: null };
  }
  if (ctx.merchant.status !== 'approved') {
    return { error: 'Hồ sơ đối tác của bạn chưa được duyệt nên chưa nộp dịch vụ được.', notice: null };
  }

  try {
    serviceState.assert(s.status, 'submitted');
    setServiceStatus(serviceId, 'submitted');
    revalidatePath('/merchant/dich-vu');
    revalidatePath(`/merchant/dich-vu/${serviceId}`);
    return { error: null, notice: 'Đã nộp. DubaiWay sẽ duyệt trong 1–2 ngày làm việc.' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Không nộp được.', notice: null };
  }
}

/** Đối tác tạm ngừng hoặc bật lại dịch vụ đã duyệt. */
export async function toggleServiceActiveAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const ctx = await requireMerchant();
  if (!ctx) return { error: 'Bạn không có quyền.', notice: null };

  const serviceId = String(formData.get('serviceId') ?? '');
  const to = String(formData.get('to') ?? '') === 'active' ? 'active' : 'inactive';
  const s = getService(serviceId);
  if (!s || s.merchantId !== ctx.merchant.id) {
    return { error: 'Dịch vụ không thuộc đơn vị của bạn.', notice: null };
  }
  if (to === 'active' && ctx.merchant.status !== 'approved') {
    return { error: 'Hồ sơ đối tác chưa được duyệt nên chưa bán được.', notice: null };
  }

  try {
    serviceState.assert(s.status, to);
    setServiceStatus(serviceId, to);
    revalidatePath('/merchant/dich-vu');
    revalidatePath(`/merchant/dich-vu/${serviceId}`);
    return { error: null, notice: to === 'active' ? 'Dịch vụ đã mở bán trở lại.' : 'Đã tạm ngừng bán.' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Không đổi được trạng thái.', notice: null };
  }
}
