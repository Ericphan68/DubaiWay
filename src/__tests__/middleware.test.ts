import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

/**
 * Ba khu vực, ba tên miền. Sai ở đây nghĩa là đối tác lạc vào khu quản trị
 * hoặc khách lạc vào khu nội bộ, nên phủ kỹ từng nhánh.
 *
 * Test chạy với NEXT_PUBLIC_SITE_URL của .env.local (dubaiway.com), nên các
 * tên miền suy ra là merchant.dubaiway.com và admin.dubaiway.com.
 */
const go = (host: string, path: string) => {
  const res = middleware(new NextRequest(`https://${host}${path}`, { headers: { host } }));
  const loc = res.headers.get('location');
  return {
    chuyenHuong: Boolean(loc),
    dich: loc ? new URL(loc) : null,
    host: loc ? new URL(loc).host : null,
    duongDan: loc ? new URL(loc).pathname : null,
  };
};

describe('Tên miền chính', () => {
  it('phục vụ trang khách bình thường', () => {
    expect(go('dubaiway.com', '/du-lich').chuyenHuong).toBe(false);
    expect(go('dubaiway.com', '/').chuyenHuong).toBe(false);
  });

  it('đẩy khu đối tác sang tên miền đối tác, giữ nguyên đường dẫn', () => {
    const r = go('dubaiway.com', '/merchant/dich-vu');
    expect(r.host).toBe('merchant.dubaiway.com');
    expect(r.duongDan).toBe('/merchant/dich-vu');
  });

  it('đẩy khu quản trị sang tên miền quản trị', () => {
    const r = go('dubaiway.com', '/admin/bao-cao');
    expect(r.host).toBe('admin.dubaiway.com');
    expect(r.duongDan).toBe('/admin/bao-cao');
  });

  it('trang đăng nhập nội bộ không phục vụ trên tên miền chính', () => {
    expect(go('dubaiway.com', '/khu-doi-tac').host).toBe('merchant.dubaiway.com');
    expect(go('dubaiway.com', '/khu-quan-tri').host).toBe('admin.dubaiway.com');
  });

  it('giữ nguyên tham số truy vấn khi chuyển hướng', () => {
    const res = middleware(new NextRequest('https://dubaiway.com/admin/bao-cao?tu=2026-01-01',
      { headers: { host: 'dubaiway.com' } }));
    expect(res.headers.get('location')).toContain('tu=2026-01-01');
  });
});

describe('Tên miền đối tác', () => {
  it('phục vụ khu đối tác và trang đăng nhập của khu', () => {
    expect(go('merchant.dubaiway.com', '/merchant/dich-vu').chuyenHuong).toBe(false);
    expect(go('merchant.dubaiway.com', '/khu-doi-tac').chuyenHuong).toBe(false);
  });

  it('gõ nhầm sang khu quản trị thì đẩy đúng tên miền', () => {
    const r = go('merchant.dubaiway.com', '/admin/bao-cao');
    expect(r.host).toBe('admin.dubaiway.com');
    expect(r.duongDan).toBe('/admin/bao-cao');
  });

  it('trang của khách không phục vụ ở đây, đưa về cửa khu đối tác', () => {
    expect(go('merchant.dubaiway.com', '/').duongDan).toBe('/merchant');
    expect(go('merchant.dubaiway.com', '/du-lich').duongDan).toBe('/merchant');
    expect(go('merchant.dubaiway.com', '/dang-nhap').duongDan).toBe('/merchant');
  });

  it('trang pháp lý và quên mật khẩu vẫn dùng được', () => {
    // Thiếu cái này thì đối tác quên mật khẩu không có đường vào lại.
    expect(go('merchant.dubaiway.com', '/quen-mat-khau').chuyenHuong).toBe(false);
    expect(go('merchant.dubaiway.com', '/dieu-khoan-doi-tac').chuyenHuong).toBe(false);
    expect(go('merchant.dubaiway.com', '/chinh-sach-bao-mat').chuyenHuong).toBe(false);
  });
});

describe('Tên miền quản trị', () => {
  it('phục vụ khu quản trị và trang đăng nhập nội bộ', () => {
    expect(go('admin.dubaiway.com', '/admin/bao-cao').chuyenHuong).toBe(false);
    expect(go('admin.dubaiway.com', '/khu-quan-tri').chuyenHuong).toBe(false);
  });

  it('đẩy khu đối tác sang tên miền đối tác', () => {
    expect(go('admin.dubaiway.com', '/merchant').host).toBe('merchant.dubaiway.com');
  });

  it('trang khách đưa về cửa khu quản trị', () => {
    expect(go('admin.dubaiway.com', '/du-lich').duongDan).toBe('/admin');
  });
});

describe('Máy phát triển trên localhost trần', () => {
  it('không đổi hướng gì, cả ba khu chạy chung một tên miền', () => {
    expect(go('localhost:3000', '/merchant/dich-vu').chuyenHuong).toBe(false);
    expect(go('localhost:3000', '/admin').chuyenHuong).toBe(false);
    expect(go('localhost:3000', '/').chuyenHuong).toBe(false);
  });

  it('subdomain của localhost vẫn tách khu để thử được', () => {
    expect(go('merchant.localhost:3000', '/du-lich').duongDan).toBe('/merchant');
    expect(go('admin.localhost:3000', '/merchant').host).toBe('merchant.localhost:3000');
  });
});

describe('Tài nguyên kỹ thuật không bị đụng tới', () => {
  it('bỏ qua _next, api và sitemap trên mọi tên miền', () => {
    for (const p of ['/_next/static/x.js', '/api/health', '/sitemap.xml', '/robots.txt']) {
      expect(go('merchant.dubaiway.com', p).chuyenHuong, p).toBe(false);
    }
  });
});

describe('Chế độ chung một tên miền (mặc định, chưa dựng subdomain)', () => {
  /** Nạp lại middleware với biến môi trường tắt để kiểm nhánh mặc định. */
  async function loadOff() {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_AREA_HOSTS', 'off');
    const mod = await import('../middleware');
    return (host: string, path: string) => {
      const res = mod.middleware(new NextRequest(`https://${host}${path}`, { headers: { host } }));
      return { chuyenHuong: Boolean(res.headers.get('location')), khu: res.headers.get('x-middleware-request-x-dw-area') };
    };
  }

  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it('không đẩy sang subdomain nào — ba khu chung một tên miền', async () => {
    const g = await loadOff();
    expect(g('shalom1379.com', '/merchant/dich-vu').chuyenHuong).toBe(false);
    expect(g('shalom1379.com', '/admin/bao-cao').chuyenHuong).toBe(false);
    expect(g('shalom1379.com', '/khu-doi-tac').chuyenHuong).toBe(false);
    expect(g('shalom1379.com', '/khu-quan-tri').chuyenHuong).toBe(false);
  });

  it('vẫn nhận đúng khu theo đường dẫn để dựng khung trang', async () => {
    const g = await loadOff();
    expect(g('shalom1379.com', '/khu-doi-tac').khu).toBe('merchant');
    expect(g('shalom1379.com', '/merchant/dich-vu').khu).toBe('merchant');
    expect(g('shalom1379.com', '/khu-quan-tri').khu).toBe('admin');
    expect(g('shalom1379.com', '/admin/bao-cao').khu).toBe('admin');
    expect(g('shalom1379.com', '/du-lich').khu).toBe('customer');
  });
});
