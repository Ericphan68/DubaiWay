'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser, requirePermission, ForbiddenError } from '@/server/auth';
import {
  MerchantReviewError, transitionMerchant, transitionService,
} from '@/server/services/merchant-store';
import type { MerchantStatus, ServiceStatus } from '@/core/state-machines';
import { recordAudit } from '@/server/services/audit-store';
import { getMerchant } from '@/server/services/merchant-store';

export interface ReviewState {
  readonly error: string | null;
  readonly notice: string | null;
}

const merchantSchema = z.object({
  merchantId: z.string().min(1),
  to: z.enum(['under_review', 'changes_requested', 'approved', 'rejected', 'suspended', 'submitted']),
  reason: z.string().trim().max(500).optional(),
});

export async function reviewMerchantAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await getSessionUser();
  try {
    // Quyền kiểm ở máy chủ. Không có quyền thì không làm được gì, kể cả gọi thẳng API.
    requirePermission(user, 'merchant.review');
  } catch (err) {
    return { error: err instanceof ForbiddenError ? err.message : 'Không có quyền.', notice: null };
  }

  const parsed = merchantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ.', notice: null };

  // Từ chối và yêu cầu bổ sung bắt buộc phải nêu lý do — để merchant biết sửa gì.
  if ((parsed.data.to === 'rejected' || parsed.data.to === 'changes_requested') && !parsed.data.reason) {
    return { error: 'Vui lòng nêu lý do để đối tác biết cần bổ sung gì.', notice: null };
  }

  try {
    const before = getMerchant(parsed.data.merchantId);
    const m = transitionMerchant(
      parsed.data.merchantId,
      parsed.data.to as MerchantStatus,
      user!.id,
      parsed.data.reason,
    );
    // Ghi nhật ký: ai duyệt, đổi từ trạng thái nào sang nào, vì sao.
    recordAudit({
      actorId: user!.id,
      actorName: user!.fullName ?? user!.email,
      actorRoles: user!.roles,
      action: `merchant.${parsed.data.to}`,
      entityType: 'merchant',
      entityId: m.id,
      beforeData: { status: before?.status ?? null, displayName: before?.displayName ?? null },
      afterData: { status: m.status },
      reason: parsed.data.reason ?? null,
    });
    revalidatePath('/admin/merchant');
    return { error: null, notice: `Đã chuyển hồ sơ "${m.displayName}" sang trạng thái ${parsed.data.to}.` };
  } catch (err) {
    return {
      error: err instanceof MerchantReviewError || err instanceof Error ? err.message : 'Không thực hiện được.',
      notice: null,
    };
  }
}

const serviceSchema = z.object({
  serviceId: z.string().min(1),
  to: z.enum(['under_review', 'changes_requested', 'approved', 'active', 'inactive', 'suspended', 'submitted']),
  reason: z.string().trim().max(500).optional(),
});

export async function reviewServiceAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await getSessionUser();
  try {
    requirePermission(user, 'service.review');
  } catch (err) {
    return { error: err instanceof ForbiddenError ? err.message : 'Không có quyền.', notice: null };
  }

  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ.', notice: null };
  if (parsed.data.to === 'changes_requested' && !parsed.data.reason) {
    return { error: 'Vui lòng nêu lý do cần bổ sung.', notice: null };
  }

  try {
    const s = transitionService(
      parsed.data.serviceId,
      parsed.data.to as ServiceStatus,
      user!.id,
      parsed.data.reason,
    );
    recordAudit({
      actorId: user!.id,
      actorName: user!.fullName ?? user!.email,
      actorRoles: user!.roles,
      action: `service.${parsed.data.to}`,
      entityType: 'service',
      entityId: s.id,
      afterData: { status: s.status, title: s.title },
      reason: parsed.data.reason ?? null,
    });
    revalidatePath('/admin/dich-vu');
    return { error: null, notice: `Đã chuyển "${s.title}" sang trạng thái ${parsed.data.to}.` };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Không thực hiện được.',
      notice: null,
    };
  }
}
