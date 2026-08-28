/**
 * Lớp xác thực.
 *
 * Ứng dụng chỉ nói chuyện qua interface này. Có Supabase → dùng Supabase Auth.
 * Chưa có → dùng bản trong bộ nhớ, để chạy và kiểm thử được toàn bộ luồng
 * đăng ký / đăng nhập / phân quyền mà không cần tài khoản dịch vụ nào.
 */
export type UserRole =
  | 'customer'
  | 'merchant_owner'
  | 'merchant_staff'
  | 'merchant_scanner'
  | 'super_admin'
  | 'merchant_reviewer'
  | 'service_reviewer'
  | 'customer_support'
  | 'finance'
  | 'dispute_officer'
  | 'content_manager'
  | 'marketing';

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string | null;
  readonly locale: 'vi' | 'en';
  readonly emailVerified: boolean;
  readonly roles: readonly UserRole[];
  /** merchant mà người này thuộc về, nếu có. */
  readonly merchantId: string | null;
}

export interface SignUpInput {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly locale?: 'vi' | 'en';
  /** Mã giới thiệu người dùng nhập lúc đăng ký. */
  readonly referralCode?: string;
}

export interface SignInInput {
  readonly email: string;
  readonly password: string;
}

export type AuthResult =
  | { readonly ok: true; readonly user: SessionUser; readonly token: string }
  | { readonly ok: false; readonly error: string };

export interface AuthProvider {
  readonly name: string;
  readonly isMemoryMode: boolean;
  signUp(input: SignUpInput): Promise<AuthResult>;
  signIn(input: SignInInput): Promise<AuthResult>;
  getUserByToken(token: string): Promise<SessionUser | null>;
  requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }>;
}
