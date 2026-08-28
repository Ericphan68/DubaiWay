/**
 * Xác thực trong bộ nhớ — dùng khi chưa cấu hình Supabase.
 *
 * KHÔNG DÙNG Ở PRODUCTION. Mục đích là để chạy và kiểm thử toàn bộ luồng
 * đăng ký / đăng nhập / phân quyền ngay sau khi clone, không cần tài khoản dịch vụ.
 *
 * Mật khẩu được băm bằng scrypt (có salt) chứ không lưu thô — kể cả ở bản giả lập,
 * vì lập trình viên sẽ gõ mật khẩu thật của họ vào đây do thói quen.
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { generateReferralCode } from '@/core/referral';
import type { AuthProvider, AuthResult, SessionUser, SignInInput, SignUpInput, UserRole } from './types';

interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  locale: 'vi' | 'en';
  emailVerified: boolean;
  roles: UserRole[];
  merchantId: string | null;
  referralCode: string;
  referredBy: string | null;
}

/** Neo vào globalThis vì Next.js nạp module theo chunk — xem chú thích ở booking-store.ts. */
interface AuthState {
  users: Map<string, StoredUser>;
  usersById: Map<string, StoredUser>;
  tokens: Map<string, string>;
  codeToUserId: Map<string, string>;
}
const globalAuth = globalThis as unknown as { __dubaiwayAuth?: AuthState };
const authState: AuthState = (globalAuth.__dubaiwayAuth ??= {
  users: new Map<string, StoredUser>(),
  usersById: new Map<string, StoredUser>(),
  tokens: new Map<string, string>(),
  codeToUserId: new Map<string, string>(),
});
const { users, usersById, tokens, codeToUserId } = authState;

const norm = (email: string) => email.trim().toLowerCase();

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, expected: string): boolean {
  const actual = hashPassword(password, salt);
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function toSessionUser(u: StoredUser): SessionUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    locale: u.locale,
    emailVerified: u.emailVerified,
    roles: [...u.roles],
    merchantId: u.merchantId,
  };
}

function issueToken(userId: string): string {
  const token = randomBytes(32).toString('hex');
  tokens.set(token, userId);
  return token;
}

/** Tài khoản demo để chạy thử ngay — khớp với dữ liệu trong supabase/seed.sql. */
const DEMO_ACCOUNTS: { email: string; fullName: string; roles: UserRole[]; merchantId: string | null; id: string }[] = [
  { id: 'a0000000-0000-4000-8000-000000000001', email: 'admin@dubaiway.test',     fullName: 'DubaiWay Admin',    roles: ['super_admin'], merchantId: null },
  { id: 'a0000000-0000-4000-8000-000000000002', email: 'finance@dubaiway.test',   fullName: 'DubaiWay Finance',  roles: ['finance'],     merchantId: null },
  { id: 'a0000000-0000-4000-8000-000000000003', email: 'reviewer@dubaiway.test',  fullName: 'DubaiWay Reviewer', roles: ['merchant_reviewer', 'service_reviewer'], merchantId: null },
  { id: 'b0000000-0000-4000-8000-000000000001', email: 'desertrose@example.test', fullName: 'Ahmed Al Mansouri', roles: ['merchant_owner'], merchantId: 'e0000000-0000-4000-8000-000000000001' },
  { id: 'c0000000-0000-4000-8000-000000000001', email: 'linh@example.test',       fullName: 'Nguyễn Thuỳ Linh',  roles: ['customer'],    merchantId: null },
];

const DEMO_PASSWORD = 'DubaiWay!2026';

function seedDemoAccounts(): void {
  if (users.size > 0) return;
  for (const a of DEMO_ACCOUNTS) {
    const salt = randomBytes(16).toString('hex');
    const code = generateReferralCode();
    const u: StoredUser = {
      id: a.id,
      email: a.email,
      fullName: a.fullName,
      passwordHash: hashPassword(DEMO_PASSWORD, salt),
      salt,
      locale: 'vi',
      emailVerified: true,
      roles: a.roles,
      merchantId: a.merchantId,
      referralCode: code,
      referredBy: null,
    };
    users.set(norm(a.email), u);
    usersById.set(u.id, u);
    codeToUserId.set(code, u.id);
  }
}

