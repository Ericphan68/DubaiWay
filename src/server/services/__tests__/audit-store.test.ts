import { beforeEach, describe, expect, it } from 'vitest';
import { __resetAudit, listAudit, recordAudit } from '../audit-store';

const actor = { actorId: 'admin-1', actorName: 'Admin', actorRoles: ['super_admin'] };

beforeEach(() => { __resetAudit(); });

describe('Ghi nhật ký', () => {
  it('lưu đủ ai, làm gì, lúc nào, vì sao', () => {
    const e = recordAudit({
      ...actor, action: 'merchant.approve', entityType: 'merchant', entityId: 'm1',
      reason: 'Giấy tờ hợp lệ',
    });
    expect(e.actorId).toBe('admin-1');
    expect(e.action).toBe('merchant.approve');
    expect(e.reason).toBe('Giấy tờ hợp lệ');
    expect(e.createdAt).toBeTruthy();
  });

  it('lưu dữ liệu trước và sau', () => {
    const e = recordAudit({
      ...actor, action: 'service.suspend', entityType: 'service', entityId: 's1',
      beforeData: { status: 'active' }, afterData: { status: 'suspended' },
    });
    expect(e.beforeData).toEqual({ status: 'active' });
    expect(e.afterData).toEqual({ status: 'suspended' });
  });

  it('mới nhất lên đầu', () => {
    recordAudit({ ...actor, action: 'a', entityType: 'x' });
    recordAudit({ ...actor, action: 'b', entityType: 'x' });
    expect(listAudit()[0].action).toBe('b');
  });
});

describe('KHÔNG ghi dữ liệu nhạy cảm', () => {
  it('ẩn mật khẩu và token', () => {
    const e = recordAudit({
      ...actor, action: 'user.update', entityType: 'user',
      afterData: { email: 'a@b.test', password: 'MatKhauThat123', accessToken: 'abc123' },
    });
    expect(e.afterData?.password).toBe('[đã ẩn]');
    expect(e.afterData?.accessToken).toBe('[đã ẩn]');
    expect(e.afterData?.email).toBe('a@b.test');
  });

  it('ẩn số hộ chiếu và số tài khoản ngân hàng', () => {
    const e = recordAudit({
      ...actor, action: 'merchant.update', entityType: 'merchant',
      afterData: { passportNumber: 'C1234567', iban: 'AE07033...', bankName: 'Emirates NBD' },
    });
    expect(e.afterData?.passportNumber).toBe('[đã ẩn]');
    expect(e.afterData?.iban).toBe('[đã ẩn]');
    expect(e.afterData?.bankName).toBe('Emirates NBD');
  });

  it('ẩn cả trong object lồng nhau', () => {
    const e = recordAudit({
      ...actor, action: 'x', entityType: 'y',
      afterData: { profile: { name: 'A', cardNumber: '4242424242424242' } },
    });
    const profile = e.afterData?.profile as Record<string, unknown>;
    expect(profile.cardNumber).toBe('[đã ẩn]');
    expect(profile.name).toBe('A');
  });
});

describe('Nhật ký chỉ thêm, không sửa được', () => {
  it('module không export hàm sửa hoặc xoá bản ghi', async () => {
    const mod = await import('../audit-store');
    const names = Object.keys(mod);
    expect(names).not.toContain('updateAudit');
    expect(names).not.toContain('deleteAudit');
    expect(names).not.toContain('removeAudit');
    expect(names).not.toContain('editAudit');
  });
});

describe('Lọc nhật ký', () => {
  it('lọc theo loại đối tượng và người thực hiện', () => {
    recordAudit({ ...actor, action: 'merchant.approve', entityType: 'merchant', entityId: 'm1' });
    recordAudit({ ...actor, actorId: 'admin-2', action: 'service.approve', entityType: 'service', entityId: 's1' });
    expect(listAudit({ entityType: 'merchant' })).toHaveLength(1);
    expect(listAudit({ actorId: 'admin-2' })).toHaveLength(1);
  });

  it('lọc theo đối tượng cụ thể', () => {
    recordAudit({ ...actor, action: 'a', entityType: 'merchant', entityId: 'm1' });
    recordAudit({ ...actor, action: 'b', entityType: 'merchant', entityId: 'm2' });
    expect(listAudit({ entityId: 'm1' })).toHaveLength(1);
  });
});
