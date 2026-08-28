'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth';
import {
  MerchantReviewError, registerMerchant, submitMerchantForReview,
} from '@/server/services/merchant-store';
import { recordAudit } from '@/server/services/audit-store';

export interface OnboardState {
  readonly error: string | null;
  readonly notice: string | null;
}

const schema = z.object({
  kind: z.enum(['business', 'individual']),
  displayName: z.string().trim().min(3, 'Tên hiển thị cần ít nhất 3 ký tự'),
  legalName: z.string().trim().optional(),
  registrationNumber: z.string().trim().optional(),
  taxNumber: z.string().trim().optional(),
  individualFullName: z.string().trim().optional(),
  nationality: z.string().trim().max(2).optional(),
  contactEmail: z.string().trim().email('Email không hợp lệ'),
  contactPhone: z.string().trim().min(6, 'Số điện thoại không hợp lệ'),
  city: z.string().trim().min(2),
  country: z.string().trim().length(2, 'Mã quốc gia gồm 2 chữ, VD: AE'),
  description: z.string().trim().min(30, 'Mô tả cần ít nhất 30 ký tự'),
  documentNames: z.string().optional().default(''),
});

export async function registerMerchantAction(
  _prev: OnboardState,
  formData: FormData,
): Promise<OnboardState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập trước khi đăng ký đối tác.', notice: null };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  const d = parsed.data;

  try {
    const m = registerMerchant({
      kind: d.kind,
      ownerUserId: user.id,
      displayName: d.displayName,
      legalName: d.legalName,
      registrationNumber: d.registrationNumber,
      taxNumber: d.taxNumber,
      individualFullName: d.individualFullName,
      nationality: d.nationality,
      contactEmail: d.contactEmail,
      contactPhone: d.contactPhone,
      city: d.city,
      country: d.country,
      description: d.description,
      // Chỉ ghi nhận TÊN giấy tờ. Tải file lên kho riêng tư sẽ bổ sung khi có Supabase Storage.
      documentNames: d.documentNames.split('\n').map((x) => x.trim()).filter(Boolean),
    });
    recordAudit({
      actorId: user.id, actorName: user.fullName ?? user.email, actorRoles: user.roles,
      action: 'merchant.register', entityType: 'merchant', entityId: m.id,
      afterData: { displayName: m.displayName, kind: m.kind, status: m.status },
    });
    revalidatePath('/merchant/ho-so');
    redirect('/merchant/ho-so?created=1');
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    return {
      error: err instanceof MerchantReviewError ? err.message : 'Không tạo được hồ sơ.',
      notice: null,
    };
  }
}

export async function submitMerchantAction(
  _prev: OnboardState,
  formData: FormData,
): Promise<OnboardState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Bạn cần đăng nhập.', notice: null };
  try {
    const m = submitMerchantForReview(String(formData.get('merchantId') ?? ''), user.id);
    recordAudit({
      actorId: user.id, actorName: user.fullName ?? user.email, actorRoles: user.roles,
      action: 'merchant.submit', entityType: 'merchant', entityId: m.id,
      afterData: { status: m.status },
    });
    revalidatePath('/merchant/ho-so');
    return { error: null, notice: 'Đã nộp hồ sơ. DubaiWay thẩm định trong 1–2 ngày làm việc.' };
  } catch (err) {
    return {
      error: err instanceof MerchantReviewError ? err.message : 'Không nộp được hồ sơ.',
      notice: null,
    };
  }
}
