/**
 * Ba khu vực, ba tên miền.
 *
 *   shalom1379.com           → khách hàng (đăng nhập ngay trên trang chính)
 *   merchant.shalom1379.com  → đối tác    (trang đăng nhập riêng)
 *   admin.shalom1379.com     → quản trị   (trang đăng nhập riêng)
 *
 * Middleware đọc header Host rồi quyết định phục vụ khu nào. URL hiển thị luôn
 * sạch: `merchant.shalom1379.com/dich-vu` chứ không phải `.../merchant/dich-vu`.
 *
 * PHIÊN ĐĂNG NHẬP KHÔNG DÙNG CHUNG giữa các tên miền. Cookie phiên là host-only
 * nên phiên quản trị không bao giờ theo người dùng ra trang công khai. Đây là
 * chủ ý, không phải thiếu sót.
 */

export type Area = 'customer' | 'merchant' | 'admin';

/**
 * Cửa vào của từng khu — ba link khác nhau.
 *
 *   /               → khách hàng
 *   /khu-doi-tac    → đối tác
 *   /khu-quan-tri   → quản trị
 *
 * Dùng tiền tố "khu-" vì `/doi-tac/<slug>` đã là trang hồ sơ đối tác công khai
 * dành cho khách xem — hai thứ khác hẳn nhau, không được trùng đường dẫn.
 *
 * Ba đường dẫn này dùng được ngay trên MỘT tên miền, không cần dựng subdomain.
 * Khi bật chế độ nhiều tên miền, chúng nằm trên subdomain tương ứng.
 *
 * Đặt ngoài /merchant và /admin là có chủ ý: layout hai khu đó đẩy người chưa
 * đăng nhập về trang đăng nhập, nên trang đăng nhập không được nằm trong chính
 * layout ấy, nếu không sẽ chuyển hướng vòng tròn.
 */
export const AREA_SIGN_IN: Record<Area, string> = {
  customer: '/dang-nhap',
  merchant: '/khu-doi-tac',
  admin: '/khu-quan-tri',
};

/**
 * Bật tách tên miền hay chưa.
 *
 * MẶC ĐỊNH TẮT. Khi tắt, cả ba khu chạy trên cùng một tên miền và phân biệt
 * bằng đường dẫn — dùng được ngay, không phải chờ tạo subdomain và cấp SSL.
 * Tạo xong subdomain trên máy chủ thì đặt NEXT_PUBLIC_AREA_HOSTS=on.
 */
export const AREA_HOSTS_ENABLED =
  (process.env.NEXT_PUBLIC_AREA_HOSTS ?? '').trim().toLowerCase() === 'on';

/** Thư mục gốc của khu trong app/ — cũng là trang chủ sau khi đăng nhập. */
export const AREA_ROOT_PATH = {
  merchant: '/merchant',
  admin: '/admin',
} as const;

/** Trang chủ của từng khu sau khi đăng nhập. */
export const AREA_HOME: Record<Area, string> = {
  customer: '/tai-khoan',
  merchant: AREA_ROOT_PATH.merchant,
  admin: AREA_ROOT_PATH.admin,
};

/** Tiền tố đường dẫn thật trong thư mục app/ của từng khu. */
export const AREA_PREFIX: Record<Area, string> = {
  customer: '',
  merchant: '/merchant',
  admin: '/admin',
};

const env = (v: string | undefined) => v?.trim().toLowerCase() || undefined;

/** Bỏ giao thức và đường dẫn, chỉ giữ tên miền (kèm cổng nếu có). */
function hostOf(urlOrHost: string): string {
  const s = urlOrHost.trim().toLowerCase();
  try {
    return new URL(s.includes('://') ? s : `https://${s}`).host;
  } catch {
    return s;
  }
}

/**
 * Tên miền gốc. Lấy từ NEXT_PUBLIC_SITE_URL để không phải khai báo hai lần.
 * Viết tĩnh `process.env.X` vì Next.js chỉ thay thế được dạng này vào bundle.
 */
export const ROOT_HOST = hostOf(env(process.env.NEXT_PUBLIC_SITE_URL) ?? 'localhost:3000');

/**
 * Tên miền trần dùng để ghép subdomain.
 *
 * Bỏ tiền tố `www.`: NEXT_PUBLIC_SITE_URL thường là https://www.shalom1379.com,
 * ghép thẳng sẽ ra `merchant.www.shalom1379.com` — một tên miền không ai tạo.
 */
export const BASE_HOST = ROOT_HOST.replace(/^www\./, '');

/** Cho phép đặt đè khi tên miền khu vực không cùng gốc với trang chính. */
export const MERCHANT_HOST =
  env(process.env.NEXT_PUBLIC_MERCHANT_HOST) ?? `merchant.${BASE_HOST}`;
