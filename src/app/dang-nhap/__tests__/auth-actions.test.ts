import { describe, expect, it } from 'vitest';
import { signInAction, signUpAction } from '../actions';

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.append(k, v);
  return f;
};

const prev = { error: null };

/**
 * React 19 xoá trắng form sau mỗi form action. Nếu action không trả lại những
 * gì người dùng đã gõ thì họ mất hết, và cú bấm tiếp theo sẽ gửi ô rỗng — đúng
 * cái sinh ra thông báo "Email không hợp lệ" khiến người dùng tưởng sai tài khoản.
 *
 * Các test dưới chỉ chạy nhánh LỖI, vì nhánh thành công gọi redirect() và
 * cookies() của Next.js, cần bối cảnh request thật.
 */
describe('Form đăng nhập giữ lại thông tin đã gõ khi lỗi', () => {
  it('sai mật khẩu vẫn giữ email', async () => {
    const s = await signInAction(prev, fd({ email: 'linh@example.test', password: 'sai' }));
    expect(s.error).toBeTruthy();
    expect(s.values?.email).toBe('linh@example.test');
  });

  it('email sai định dạng vẫn giữ lại để người dùng sửa tại chỗ', async () => {
    const s = await signInAction(prev, fd({ email: 'linh@@example', password: 'x' }));
    expect(s.fieldErrors?.email).toBe('Email không hợp lệ');
    expect(s.values?.email).toBe('linh@@example');
  });

  it('KHÔNG BAO GIỜ trả mật khẩu về trình duyệt', async () => {
    const s = await signInAction(prev, fd({ email: 'linh@example.test', password: 'bi-mat-123' }));
    expect(JSON.stringify(s)).not.toContain('bi-mat-123');
    expect(s.values?.password).toBeUndefined();
  });

  it('email rỗng báo đúng lỗi định dạng', async () => {
    const s = await signInAction(prev, fd({ email: '', password: 'x' }));
    expect(s.fieldErrors?.email).toBe('Email không hợp lệ');
  });

  it('đăng ký lỗi vẫn giữ họ tên, email và mã giới thiệu', async () => {
    const s = await signUpAction(prev, fd({
      fullName: 'Nguyễn Văn A', email: 'a@b.test', password: 'ngan', referralCode: 'DW123', accept: 'on',
    }));
    expect(s.fieldErrors?.password).toBeTruthy();
    expect(s.values).toMatchObject({
      fullName: 'Nguyễn Văn A', email: 'a@b.test', referralCode: 'DW123',
    });
    expect(JSON.stringify(s)).not.toContain('ngan');
  });
});

describe('Tài khoản demo in trên trang đăng nhập', () => {
  it('đăng nhập được bằng đúng mật khẩu đang hiển thị', async () => {
    // Đổi mật khẩu demo mà quên sửa chỗ hiển thị thì test này đỏ.
    const { DEMO_CREDENTIALS, memoryAuthProvider } = await import('@/server/auth/memory-provider');
    for (const acc of DEMO_CREDENTIALS.accounts) {
      const r = await memoryAuthProvider.signIn({
        email: acc.email, password: DEMO_CREDENTIALS.password,
      });
      expect(r.ok, `${acc.email} không đăng nhập được`).toBe(true);
    }
  });

  it('từ chối mật khẩu sai trên tài khoản demo', async () => {
    const { DEMO_CREDENTIALS, memoryAuthProvider } = await import('@/server/auth/memory-provider');
    const r = await memoryAuthProvider.signIn({
      email: DEMO_CREDENTIALS.accounts[0].email, password: 'khong-phai-mat-khau',
    });
    expect(r.ok).toBe(false);
  });
});
