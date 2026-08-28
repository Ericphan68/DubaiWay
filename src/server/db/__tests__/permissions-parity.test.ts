import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '@/server/auth/permissions';
import { createTestDb } from '../test-db';

/**
 * Ma trận quyền tồn tại ở hai nơi: bảng role_permissions (lớp chặn thật) và
 * ROLE_PERMISSIONS trong TypeScript (để giao diện biết hiện gì).
 * Nếu hai bản lệch nhau, giao diện sẽ hiện nút mà database từ chối, hoặc
 * giấu chức năng người dùng thực ra có quyền dùng. Test này chặn điều đó.
 */
let db: PGlite;

beforeAll(async () => { db = await createTestDb(); }, 90_000);
afterAll(async () => { await db?.close(); });

describe('Ma trận quyền trong code khớp với database', () => {
  it('mọi vai trò cấp nền tảng có ĐÚNG bộ quyền như trong DB', async () => {
    const r = await db.query<{ role_key: string; permission_key: string }>(
      `select role_key, permission_key from public.role_permissions order by role_key, permission_key`);

    const fromDb = new Map<string, string[]>();
    for (const row of r.rows) {
      const list = fromDb.get(row.role_key) ?? [];
      list.push(row.permission_key);
      fromDb.set(row.role_key, list);
    }

    for (const [role, perms] of fromDb) {
      const inCode = [...(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] ?? [])].sort();
      expect(inCode, `vai trò ${role}`).toEqual(perms.sort());
    }
  });

  it('mọi quyền dùng trong code đều tồn tại trong bảng permissions', async () => {
    const r = await db.query<{ key: string }>(`select key from public.permissions`);
    const known = new Set(r.rows.map((x) => x.key));
    const used = new Set(Object.values(ROLE_PERMISSIONS).flat());
    for (const p of used) {
      expect(known.has(p), `quyền ${p} không có trong database`).toBe(true);
    }
  });

  it('mọi vai trò dùng trong code đều tồn tại trong bảng roles', async () => {
    const r = await db.query<{ key: string }>(`select key from public.roles`);
    const known = new Set(r.rows.map((x) => x.key));
    for (const role of Object.keys(ROLE_PERMISSIONS)) {
      expect(known.has(role), `vai trò ${role} không có trong database`).toBe(true);
    }
  });

  it('vai trò phạm vi merchant KHÔNG có quyền cấp nền tảng nào', async () => {
    for (const role of ['merchant_owner', 'merchant_staff', 'merchant_scanner', 'customer'] as const) {
      expect(ROLE_PERMISSIONS[role]).toEqual([]);
      const r = await db.query<{ n: number }>(
        `select count(*)::int n from public.role_permissions where role_key = '${role}'`);
      expect(r.rows[0].n).toBe(0);
    }
  });
});
