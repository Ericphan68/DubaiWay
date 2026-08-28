'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ForbiddenError, getSessionUser, requirePermission } from '@/server/auth';
import { recordAudit } from '@/server/services/audit-store';
import { CatalogError, setCategoryActive, upsertCategory } from '@/server/services/catalog-store';
import { CouponError, setCouponActive, upsertCoupon } from '@/server/services/coupon-store';
import { ReviewError, hideReview } from '@/server/services/review-store';
import { DisputeError, setDisputeStatus, type DisputeStatus } from '@/server/services/dispute-store';

export interface OpsState {
  readonly error: string | null;
  readonly notice: string | null;
}

type Guard =
  | { readonly ok: true; readonly user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>> }
  | { readonly ok: false; readonly error: string };

/** Kiểm quyền ở máy chủ trước mọi thao tác quản trị. */
async function guard(permission: Parameters<typeof requirePermission>[1]): Promise<Guard> {
  const user = await getSessionUser();
  try {
    requirePermission(user, permission);
    return { ok: true, user: user as NonNullable<typeof user> };
  } catch (err) {
    return { ok: false, error: err instanceof ForbiddenError ? err.message : 'Không có quyền.' };
  }
}

// ─── DANH MỤC ───────────────────────────────────────────────────────────────
const categorySchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{2,50}$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  nameVi: z.string().trim().min(2, 'Tên tiếng Việt quá ngắn'),
  nameEn: z.string().trim().min(2, 'Tên tiếng Anh quá ngắn'),
  sortOrder: z.coerce.number().int().min(0).max(999).default(99),
  isActive: z.string().optional(),
});

export async function saveCategoryAction(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const g = await guard('category.manage');
  if (!g.ok) return { error: g.error, notice: null };

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  try {
    const c = upsertCategory({
      slug: parsed.data.slug,
      nameVi: parsed.data.nameVi,
      nameEn: parsed.data.nameEn,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive === 'on',
    });
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: 'category.upsert', entityType: 'category', entityId: c.slug,
      afterData: { slug: c.slug, nameVi: c.name.vi, isActive: c.isActive },
    });
    revalidatePath('/admin/danh-muc');
    return { error: null, notice: `Đã lưu danh mục "${c.name.vi}".` };
  } catch (err) {
    return { error: err instanceof CatalogError ? err.message : 'Không lưu được.', notice: null };
  }
}

export async function toggleCategoryAction(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const g = await guard('category.manage');
  if (!g.ok) return { error: g.error, notice: null };

  const slug = String(formData.get('slug') ?? '');
  const to = String(formData.get('to') ?? '') === 'on';
  try {
    setCategoryActive(slug, to);
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: to ? 'category.activate' : 'category.deactivate',
      entityType: 'category', entityId: slug,
    });
    revalidatePath('/admin/danh-muc');
    return { error: null, notice: to ? 'Đã bật danh mục.' : 'Đã tắt danh mục.' };
  } catch (err) {
    return { error: err instanceof CatalogError ? err.message : 'Không đổi được.', notice: null };
  }
}

// ─── KHUYẾN MÃI ─────────────────────────────────────────────────────────────
const couponSchema = z.object({
  code: z.string().trim().min(3),
  kind: z.enum(['percent', 'fixed']),
  percent: z.coerce.number().min(0).max(100).optional(),
  amountMajor: z.coerce.number().min(0).optional(),
  minOrderMajor: z.coerce.number().min(0).default(0),
  maxDiscountMajor: z.coerce.number().min(0).optional(),
  fundedBy: z.enum(['platform', 'merchant']),
  usageLimitTotal: z.coerce.number().int().min(1).optional(),
  usageLimitPerUser: z.coerce.number().int().min(1).default(1),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  categorySlug: z.string().optional(),
  isActive: z.string().optional(),
});

