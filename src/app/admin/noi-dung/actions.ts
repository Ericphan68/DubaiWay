'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ForbiddenError, getSessionUser, requirePermission } from '@/server/auth';
import { recordAudit } from '@/server/services/audit-store';
import {
  ContentError, setBannerActive, setPostStatus, upsertBanner, upsertPost,
} from '@/server/services/content-store';

export interface ContentState {
  readonly error: string | null;
  readonly notice: string | null;
}

async function guard() {
  const user = await getSessionUser();
  try {
    requirePermission(user, 'content.manage');
    return { ok: true as const, user: user as NonNullable<typeof user> };
  } catch (err) {
    return { ok: false as const, error: err instanceof ForbiddenError ? err.message : 'Không có quyền.' };
  }
}

const postSchema = z.object({
  id: z.string().optional(),
  titleVi: z.string().trim().min(5, 'Tiêu đề tiếng Việt quá ngắn'),
  titleEn: z.string().trim().optional().default(''),
  excerptVi: z.string().trim().min(10, 'Tóm tắt tiếng Việt quá ngắn'),
  excerptEn: z.string().trim().optional().default(''),
  bodyVi: z.string().trim().min(50, 'Nội dung tiếng Việt cần ít nhất 50 ký tự'),
  bodyEn: z.string().trim().optional().default(''),
  categorySlug: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

export async function savePostAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const g = await guard();
  if (!g.ok) return { error: g.error, notice: null };

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  try {
    const p = upsertPost({
      id: parsed.data.id || undefined,
      titleVi: parsed.data.titleVi,
      titleEn: parsed.data.titleEn,
      excerptVi: parsed.data.excerptVi,
      excerptEn: parsed.data.excerptEn,
      bodyVi: parsed.data.bodyVi,
      bodyEn: parsed.data.bodyEn,
      categorySlug: parsed.data.categorySlug,
      status: parsed.data.status,
      authorName: g.user.fullName ?? 'DubaiWay',
    });
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: 'post.upsert', entityType: 'blog_post', entityId: p.id,
      afterData: { slug: p.slug, status: p.status, title: p.titleVi },
    });
    revalidatePath('/admin/noi-dung');
    revalidatePath('/cam-nang');
    return { error: null, notice: `Đã lưu bài "${p.titleVi}".` };
  } catch (err) {
    return { error: err instanceof ContentError ? err.message : 'Không lưu được.', notice: null };
  }
}

export async function setPostStatusAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const g = await guard();
  if (!g.ok) return { error: g.error, notice: null };

  const id = String(formData.get('id') ?? '');
  const to = String(formData.get('to') ?? '') as 'draft' | 'published' | 'archived';
  try {
    const p = setPostStatus(id, to);
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: `post.${to}`, entityType: 'blog_post', entityId: p.id,
      afterData: { status: p.status },
    });
    revalidatePath('/admin/noi-dung');
    revalidatePath('/cam-nang');
    return { error: null, notice: `Đã chuyển bài sang trạng thái ${to}.` };
  } catch (err) {
    return { error: err instanceof ContentError ? err.message : 'Không đổi được.', notice: null };
  }
}

const bannerSchema = z.object({
  id: z.string().optional(),
  placement: z.string().min(1),
  headlineVi: z.string().trim().min(3),
  headlineEn: z.string().trim().optional().default(''),
  subheadVi: z.string().trim().optional().default(''),
  subheadEn: z.string().trim().optional().default(''),
  ctaLabelVi: z.string().trim().optional().default('Xem ngay'),
  ctaLabelEn: z.string().trim().optional().default(''),
  linkUrl: z.string().trim().min(1),
  sortOrder: z.coerce.number().int().min(0).max(99).default(1),
  isActive: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function saveBannerAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const g = await guard();
  if (!g.ok) return { error: g.error, notice: null };

  const parsed = bannerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.', notice: null };
  }
  try {
    const b = upsertBanner({
      id: parsed.data.id || undefined,
      placement: parsed.data.placement,
      headlineVi: parsed.data.headlineVi,
      headlineEn: parsed.data.headlineEn,
      subheadVi: parsed.data.subheadVi,
      subheadEn: parsed.data.subheadEn,
      ctaLabelVi: parsed.data.ctaLabelVi,
      ctaLabelEn: parsed.data.ctaLabelEn,
      linkUrl: parsed.data.linkUrl,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive === 'on',
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
    });
    recordAudit({
      actorId: g.user.id, actorName: g.user.fullName ?? g.user.email, actorRoles: g.user.roles,
      action: 'banner.upsert', entityType: 'banner', entityId: b.id,
      afterData: { placement: b.placement, headline: b.headlineVi, isActive: b.isActive },
    });
    revalidatePath('/admin/noi-dung');
    return { error: null, notice: 'Đã lưu banner.' };
  } catch (err) {
    return { error: err instanceof ContentError ? err.message : 'Không lưu được banner.', notice: null };
  }
}

export async function toggleBannerAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const g = await guard();
  if (!g.ok) return { error: g.error, notice: null };
  const id = String(formData.get('id') ?? '');
  const to = String(formData.get('to') ?? '') === 'on';
  try {
    setBannerActive(id, to);
    revalidatePath('/admin/noi-dung');
    return { error: null, notice: to ? 'Đã bật banner.' : 'Đã tắt banner.' };
  } catch (err) {
    return { error: err instanceof ContentError ? err.message : 'Không đổi được.', notice: null };
  }
}