export const memoryAuthProvider: AuthProvider = {
  name: 'memory',
  isMemoryMode: true,

  async signUp(input: SignUpInput): Promise<AuthResult> {
    seedDemoAccounts();
    const email = norm(input.email);
    if (!email.includes('@')) return { ok: false, error: 'Email không hợp lệ' };
    if (input.password.length < 8) {
      return { ok: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    if (users.has(email)) return { ok: false, error: 'Email này đã được đăng ký' };

    // Ghi nhận người giới thiệu — CHỈ MỘT TẦNG, chỉ lấy người giới thiệu trực tiếp.
    let referredBy: string | null = null;
    if (input.referralCode) {
      const referrerId = codeToUserId.get(input.referralCode.trim().toUpperCase());
      if (referrerId) referredBy = referrerId;
    }

    const salt = randomBytes(16).toString('hex');
    const id = crypto.randomUUID();
    let code = generateReferralCode();
    while (codeToUserId.has(code)) code = generateReferralCode();

    const u: StoredUser = {
      id,
      email,
      fullName: input.fullName.trim(),
      passwordHash: hashPassword(input.password, salt),
      salt,
      locale: input.locale ?? 'vi',
      emailVerified: false,
      roles: ['customer'],
      merchantId: null,
      referralCode: code,
      referredBy,
    };
    users.set(email, u);
    usersById.set(id, u);
    codeToUserId.set(code, id);

    return { ok: true, user: toSessionUser(u), token: issueToken(id) };
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    seedDemoAccounts();
    const u = users.get(norm(input.email));
    // Thông báo giống nhau cho sai email và sai mật khẩu — không tiết lộ email nào tồn tại.
    if (!u || !verifyPassword(input.password, u.salt, u.passwordHash)) {
      return { ok: false, error: 'Email hoặc mật khẩu không đúng' };
    }
    return { ok: true, user: toSessionUser(u), token: issueToken(u.id) };
  },

  async getUserByToken(token: string): Promise<SessionUser | null> {
    seedDemoAccounts();
    const userId = tokens.get(token);
    if (!userId) return null;
    const u = usersById.get(userId);
    return u ? toSessionUser(u) : null;
  },

  async requestPasswordReset(email: string) {
    seedDemoAccounts();
    // Luôn trả cùng một thông báo dù email có tồn tại hay không —
    // không để kẻ xấu dò xem email nào đã đăng ký.
    return {
      ok: true,
      message: `Nếu ${email} đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.`,
    };
  },
};

// ─── QUẢN LÝ NGƯỜI DÙNG VÀ VAI TRÒ (dành cho Admin) ────────────────────────
export interface ManagedUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly UserRole[];
  readonly merchantId: string | null;
  readonly emailVerified: boolean;
}

export function listAllUsers(): ManagedUser[] {
  seedDemoAccounts();
  return [...users.values()]
    .map((u) => ({
      id: u.id, email: u.email, fullName: u.fullName,
      roles: [...u.roles], merchantId: u.merchantId, emailVerified: u.emailVerified,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export class RoleError extends Error {
  constructor(message: string) { super(message); this.name = 'RoleError'; }
}

/**
 * Cấp vai trò cho một người.
 *
 * KHÔNG cho phép tự cấp quyền cho chính mình — người thực hiện phải khác người nhận.
 * Đây là chốt chặn cơ bản chống leo thang đặc quyền.
 */
export function grantRole(actorUserId: string, targetUserId: string, role: UserRole): ManagedUser {
  seedDemoAccounts();
  if (actorUserId === targetUserId) {
    throw new RoleError('Không thể tự cấp thêm quyền cho chính mình');
  }
  const u = usersById.get(targetUserId);
  if (!u) throw new RoleError('Không tìm thấy người dùng');
  if (u.roles.includes(role)) throw new RoleError('Người này đã có vai trò đó');
  u.roles.push(role);
  return {
    id: u.id, email: u.email, fullName: u.fullName,
    roles: [...u.roles], merchantId: u.merchantId, emailVerified: u.emailVerified,
  };
}

export function revokeRole(actorUserId: string, targetUserId: string, role: UserRole): ManagedUser {
  seedDemoAccounts();
  if (actorUserId === targetUserId) {
    throw new RoleError('Không thể tự thu hồi quyền của chính mình — nhờ Super Admin khác thực hiện');
  }
  const u = usersById.get(targetUserId);
  if (!u) throw new RoleError('Không tìm thấy người dùng');

  // Không để hệ thống rơi vào tình trạng không còn Super Admin nào.
  if (role === 'super_admin') {
    const remaining = [...users.values()].filter(
      (x) => x.id !== targetUserId && x.roles.includes('super_admin'),
    ).length;
    if (remaining === 0) {
      throw new RoleError('Đây là Super Admin cuối cùng — phải cấp cho người khác trước khi thu hồi');
    }
  }

  u.roles = u.roles.filter((r) => r !== role);
  if (u.roles.length === 0) u.roles.push('customer');
  return {
    id: u.id, email: u.email, fullName: u.fullName,
    roles: [...u.roles], merchantId: u.merchantId, emailVerified: u.emailVerified,
  };
}

/** Chỉ dùng trong test. */
export function __resetMemoryAuth(): void {
  users.clear();
  usersById.clear();
  tokens.clear();
  codeToUserId.clear();
}

export function __getReferralCode(email: string): string | null {
  seedDemoAccounts();
  return users.get(norm(email))?.referralCode ?? null;
}

export function __getReferredBy(email: string): string | null {
  return users.get(norm(email))?.referredBy ?? null;
}

export const DEMO_CREDENTIALS = { password: DEMO_PASSWORD, accounts: DEMO_ACCOUNTS };
