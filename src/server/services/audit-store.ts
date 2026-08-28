/**
 * Nhật ký hệ thống.
 *
 * Ghi mọi thao tác quan trọng: ai làm, lúc nào, trên đối tượng gì, dữ liệu trước/sau
 * và lý do. Bản ghi CHỈ THÊM — không có hàm sửa hay xoá, đúng như bảng audit_logs
 * trong database (được trigger chặn).
 *
 * TUYỆT ĐỐI không ghi dữ liệu nhạy cảm: số hộ chiếu, số tài khoản, mật khẩu, token.
 */
import { randomUUID } from 'node:crypto';

export interface AuditEntry {
  readonly id: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly actorRoles: readonly string[];
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly beforeData: Record<string, unknown> | null;
  readonly afterData: Record<string, unknown> | null;
  readonly reason: string | null;
  readonly createdAt: string;
}

interface AuditState { entries: AuditEntry[] }
const g = globalThis as unknown as { __dubaiwayAudit?: AuditState };
const state: AuditState = (g.__dubaiwayAudit ??= { entries: [] });

/** Danh sách khoá KHÔNG BAO GIỜ được ghi vào nhật ký. */
const SENSITIVE_KEYS = [
  'password', 'passwordHash', 'salt', 'token', 'accessToken', 'secret',
  'passportNumber', 'iban', 'accountNumber', 'cardNumber', 'cvv', 'apiKey',
];

/** Lọc bỏ trường nhạy cảm trước khi ghi. */
function sanitize(data: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!data) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lower.includes(s.toLowerCase()))) {
      out[k] = '[đã ẩn]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = sanitize(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function recordAudit(input: {
  actorId: string;
  actorName: string;
  actorRoles: readonly string[];
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  reason?: string | null;
}): AuditEntry {
  const entry: AuditEntry = {
    id: randomUUID(),
    actorId: input.actorId,
    actorName: input.actorName,
    actorRoles: [...input.actorRoles],
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    beforeData: sanitize(input.beforeData),
    afterData: sanitize(input.afterData),
    reason: input.reason ?? null,
    createdAt: new Date().toISOString(),
  };
  state.entries.unshift(entry);
  return entry;
}

export function listAudit(filter?: {
  entityType?: string; entityId?: string; actorId?: string; action?: string; limit?: number;
}): AuditEntry[] {
  let all = state.entries;
  if (filter?.entityType) all = all.filter((e) => e.entityType === filter.entityType);
  if (filter?.entityId) all = all.filter((e) => e.entityId === filter.entityId);
  if (filter?.actorId) all = all.filter((e) => e.actorId === filter.actorId);
  if (filter?.action) all = all.filter((e) => e.action.includes(filter.action as string));
  return all.slice(0, filter?.limit ?? 200);
}

export function countAudit(): number {
  return state.entries.length;
}

/** Chỉ dùng trong test. */
export function __resetAudit(): void { state.entries.length = 0; }
