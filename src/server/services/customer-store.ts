/**
 * Dữ liệu riêng của khách: yêu thích, người đi cùng đã lưu, thông báo trong tài khoản.
 */
import { randomUUID } from 'node:crypto';

export interface SavedTraveler {
  readonly id: string;
  readonly userId: string;
  fullName: string;
  dateOfBirth: string | null;
  nationality: string | null;
  /**
   * Số hộ chiếu KHÔNG lưu thô. Ở bản trong bộ nhớ chỉ giữ 4 ký tự cuối để khách
   * nhận ra người nào; bản production sẽ mã hoá phần còn lại ở tầng ứng dụng.
   */
  passportLast4: string | null;
  passportExpiry: string | null;
  isPrimary: boolean;
  readonly createdAt: string;
}

export interface AppNotification {
  readonly id: string;
  readonly userId: string;
  readonly template: string;
  readonly title: string;
  readonly body: string;
  readonly linkUrl: string | null;
  readAt: string | null;
  readonly createdAt: string;
}

interface CustomerState {
  favorites: Map<string, Set<string>>;   // userId → set slug dịch vụ
  travelers: SavedTraveler[];
  notifications: AppNotification[];
}

const g = globalThis as unknown as { __dubaiwayCustomer?: CustomerState };
const state: CustomerState = (g.__dubaiwayCustomer ??= {
  favorites: new Map(),
  travelers: [],
  notifications: [],
});

// ─── YÊU THÍCH ──────────────────────────────────────────────────────────────
export function listFavorites(userId: string): string[] {
  return [...(state.favorites.get(userId) ?? new Set<string>())];
}

export function isFavorite(userId: string, serviceSlug: string): boolean {
  return state.favorites.get(userId)?.has(serviceSlug) ?? false;
}

/** Bật/tắt yêu thích. Trả về trạng thái mới. */
export function toggleFavorite(userId: string, serviceSlug: string): boolean {
  const set = state.favorites.get(userId) ?? new Set<string>();
  if (set.has(serviceSlug)) set.delete(serviceSlug);
  else set.add(serviceSlug);
  state.favorites.set(userId, set);
  return set.has(serviceSlug);
}

// ─── NGƯỜI ĐI CÙNG ──────────────────────────────────────────────────────────
export class TravelerError extends Error {
  constructor(message: string) { super(message); this.name = 'TravelerError'; }
}

export function listTravelers(userId: string): SavedTraveler[] {
  return state.travelers
    .filter((t) => t.userId === userId)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.fullName.localeCompare(b.fullName));
}

export function addTraveler(input: {
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  isPrimary?: boolean;
}): SavedTraveler {
  if (input.fullName.trim().length < 2) throw new TravelerError('Vui lòng nhập họ tên');
  if (listTravelers(input.userId).length >= 20) {
    throw new TravelerError('Bạn đã lưu tối đa 20 người đi cùng');
  }

  // Nếu đặt làm người chính thì bỏ cờ ở những người khác.
  if (input.isPrimary) {
    for (const t of state.travelers) if (t.userId === input.userId) t.isPrimary = false;
  }

  const traveler: SavedTraveler = {
    id: randomUUID(),
    userId: input.userId,
    fullName: input.fullName.trim(),
    dateOfBirth: input.dateOfBirth || null,
    nationality: input.nationality?.trim().toUpperCase().slice(0, 2) || null,
    // Chỉ giữ 4 số cuối, không lưu số hộ chiếu đầy đủ.
    passportLast4: input.passportNumber ? input.passportNumber.trim().slice(-4) : null,
    passportExpiry: input.passportExpiry || null,
    isPrimary: Boolean(input.isPrimary),
    createdAt: new Date().toISOString(),
  };
  state.travelers.push(traveler);
  return traveler;
}

export function removeTraveler(userId: string, travelerId: string): boolean {
  const i = state.travelers.findIndex((t) => t.id === travelerId && t.userId === userId);
  if (i === -1) return false;
  state.travelers.splice(i, 1);
  return true;
}

// ─── THÔNG BÁO TRONG TÀI KHOẢN ──────────────────────────────────────────────
export function pushNotification(input: {
  userId: string;
  template: string;
  title: string;
  body: string;
  linkUrl?: string;
}): AppNotification {
  const n: AppNotification = {
    id: randomUUID(),
    userId: input.userId,
    template: input.template,
    title: input.title,
    body: input.body,
    linkUrl: input.linkUrl ?? null,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  state.notifications.unshift(n);
  return n;
}

export function listNotifications(userId: string): AppNotification[] {
  return state.notifications.filter((n) => n.userId === userId);
}

export function countUnread(userId: string): number {
  return state.notifications.filter((n) => n.userId === userId && n.readAt === null).length;
}

export function markAllRead(userId: string): number {
  let n = 0;
  const now = new Date().toISOString();
  for (const item of state.notifications) {
    if (item.userId === userId && item.readAt === null) { item.readAt = now; n += 1; }
  }
  return n;
}

export function markRead(userId: string, id: string): boolean {
  const item = state.notifications.find((x) => x.id === id && x.userId === userId);
  if (!item || item.readAt) return false;
  item.readAt = new Date().toISOString();
  return true;
}

/** Chỉ dùng trong test. */
export function __resetCustomer(): void {
  state.favorites.clear();
  state.travelers.length = 0;
  state.notifications.length = 0;
}
