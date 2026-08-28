import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Mức hoa hồng nền tảng KHÔNG công khai.
 *
 * Đối tác chỉ biết mức áp dụng sau khi đăng ký và vào Khu đối tác, hoặc hỏi
 * nhân viên. Test này quét mã nguồn các trang công khai để chặn việc vô tình
 * viết lại con số đó vào một trang ai cũng xem được.
 *
 * Được phép nêu mức: `src/app/merchant/**` (đã chặn đăng nhập, xem
 * merchant/layout.tsx) và `src/app/admin/**`.
 */

const APP_DIR = join(process.cwd(), 'src', 'app');

/** Thư mục đã chặn đăng nhập nên được phép hiển thị mức hoa hồng. */
const GATED = ['merchant', 'admin'];

/** Trang đăng ký đối tác tuy nằm trong /merchant nhưng người CHƯA là đối tác vẫn xem được. */
const PUBLIC_INSIDE_GATED = [join('merchant', 'dang-ky')];

function collectFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectFiles(full, acc);
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

function isPublic(file: string): boolean {
  const rel = file.slice(APP_DIR.length + 1);
  if (rel.startsWith('__tests__')) return false;
  if (PUBLIC_INSIDE_GATED.some((p) => rel.startsWith(p))) return true;
  return !GATED.some((g) => rel.startsWith(g + '/') || rel === g);
}

/**
 * Các cách con số có thể lọt ra: viết thẳng "10%", viết dưới dạng điểm cơ bản,
 * hoặc một ví dụ tính toán để người đọc tự suy ra tỷ lệ.
 */
const LEAKS: readonly { pattern: RegExp; why: string }[] = [
  { pattern: /\b10\s*%\s*(hoa hồng|commission)/i, why: 'nêu thẳng mức hoa hồng' },
  { pattern: /(hoa hồng|commission)[^.\n]{0,40}\b10\s*%/i, why: 'nêu thẳng mức hoa hồng' },
  { pattern: /commissionRateBps\s*[:=]\s*1000\b/, why: 'ghi cứng tỷ lệ theo điểm cơ bản' },
];

describe('Mức hoa hồng không lộ ra trang công khai', () => {
  const publicFiles = collectFiles(APP_DIR).filter(isPublic);

  it('có quét được một lượng trang công khai đáng kể', () => {
    // Nếu bộ lọc hỏng, test dưới sẽ luôn xanh mà không kiểm gì cả.
    expect(publicFiles.length).toBeGreaterThan(30);
  });

  it('không trang công khai nào nêu mức hoa hồng', () => {
    const offenders: string[] = [];
    for (const file of publicFiles) {
      const src = readFileSync(file, 'utf8');
      for (const { pattern, why } of LEAKS) {
        if (pattern.test(src)) offenders.push(`${file.slice(APP_DIR.length + 1)} — ${why}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('khu đối tác vẫn nêu mức hoa hồng cho người đã đăng ký', () => {
    // Giấu với công chúng, nhưng đối tác phải biết mình bị trừ bao nhiêu.
    const src = readFileSync(join(APP_DIR, 'merchant', 'page.tsx'), 'utf8');
    expect(src).toMatch(/hoa hồng/i);
    expect(src).toMatch(/10\s*%/);
  });

  it('trang đăng ký đối tác không nêu mức hoa hồng', () => {
    const src = readFileSync(join(APP_DIR, 'merchant', 'dang-ky', 'page.tsx'), 'utf8');
    expect(src).not.toMatch(/10\s*%/);
  });
});