export const ADMIN_HOST =
  env(process.env.NEXT_PUBLIC_ADMIN_HOST) ?? `admin.${BASE_HOST}`;

/**
 * Máy phát triển không có subdomain thật. Khi chạy trên localhost trần,
 * mọi khu dùng chung một tên miền và middleware không đổi hướng gì cả —
 * nhờ vậy `npm run dev` vẫn chạy y như trước.
 *
 * Muốn thử đúng kiểu nhiều tên miền thì mở `merchant.localhost:3000`
 * và `admin.localhost:3000` (Chrome tự trỏ *.localhost về 127.0.0.1).
 */
export function isSingleHostDev(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'localhost' || h.startsWith('localhost:')
    || h === '127.0.0.1' || h.startsWith('127.0.0.1:');
}

/** Máy phát triển: localhost, 127.0.0.1, và mọi subdomain của chúng. */
export function isLocalHostname(hostname: string): boolean {
  const bare = hostname.toLowerCase().split(':')[0];
  return bare === 'localhost' || bare.endsWith('.localhost')
    || bare === '127.0.0.1' || bare === '::1';
}

/**
 * Khu vực suy từ ĐƯỜNG DẪN. Dùng khi cả ba khu ở chung một tên miền,
 * và để chọn khung đầu/cuối trang cho đúng.
 */
export function areaForPath(pathname: string): Area {
  if (pathname === AREA_SIGN_IN.merchant || pathname.startsWith(`${AREA_SIGN_IN.merchant}/`)
    || pathname === AREA_ROOT_PATH.merchant || pathname.startsWith(`${AREA_ROOT_PATH.merchant}/`)) {
    return 'merchant';
  }
  if (pathname === AREA_SIGN_IN.admin || pathname.startsWith(`${AREA_SIGN_IN.admin}/`)
    || pathname === AREA_ROOT_PATH.admin || pathname.startsWith(`${AREA_ROOT_PATH.admin}/`)) {
    return 'admin';
  }
  return 'customer';
}

/** Khu vực tương ứng với tên miền đang truy cập. */
export function areaForHost(hostname: string): Area {
  const h = hostname.toLowerCase();
  const bare = h.split(':')[0];
  const matches = (target: string) => {
    const t = target.split(':')[0];
    return bare === t;
  };
  if (matches(MERCHANT_HOST) || bare.startsWith('merchant.')) return 'merchant';
  if (matches(ADMIN_HOST) || bare.startsWith('admin.')) return 'admin';
  return 'customer';
}

/**
 * Tên miền phục vụ một khu, giữ nguyên cổng của tên miền đang dùng.
 *
 * Khi đang ở máy phát triển thì suy ra tên miền anh em từ CHÍNH tên miền đang
 * dùng, chứ không lấy theo cấu hình. Nếu không, bấm từ merchant.localhost sang
 * khu quản trị sẽ văng thẳng ra tên miền thật đang chạy production.
 */
export function hostForArea(area: Area, currentHost: string): string {
  const port = currentHost.includes(':') ? `:${currentHost.split(':')[1]}` : '';
  const bare = (h: string) => h.split(':')[0];

  if (isLocalHostname(currentHost)) {
    // Giữ nguyên gốc cục bộ: localhost hay 127.0.0.1 tuỳ cái đang mở.
    const root = bare(currentHost).replace(/^(merchant|admin)\./, '');
    if (area === 'merchant') return `merchant.${root}${port}`;
    if (area === 'admin') return `admin.${root}${port}`;
    return root + port;
  }

  if (area === 'merchant') return bare(MERCHANT_HOST) + port;
  if (area === 'admin') return bare(ADMIN_HOST) + port;
  return bare(ROOT_HOST) + port;
}

/**
 * Địa chỉ đầy đủ tới một khu. Dùng cho link trong header và email,
 * nơi cần đường dẫn tuyệt đối chứ không phải đường dẫn tương đối.
 */
export function urlForArea(area: Area, path = '/', currentHost?: string): string {
  // Chưa tách tên miền: ba khu chung một tên miền, chỉ khác đường dẫn.
  // Trả về đường dẫn tương đối để chạy đúng ở mọi môi trường.
  if (!AREA_HOSTS_ENABLED) {
    if (path !== '/') return path.startsWith('/') ? path : `/${path}`;
    return area === 'customer' ? '/' : AREA_SIGN_IN[area];
  }
  const host = hostForArea(area, currentHost ?? ROOT_HOST);
  // Phải xét cả subdomain: `merchant.localhost:3000` vẫn là máy phát triển.
  // Kiểm tra bằng startsWith trên chuỗi đầy đủ sẽ bỏ sót và sinh link https hỏng.
  const scheme = isLocalHostname(host) ? 'http' : 'https';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${scheme}://${host}${clean}`;
}
