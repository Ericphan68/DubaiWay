import { beforeEach, describe, expect, it } from 'vitest';
import {
  __getReferralCode, __getReferredBy, __resetMemoryAuth, memoryAuthProvider,
} from '../memory-provider';
import {
  ForbiddenError, hasPermission, isMerchantMember, isPlatformStaff, requirePermission,
} from '../permissions';
import type { SessionUser } from '../types';

beforeEach(() => { __resetMemoryAuth(); });

const user = (roles: SessionUser['roles'], merchantId: string | null = null): SessionUser => ({
  id: 'u1', email: 'x@test.test', fullName: 'X', locale: 'vi',
  emailVerified: true, roles, merchantId,
});

describe('Đăng ký', () => {
  it('tạo được tài khoản mới', async () => {
    const r = await memoryAuthProvider.signUp({
      email: 'moi@example.test', password: 'MatKhauDaiHon8', fullName: 'Người Mới',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.user.email).toBe('moi@example.test');
      expect(r.user.roles).toEqual(['customer']);
      expect(r.token).toHaveLength(64);
    }
  });

  it('từ chối mật khẩu ngắn hơn 8 ký tự', async () => {
    const r = await memoryAuthProvider.signUp({
      email: 'a@example.test', password: 'ngan', fullName: 'A' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/ít nhất 8 ký tự/);
  });

  it('từ chối email đã tồn tại', async () => {
    await memoryAuthProvider.signUp({ email: 'trung@example.test', password: 'MatKhauDaiHon8', fullName: 'A' });
    const r = await memoryAuthProvider.signUp({ email: 'trung@example.test', password: 'MatKhauDaiHon8', fullName: 'B' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/đã được đăng ký/);
  });

  it('email không hợp lệ bị từ chối', async () => {
    const r = await memoryAuthProvider.signUp({ email: 'khongphaiemail', password: 'MatKhauDaiHon8', fullName: 'A' });
    expect(r.ok).toBe(false);
  });

  it('email không phân biệt hoa thường', async () => {
    await memoryAuthProvider.signUp({ email: 'Hoa@Example.Test', password: 'MatKhauDaiHon8', fullName: 'A' });
    const r = await memoryAuthProvider.signIn({ email: 'hoa@example.test', password: 'MatKhauDaiHon8' });
    expect(r.ok).toBe(true);
  });

  it('mỗi người có mã giới thiệu riêng, không trùng nhau', async () => {
    await memoryAuthProvider.signUp({ email: 'a1@example.test', password: 'MatKhauDaiHon8', fullName: 'A' });
    await memoryAuthProvider.signUp({ email: 'a2@example.test', password: 'MatKhauDaiHon8', fullName: 'B' });
    const c1 = __getReferralCode('a1@example.test');
    const c2 = __getReferralCode('a2@example.test');
    expect(c1).toBeTruthy();
    expect(c1).not.toBe(c2);
  });
});

describe('Ghi nhận giới thiệu lúc đăng ký — MỘT TẦNG', () => {
  it('mã hợp lệ thì ghi nhận người giới thiệu trực tiếp', async () => {
    const a = await memoryAuthProvider.signUp({ email: 'a@example.test', password: 'MatKhauDaiHon8', fullName: 'A' });
    const code = __getReferralCode('a@example.test') as string;
    await memoryAuthProvider.signUp({
      email: 'b@example.test', password: 'MatKhauDaiHon8', fullName: 'B', referralCode: code });
    expect(__getReferredBy('b@example.test')).toBe(a.ok ? a.user.id : null);
  });

  it('B giới thiệu C thì A KHÔNG dính tới C', async () => {
    await memoryAuthProvider.signUp({ email: 'a@example.test', password: 'MatKhauDaiHon8', fullName: 'A' });
    const codeA = __getReferralCode('a@example.test') as string;
    const b = await memoryAuthProvider.signUp({
      email: 'b@example.test', password: 'MatKhauDaiHon8', fullName: 'B', referralCode: codeA });
    const codeB = __getReferralCode('b@example.test') as string;
    await memoryAuthProvider.signUp({
      email: 'c@example.test', password: 'MatKhauDaiHon8', fullName: 'C', referralCode: codeB });

    // C chỉ trỏ tới B, không có bất cứ liên hệ nào tới A.
    expect(__getReferredBy('c@example.test')).toBe(b.ok ? b.user.id : null);
    expect(__getReferredBy('c@example.test')).not.toBe(__getReferredBy('b@example.test'));
  });

  it('mã giới thiệu sai thì bỏ qua, vẫn đăng ký được', async () => {
    const r = await memoryAuthProvider.signUp({
      email: 'x@example.test', password: 'MatKhauDaiHon8', fullName: 'X', referralCode: 'KHONGCOTHAT' });
    expect(r.ok).toBe(true);
    expect(__getReferredBy('x@example.test')).toBeNull();
  });
});

describe('Đăng nhập', () => {
  it('đúng mật khẩu thì vào được', async () => {
    await memoryAuthProvider.signUp({ email: 'u@example.test', password: 'MatKhauDaiHon8', fullName: 'U' });
    const r = await memoryAuthProvider.signIn({ email: 'u@example.test', password: 'MatKhauDaiHon8' });
    expect(r.ok).toBe(true);
  });

  it('sai mật khẩu bị từ chối', async () => {
    await memoryAuthProvider.signUp({ email: 'u@example.test', password: 'MatKhauDaiHon8', fullName: 'U' });
    const r = await memoryAuthProvider.signIn({ email: 'u@example.test', password: 'SaiMatKhau123' });
    expect(r.ok).toBe(false);
  });

  it('email sai và mật khẩu sai cho THÔNG BÁO GIỐNG NHAU — không lộ email nào tồn tại', async () => {
    await memoryAuthProvider.signUp({ email: 'u@example.test', password: 'MatKhauDaiHon8', fullName: 'U' });
    const saiMatKhau = await memoryAuthProvider.signIn({ email: 'u@example.test', password: 'Sai' });
    const khongTonTai = await memoryAuthProvider.signIn({ email: 'khongco@example.test', password: 'Sai' });
    expect(saiMatKhau.ok).toBe(false);
    expect(khongTonTai.ok).toBe(false);
    if (!saiMatKhau.ok && !khongTonTai.ok) {
      expect(saiMatKhau.error).toBe(khongTonTai.error);
    }
  });

  it('token dùng được để lấy lại phiên', async () => {
    const r = await memoryAuthProvider.signUp({ email: 'u@example.test', password: 'MatKhauDaiHon8', fullName: 'U' });
    if (!r.ok) throw new Error('đăng ký thất bại');
    const me = await memoryAuthProvider.getUserByToken(r.token);
    expect(me?.email).toBe('u@example.test');
  });

  it('token bịa không lấy được phiên', async () => {
    expect(await memoryAuthProvider.getUserByToken('token-gia-mao')).toBeNull();
  });
});

describe('Quên mật khẩu không lộ thông tin', () => {
  it('email tồn tại và không tồn tại đều trả cùng dạng thông báo', async () => {
    await memoryAuthProvider.signUp({ email: 'co@example.test', password: 'MatKhauDaiHon8', fullName: 'A' });
    const a = await memoryAuthProvider.requestPasswordReset('co@example.test');
    const b = await memoryAuthProvider.requestPasswordReset('khongco@example.test');
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(a.message.replace('co@example.test', 'X')).toBe(b.message.replace('khongco@example.test', 'X'));
  });
});

describe('Phân quyền', () => {
  it('super_admin có mọi quyền', () => {
    expect(hasPermission(user(['super_admin']), 'finance.manage')).toBe(true);
    expect(hasPermission(user(['super_admin']), 'role.manage')).toBe(true);
  });

  it('merchant_reviewer duyệt được merchant nhưng KHÔNG động vào tiền', () => {
    const u = user(['merchant_reviewer']);
    expect(hasPermission(u, 'merchant.review')).toBe(true);
    expect(hasPermission(u, 'finance.manage')).toBe(false);
    expect(hasPermission(u, 'refund.manage')).toBe(false);
  });

  it('finance xử lý tiền nhưng KHÔNG duyệt được merchant', () => {
    const u = user(['finance']);
    expect(hasPermission(u, 'finance.manage')).toBe(true);
    expect(hasPermission(u, 'merchant.review')).toBe(false);
  });

  it('customer_support xem đơn nhưng KHÔNG hoàn tiền được', () => {
    const u = user(['customer_support']);
    expect(hasPermission(u, 'booking.read_all')).toBe(true);
    expect(hasPermission(u, 'refund.manage')).toBe(false);
  });

  it('chỉ super_admin được phân quyền — không ai tự nâng quyền cho mình', () => {
    for (const role of ['finance', 'merchant_reviewer', 'customer_support', 'marketing'] as const) {
      expect(hasPermission(user([role]), 'role.manage')).toBe(false);
    }
    expect(hasPermission(user(['super_admin']), 'role.manage')).toBe(true);
  });

  it('customer không có quyền cấp nền tảng nào', () => {
    const u = user(['customer']);
    expect(hasPermission(u, 'booking.read_all')).toBe(false);
    expect(hasPermission(u, 'finance.manage')).toBe(false);
    expect(isPlatformStaff(u)).toBe(false);
  });

  it('merchant_owner không có quyền cấp nền tảng', () => {
    const u = user(['merchant_owner'], 'm1');
    expect(hasPermission(u, 'booking.read_all')).toBe(false);
    expect(isPlatformStaff(u)).toBe(false);
    expect(isMerchantMember(u)).toBe(true);
  });

  it('merchant_owner không gắn merchant nào thì không phải thành viên merchant', () => {
    expect(isMerchantMember(user(['merchant_owner'], null))).toBe(false);
  });

  it('chưa đăng nhập thì không có quyền gì', () => {
    expect(hasPermission(null, 'booking.read_all')).toBe(false);
    expect(isPlatformStaff(null)).toBe(false);
    expect(isMerchantMember(null)).toBe(false);
  });

  it('requirePermission ném lỗi khi thiếu quyền', () => {
    expect(() => requirePermission(user(['customer']), 'finance.manage')).toThrow(ForbiddenError);
    expect(() => requirePermission(user(['finance']), 'finance.manage')).not.toThrow();
  });
});
