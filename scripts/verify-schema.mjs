/**
 * Chạy toàn bộ migration lên một Postgres thật (PGlite/WASM) để chắc chắn schema
 * thực thi được, không chỉ "trông có vẻ đúng".
 *
 * PGlite không có sẵn schema `auth` của Supabase nên ta tạo bản giả lập tối thiểu.
 */
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = 'supabase/migrations';

const SUPABASE_SHIM = `
  create schema if not exists auth;
  create table if not exists auth.users (id uuid primary key, email text);
  -- auth.uid() thật do Supabase cung cấp; ở đây trả về giá trị trong biến phiên.
  create or replace function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create role if not exists authenticated;
  create role if not exists anon;
`;

const db = new PGlite({ extensions: { citext } });

// PGlite không hỗ trợ `create role if not exists` — bỏ phần role khỏi shim.
await db.exec(SUPABASE_SHIM.replace(/create role if not exists \w+;/g, ''));

const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
let failed = 0;

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
  try {
    await db.exec(sql);
    console.log(`  ✓ ${file}`);
  } catch (err) {
    failed += 1;
    console.log(`  ✗ ${file}`);
    console.log(`      ${String(err.message).split('\n')[0]}`);
    if (err.hint) console.log(`      gợi ý: ${err.hint}`);
  }
}

if (failed > 0) {
  console.log(`\n${failed}/${files.length} migration lỗi`);
  process.exit(1);
}

// Nạp dữ liệu mẫu
try {
  await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
  console.log('  ✓ seed.sql');
} catch (err) {
  console.log('  ✗ seed.sql');
  console.log(`      ${String(err.message).split('\n')[0]}`);
  process.exitCode = 1;
}

// Thống kê những gì đã tạo ra trong database thật
const q = async (sql) => (await db.query(sql)).rows[0].n;
const tables = await q(`select count(*)::int n from pg_tables where schemaname='public'`);
const policies = await q(`select count(*)::int n from pg_policies where schemaname='public'`);
const funcs = await q(`select count(*)::int n from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public'`);
const enums = await q(`select count(distinct t.typname)::int n from pg_type t join pg_enum e on e.enumtypid=t.oid`);
const idx = await q(`select count(*)::int n from pg_indexes where schemaname='public'`);
const rlsOff = (await db.query(
  `select tablename from pg_tables t
    where schemaname='public'
      and not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
                       where n.nspname='public' and c.relname=t.tablename and c.relrowsecurity)`
)).rows;

console.log('\n════ SCHEMA ĐÃ TẠO THÀNH CÔNG TRÊN POSTGRES THẬT ════');
console.log(`  bảng            ${tables}`);
console.log(`  RLS policy      ${policies}`);
console.log(`  hàm             ${funcs}`);
console.log(`  kiểu enum       ${enums}`);
console.log(`  index           ${idx}`);
console.log(`  bảng CHƯA bật RLS: ${rlsOff.length === 0 ? 'không có (tất cả đã bật)' : rlsOff.map(r=>r.tablename).join(', ')}`);

// Kiểm tra không còn cột tiền nào dùng số thực
const floats = (await db.query(`
  select table_name, column_name, data_type
    from information_schema.columns
   where table_schema='public'
     and data_type in ('real','double precision','money')
`)).rows;
console.log(`  cột tiền dùng float: ${floats.length === 0 ? 'không có ✓' : JSON.stringify(floats)}`);

await db.close();
if (floats.length > 0) process.exit(1);
