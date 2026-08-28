import { NextResponse, type NextRequest } from 'next/server';
import {
  AREA_HOSTS_ENABLED, AREA_ROOT_PATH, AREA_SIGN_IN,
  areaForHost, areaForPath, hostForArea, isSingleHostDev, type Area,
} from '@/config/hosts';

/**
 * Định tuyến ba khu vực theo tên miền.
 *
 *   shalom1379.com           → khách hàng
 *   merchant.shalom1379.com  → đối tác
 *   admin.shalom1379.com     → quản trị
 *
 * CHỈ DÙNG CHUYỂN HƯỚNG, KHÔNG VIẾT LẠI ĐƯỜNG DẪN.
 *
 * Bản đầu có viết lại để URL gọn hơn (`merchant.shalom1379.com/dich-vu` thay vì
 * `.../merchant/dich-vu`). Đã bỏ vì bộ nhớ đệm điều hướng phía trình duyệt của
 * Next.js không tôn trọng lệnh viết lại khi chuyển trang mềm: máy chủ trả đúng
 * trang đối tác nhưng trình duyệt vẫn dựng trang khách. Đã kiểm và tái hiện
 * được nhiều lần. Hiện nhầm trang nguy hiểm hơn nhiều so với một URL dài hơn,
 * nên giữ nguyên tiền tố trong đường dẫn.
 *
 * Đây KHÔNG phải lớp bảo vệ quyền. Việc chặn quyền vẫn nằm ở layout của từng
 * khu (kiểm tra phiên đăng nhập và vai trò). Middleware chỉ lo địa chỉ.
 */

const AREA_ROOT = AREA_ROOT_PATH;

/** Tài nguyên kỹ thuật, không thuộc khu nào. */
const SHARED_PREFIXES = [
  '/_next', '/api', '/favicon', '/robots.txt', '/sitemap.xml',
  '/icon', '/apple-icon', '/opengraph-image', '/manifest',
];

/**
 * Trang dùng chung cho cả ba khu: pháp lý và khôi phục mật khẩu.
 * Thiếu danh sách này thì đối tác quên mật khẩu sẽ không có đường vào lại.
 */
const SHARED_PAGES = [
  '/quen-mat-khau',
  '/dieu-khoan',
  '/dieu-khoan-doi-tac',
  '/dieu-khoan-gioi-thieu',
  '/chinh-sach-bao-mat',
  '/chinh-sach-cookie',
  '/chinh-sach-huy-hoan-tien',
];

const under = (pathname: string, root: string) =>
  pathname === root || pathname.startsWith(`${root}/`);

function isShared(pathname: string): boolean {
  return SHARED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))
    || SHARED_PAGES.some((p) => under(pathname, p));
}

function redirectTo(host: string, path: string, req: NextRequest): NextResponse {
  const url = new URL(req.url);
  // Gán `url.host` bằng chuỗi không kèm cổng thì cổng CŨ được giữ nguyên theo
  // đặc tả URL — sinh ra `merchant.shalom1379.com:3000`. Phải tách rõ hai phần.
  const [hostname, port] = host.split(':');
  url.hostname = hostname;
  url.port = port ?? '';
  url.pathname = path;
  // 307 chứ không phải 308: cấu hình tên miền có thể đổi, không nên để trình
  // duyệt nhớ vĩnh viễn.
  return NextResponse.redirect(url, 307);
}

/**
 * Báo cho layout biết đang ở khu nào, để dựng đúng khung đầu/cuối trang.
 * Layout của Next không đọc được đường dẫn, nên truyền qua header.
 */
function passThrough(req: NextRequest, area: Area): NextResponse {
  const headers = new Headers(req.headers);
  headers.set('x-dw-area', area);
  return NextResponse.next({ request: { headers } });
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const { pathname } = req.nextUrl;

  if (isShared(pathname)) {
    return passThrough(req, AREA_HOSTS_ENABLED ? areaForHost(host) : 'customer');
  }

  // Chưa tách tên miền: cả ba khu chung một tên miền, phân biệt bằng đường dẫn.
  // Đây là mặc định — dùng được ngay, không phải chờ tạo subdomain và cấp SSL.
  if (!AREA_HOSTS_ENABLED) return passThrough(req, areaForPath(pathname));

  // Máy phát triển trên localhost trần: giữ nguyên một tên miền cho tiện.
  if (isSingleHostDev(host)) return passThrough(req, areaForPath(pathname));

  const area = areaForHost(host);
  const inMerchant = under(pathname, AREA_ROOT.merchant) || pathname === AREA_SIGN_IN.merchant;
  const inAdmin = under(pathname, AREA_ROOT.admin) || pathname === AREA_SIGN_IN.admin;

  // ── Tên miền chính: đẩy mọi thứ thuộc khu nội bộ sang đúng tên miền ───────
  if (area === 'customer') {
    if (inMerchant) return redirectTo(hostForArea('merchant', host), pathname, req);
    if (inAdmin) return redirectTo(hostForArea('admin', host), pathname, req);
    return passThrough(req, 'customer');
  }

  // ── Tên miền khu vực ──────────────────────────────────────────────────────
  const otherArea: Area = area === 'merchant' ? 'admin' : 'merchant';
  const inOwn = area === 'merchant' ? inMerchant : inAdmin;
  const inOther = area === 'merchant' ? inAdmin : inMerchant;

  if (inOther) return redirectTo(hostForArea(otherArea, host), pathname, req);
  if (inOwn) return passThrough(req, area);

  // Còn lại là trang của khách — không thuộc tên miền này. Đưa về cửa của khu.
  return redirectTo(host, AREA_ROOT[area], req);
}

export const config = {
  // Bỏ qua tệp tĩnh để middleware không chạy thừa trên mỗi ảnh, mỗi font.
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