export async function saveCouponAction(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const g = await guard('marketing.manage');
  if (!g.ok) return { error: g.error, notice: null };

  const raw = Object.fromEntries(formData);
  for (const k of ['percent', 'amountMajor', 'maxDiscountMajor', 'usageLimitTotal']) {
    if (raw[k] === '') delete raw[k];
  }
  const parsed = couponSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  try {
    const c = upsertCoupon({
      code: parsed.data.code,
      kind: parsed.data.kind,
      percent: parsed.data.percent,
      amountMajor: parsed.data.amountMajor,
      minOrderMajor: parsed.data.minOrderMajor,
      maxDiscountMajor: parsed.data.maxDiscountMajor,
      fundedBy: parsed.data.fundedBy,
      usageLimitTotal: parsed.data.usageLimitTotal,
      usageLimitPerUser: parsed.data.usageLimitPerUser,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      categorySlug: parsed.data.categorySlug || undefined,
      isActive: parsed.data.isActive === 'on',
    });
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: 'coupon.upsert', entityType: 'coupon', entityId: c.code,
      afterData: { code: c.code, kind: c.kind, fundedBy: c.fundedBy, isActive: c.isActive },
    });
    revalidatePath('/admin/khuyen-mai');
    return { error: null, notice: `Đã lưu mã ${c.code}.` };
  } catch (err) {
    return { error: err instanceof CouponError ? err.message : 'Không lưu được mã.', notice: null };
  }
}

export async function toggleCouponAction(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const g = await guard('marketing.manage');
  if (!g.ok) return { error: g.error, notice: null };
  const code = String(formData.get('code') ?? '');
  const to = String(formData.get('to') ?? '') === 'on';
  try {
    setCouponActive(code, to);
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: to ? 'coupon.activate' : 'coupon.deactivate', entityType: 'coupon', entityId: code,
    });
    revalidatePath('/admin/khuyen-mai');
    return { error: null, notice: to ? `Đã bật mã ${code}.` : `Đã tắt mã ${code}.` };
  } catch (err) {
    return { error: err instanceof CouponError ? err.message : 'Không đổi được.', notice: null };
  }
}

// ─── KIỂM DUYỆT ĐÁNH GIÁ ────────────────────────────────────────────────────
export async function hideReviewAction(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const g = await guard('review.moderate');
  if (!g.ok) return { error: g.error, notice: null };

  const reviewId = String(formData.get('reviewId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  // Bắt buộc nêu lý do — để sau này truy được vì sao đánh giá bị ẩn.
  if (!reason) return { error: 'Phải nêu lý do khi ẩn đánh giá.', notice: null };

  try {
    const r = hideReview(reviewId, reason);
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: 'review.hide', entityType: 'review', entityId: r.id,
      beforeData: { isHidden: false }, afterData: { isHidden: true },
      reason,
    });
    revalidatePath('/admin/danh-gia');
    return { error: null, notice: 'Đã ẩn đánh giá.' };
  } catch (err) {
    return { error: err instanceof ReviewError ? err.message : 'Không ẩn được.', notice: null };
  }
}

// ─── KHIẾU NẠI ──────────────────────────────────────────────────────────────
export async function updateDisputeAction(_prev: OpsState, formData: FormData): Promise<OpsState> {
  const g = await guard('dispute.manage');
  if (!g.ok) return { error: g.error, notice: null };

  const disputeId = String(formData.get('disputeId') ?? '');
  const to = String(formData.get('to') ?? '') as DisputeStatus;
  const resolution = String(formData.get('resolution') ?? '').trim();

  try {
    const d = setDisputeStatus(disputeId, to, resolution || undefined);
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: `dispute.${to}`, entityType: 'dispute', entityId: d.id,
      afterData: { status: d.status }, reason: resolution || null,
    });
    revalidatePath('/admin/khieu-nai');
    return { error: null, notice: `Đã chuyển khiếu nại ${d.reference} sang ${to}.` };
  } catch (err) {
    return { error: err instanceof DisputeError ? err.message : 'Không cập nhật được.', notice: null };
  }
}
