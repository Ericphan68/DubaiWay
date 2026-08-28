'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import {
  CatalogError, addBlackoutDate, generateAvailability, getService, removeBlackoutDate,
  setDayCapacity, toggleDayClosed,
} from '@/server/services/catalog-store';

export interface CalendarState {
  readonly error: string | null;
  readonly notice: string | null;
}

const schema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  capacity: z.coerce.number().int().min(0).max(1000).optional(),
  action: z.enum(['setCapacity', 'close', 'open', 'blackout', 'unblackout', 'generate']),
  days: z.coerce.number().int().min(1).max(365).optional(),
});

type Guard =
  | { readonly ok: false; readonly error: string }
  | { readonly ok: true; readonly service: NonNullable<ReturnType<typeof getService>> };

/** Kiểm tra dịch vụ có thuộc đối tác đang đăng nhập không. */
async function guard(serviceId: string): Promise<Guard> {
  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) return { ok: false, error: 'Bạn không có quyền.' };
  const merchant = getMerchantForUser(user.id);
  if (!merchant) return { ok: false, error: 'Tài khoản chưa gắn với đối tác nào.' };
  const s = getService(serviceId);
  if (!s) return { ok: false, error: 'Không tìm thấy dịch vụ.' };
  if (s.merchantId !== merchant.id) return { ok: false, error: 'Dịch vụ không thuộc đơn vị của bạn.' };
  return { ok: true, service: s };
}

export async function updateCalendarAction(
  _prev: CalendarState,
  formData: FormData,
): Promise<CalendarState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ.', notice: null };
  const d = parsed.data;

  const g = await guard(d.serviceId);
  if (!g.ok) return { error: g.error, notice: null };

  try {
    switch (d.action) {
      case 'setCapacity': {
        if (!d.date || d.capacity === undefined) return { error: 'Thiếu ngày hoặc sức chứa.', notice: null };
        const day = setDayCapacity(d.serviceId, d.date, d.capacity);
        revalidatePath('/merchant/lich');
        return { error: null, notice: `Đã đặt sức chứa ngày ${d.date} thành ${day.capacityTotal}.` };
      }
      case 'close':
      case 'open': {
        if (!d.date) return { error: 'Thiếu ngày.', notice: null };
        toggleDayClosed(d.serviceId, d.date, d.action === 'close');
        revalidatePath('/merchant/lich');
        return {
          error: null,
          notice: d.action === 'close' ? `Đã đóng ngày ${d.date}.` : `Đã mở lại ngày ${d.date}.`,
        };
      }
      case 'blackout': {
        if (!d.date) return { error: 'Thiếu ngày.', notice: null };
        addBlackoutDate(d.serviceId, d.date);
        revalidatePath('/merchant/lich');
        return { error: null, notice: `Đã chặn ngày ${d.date}, khách không đặt được.` };
      }
      case 'unblackout': {
        if (!d.date) return { error: 'Thiếu ngày.', notice: null };
        removeBlackoutDate(d.serviceId, d.date);
        revalidatePath('/merchant/lich');
        return { error: null, notice: `Đã bỏ chặn ngày ${d.date}.` };
      }
      case 'generate': {
        const n = generateAvailability(d.serviceId, d.days ?? 90, g.service.maxGuests ?? 20);
        revalidatePath('/merchant/lich');
        return {
          error: null,
          notice: n > 0 ? `Đã mở thêm ${n} ngày.` : 'Lịch đã đủ, không cần mở thêm ngày nào.',
        };
      }
    }
  } catch (err) {
    return { error: err instanceof CatalogError ? err.message : 'Không cập nhật được lịch.', notice: null };
  }
}
