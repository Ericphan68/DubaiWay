import { describe, expect, it } from 'vitest';
import { areaForHost, hostForArea, isSingleHostDev, urlForArea } from '../hosts';

/**
 * Ba khu vực, ba tên miền. Sai ở đây nghĩa là đối tác lạc vào trang quản trị
 * hoặc khách lạc vào khu nội bộ, nên phủ kỹ.
 *
 * Mặc định khi chạy test: NEXT_PUBLIC_SITE_URL chưa đặt → gốc là localhost:3000,
 * suy ra merchant.localhost:3000 và admin.localhost:3000.
 */

describe('Nhận diện khu vực theo tên miền', () => {
  it('tên miền chính là khu khách hàng', () => {
    expect(areaForHost('shalom1379.com')).toBe('customer');
    expect(areaForHost('www.shalom1379.com')).toBe('customer');
  });

  it('nhận ra tên miền đối tác và quản trị', () => {
    expect(areaForHost('merchant.shalom1379.com')).toBe('merchant');
    expect(areaForHost('admin.shalom1379.com')).toBe('admin');
  });

  it('bỏ qua cổng khi so tên miền', () => {
    expect(areaForHost('merchant.localhost:3000')).toBe('merchant');
    expect(areaForHost('admin.localhost:3000')).toBe('admin');
  });

  it('không phân biệt chữ hoa chữ thường', () => {
    expect(areaForHost('MERCHANT.Shalom1379.COM')).toBe('merchant');
    expect(areaForHost('Admin.Shalom1379.com')).toBe('admin');
  });

  it('tên miền lạ được coi là khu khách hàng, không mở nhầm khu nội bộ', () => {
    // Mặc định an toàn: chỉ mở khu công khai.
    expect(areaForHost('example.com')).toBe('customer');
    expect(areaForHost('')).toBe('customer');
    expect(areaForHost('administrator.shalom1379.com')).toBe('customer');
    expect(areaForHost('merchants.shalom1379.com')).toBe('customer');
  });
});

describe('Chế độ một tên miền khi phát triển', () => {
  it('localhost trần được coi là dùng chung tên miền', () => {
    expect(isSingleHostDev('localhost')).toBe(true);
    expect(isSingleHostDev('localhost:3000')).toBe(true);
    expect(isSingleHostDev('127.0.0.1:3000')).toBe(true);
  });

  it('subdomain của localhost thì KHÔNG dùng chung, để thử được nhiều tên miền', () => {
    expect(isSingleHostDev('merchant.localhost:3000')).toBe(false);
    expect(isSingleHostDev('admin.localhost:3000')).toBe(false);
  });

  it('tên miền thật không bao giờ rơi vào chế độ phát triển', () => {
    expect(isSingleHostDev('shalom1379.com')).toBe(false);
    expect(isSingleHostDev('merchant.shalom1379.com')).toBe(false);
  });
});

describe('Dựng tên miền cho từng khu', () => {
  it('giữ nguyên cổng của tên miền đang dùng', () => {
    expect(hostForArea('merchant', 'localhost:3000')).toBe('merchant.localhost:3000');
    expect(hostForArea('admin', 'localhost:3000')).toBe('admin.localhost:3000');
    expect(hostForArea('customer', 'merchant.localhost:3000')).toBe('localhost:3000');
  });

  it('ở máy phát triển thì suy ra tên miền anh em từ chính tên miền đang mở', () => {
    // Không được văng sang tên miền thật đang chạy production.
    expect(hostForArea('admin', 'merchant.localhost:3000')).toBe('admin.localhost:3000');
    expect(hostForArea('merchant', 'admin.localhost:3000')).toBe('merchant.localhost:3000');
    expect(hostForArea('customer', 'admin.localhost:3000')).toBe('localhost:3000');
    expect(hostForArea('merchant', '127.0.0.1:3000')).toBe('merchant.127.0.0.1:3000');
  });

  it('dùng https cho tên miền thật và http cho máy phát triển', () => {
    expect(urlForArea('merchant', '/dich-vu')).toBe('https://merchant.dubaiway.com/dich-vu');
    expect(urlForArea('merchant', '/dich-vu', 'localhost:3000'))
      .toBe('http://merchant.localhost:3000/dich-vu');
  });

  it('tự thêm dấu gạch chéo đầu đường dẫn', () => {
    expect(urlForArea('admin', 'bao-cao')).toContain('/bao-cao');
  });
});

describe('Ghép subdomain từ tên miền có www', () => {
  it('không tạo ra merchant.www.<tên miền>', async () => {
    // NEXT_PUBLIC_SITE_URL thường có www; ghép thẳng sẽ ra tên miền không ai tạo.
    const mod = await import('../hosts');
    expect(mod.MERCHANT_HOST).not.toContain('.www.');
    expect(mod.ADMIN_HOST).not.toContain('.www.');
    expect(mod.BASE_HOST.startsWith('www.')).toBe(false);
  });
});
