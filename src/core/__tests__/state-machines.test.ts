import { describe, expect, it } from 'vitest';
import {
  bookingState,
  canPublishService,
  merchantState,
  serviceState,
  voucherState,
} from '../state-machines';

describe('Xét duyệt Merchant', () => {
  it('luồng đầy đủ draft → submitted → under_review → approved', () => {
    expect(merchantState.can('draft', 'submitted')).toBe(true);
    expect(merchantState.can('submitted', 'under_review')).toBe(true);
    expect(merchantState.can('under_review', 'approved')).toBe(true);
  });

  it('yêu cầu bổ sung rồi nộp lại', () => {
    expect(merchantState.can('under_review', 'changes_requested')).toBe(true);
    expect(merchantState.can('changes_requested', 'submitted')).toBe(true);
  });

  it('KHÔNG được duyệt thẳng từ draft', () => {
    expect(merchantState.can('draft', 'approved')).toBe(false);
    expect(() => merchantState.assert('draft', 'approved')).toThrow(/không hợp lệ/);
  });

  it('có thể đình chỉ merchant đã duyệt và khôi phục lại', () => {
    expect(merchantState.can('approved', 'suspended')).toBe(true);
    expect(merchantState.can('suspended', 'approved')).toBe(true);
  });
});

describe('Xét duyệt dịch vụ', () => {
  it('phải qua duyệt mới được active', () => {
    expect(serviceState.can('draft', 'active')).toBe(false);
    expect(serviceState.can('under_review', 'approved')).toBe(true);
    expect(serviceState.can('approved', 'active')).toBe(true);
  });

  it('sửa dịch vụ đang chạy phải nộp duyệt lại', () => {
    expect(serviceState.can('active', 'submitted')).toBe(true);
  });

  it('dịch vụ bị đình chỉ không tự bật lại được', () => {
    expect(serviceState.can('suspended', 'active')).toBe(false);
    expect(serviceState.can('suspended', 'inactive')).toBe(true);
  });
});

describe('Merchant chưa duyệt thì dịch vụ không được công khai', () => {
  it('merchant approved + service active → công khai', () => {
    expect(canPublishService('approved', 'active')).toBe(true);
  });

  it('merchant chưa duyệt thì dù dịch vụ active vẫn không công khai', () => {
    expect(canPublishService('under_review', 'active')).toBe(false);
    expect(canPublishService('submitted', 'active')).toBe(false);
    expect(canPublishService('draft', 'active')).toBe(false);
  });

  it('merchant bị đình chỉ thì dịch vụ tắt theo', () => {
    expect(canPublishService('suspended', 'active')).toBe(false);
  });
});

describe('Booking', () => {
  it('luồng thành công', () => {
    expect(bookingState.can('draft', 'pending_payment')).toBe(true);
    expect(bookingState.can('pending_payment', 'paid')).toBe(true);
    expect(bookingState.can('paid', 'confirmed')).toBe(true);
    expect(bookingState.can('confirmed', 'completed')).toBe(true);
  });

  it('không được hoàn thành khi chưa thanh toán', () => {
    expect(bookingState.can('pending_payment', 'completed')).toBe(false);
  });

  it('đơn đã hoàn tiền là trạng thái cuối', () => {
    expect(bookingState.can('refunded', 'paid')).toBe(false);
    expect(bookingState.can('refunded', 'completed')).toBe(false);
  });

  it('đơn đã hoàn thành vẫn hoàn tiền được (khiếu nại sau)', () => {
    expect(bookingState.can('completed', 'refunded')).toBe(true);
  });
});

describe('Voucher chỉ dùng được một lần', () => {
  it('confirmed → redeemed hợp lệ', () => {
    expect(voucherState.can('confirmed', 'redeemed')).toBe(true);
  });

  it('redeemed KHÔNG quay lại confirmed — chặn quét trùng', () => {
    expect(voucherState.can('redeemed', 'confirmed')).toBe(false);
    expect(voucherState.can('redeemed', 'redeemed')).toBe(false);
    expect(() => voucherState.assert('redeemed', 'redeemed')).toThrow(/không hợp lệ/);
  });

  it('voucher hết hạn hoặc đã huỷ không redeem được', () => {
    expect(voucherState.can('expired', 'redeemed')).toBe(false);
    expect(voucherState.can('cancelled', 'redeemed')).toBe(false);
  });

  it('chưa confirmed thì chưa redeem được', () => {
    expect(voucherState.can('issued', 'redeemed')).toBe(false);
  });
});
