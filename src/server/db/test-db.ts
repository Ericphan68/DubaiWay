/**
 * Bật một PostgreSQL thật (PGlite/WASM) trong bộ nhớ và nạp toàn bộ migration.
 * Dùng cho kiểm thử ràng buộc và hành vi đồng thời ở mức database —
 * những thứ không thể kiểm chứng bằng cách đọc code.
 */
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = 'supabase/migrations';

const SUPABASE_SHIM = `
  create schema if not exists auth;
  create table if not exists auth.users (id uuid primary key, email text);
  create or replace function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
`;

export async function createTestDb(withSeed = false): Promise<PGlite> {
  const db = new PGlite({ extensions: { citext } });
  await db.exec(SUPABASE_SHIM);
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'));
  }
  if (withSeed) {
    await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
  }
  return db;
}

/** Giả lập người dùng đang đăng nhập cho các test liên quan RLS. */
export async function actAs(db: PGlite, userId: string | null): Promise<void> {
  await db.exec(
    userId
      ? `select set_config('request.jwt.claim.sub', '${userId}', false)`
      : `select set_config('request.jwt.claim.sub', '', false)`,
  );
}
