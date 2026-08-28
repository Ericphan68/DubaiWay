'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ForbiddenError, getSessionUser, requirePermission, type UserRole } from '@/server/auth';
import { RoleError, grantRole, revokeRole } from '@/server/auth/memory-provider';
import { recordAudit } from '@/server/services/audit-store';

export interface StaffState {
  readonly error: string | null;
  readonly notice: string | null;
}

const ROLES = [
  'super_admin', 'merchant_reviewer', 'service_reviewer', 'customer_support',
  'finance', 'dispute_officer', 'content_manager', 'marketing',
  'merchant_owner', 'merchant_staff', 'merchant_scanner', 'customer',
] as const;

const schema = z.object({
  targetUserId: z.string().min(1),
  role: z.enum(ROLES),
  op: z.enum(['grant', 'revoke']),
});

export async function changeRoleAction(_prev: StaffState, formData: FormData): Promise<StaffState> {
  const user = await getSessionUser();
  try {
    // CHỈ Super Admin được phân quyền — đây là chốt chặn quan trọng nhất của hệ thống.
    requirePermission(user, 'role.manage');
  } catch (err) {
    return {
      error: err instanceof ForbiddenError ? err.message : 'Không có quyền phân quyền.',
      notice: null,
    };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ.', notice: null };
  const { targetUserId, role, op } = parsed.data;

  try {
    const result = op === 'grant'
      ? grantRole(user!.id, targetUserId, role as UserRole)
      : revokeRole(user!.id, targetUserId, role as UserRole);

    recordAudit({
      actorId: user!.id,
      actorName: user!.fullName ?? user!.email,
      actorRoles: user!.roles,
      action: op === 'grant' ? 'role.grant' : 'role.revoke',
      entityType: 'user',
      entityId: targetUserId,
      afterData: { email: result.email, roles: result.roles },
      reason: `${op === 'grant' ? 'Cấp' : 'Thu hồi'} vai trò ${role}`,
    });
    revalidatePath('/admin/nhan-vien');
    return {
      error: null,
      notice: op === 'grant'
        ? `Đã cấp vai trò ${role} cho ${result.email}.`
        : `Đã thu hồi vai trò ${role} của ${result.email}.`,
    };
  } catch (err) {
    return { error: err instanceof RoleError ? err.message : 'Không đổi được vai trò.', notice: null };
  }
}
