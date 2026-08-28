import { beforeEach, describe, expect, it } from 'vitest';
import {
  MerchantReviewError, __resetMerchants, getMerchant, listHistory, listMerchants,
  listServices, transitionMerchant, transitionService,
} from '../merchant-store';
import { __resetCatalog } from '../catalog-store';

const APPROVED = 'e0000000-0000-4000-8000-000000000001';
const PENDING  = 'e0000000-0000-4000-8000-000000000002';
const REVIEWER = 'a0000000-0000-4000-8000-000000000003';
const SERVICE_ACTIVE  = 'f0000000-0000-4000-8000-000000000001';
const SERVICE_PENDING = 'f0000000-0000-4000-8000-000000000007';

// Dịch vụ nằm ở catalog-store nên phải reset cả hai kho.
beforeEach(() => { __resetMerchants(); __resetCatalog(); });

describe('Dữ liệu khởi tạo', () => {
  it('có merchant doanh nghiệp đã duyệt và cá nhân chờ duyệt', () => {
    const ms = listMerchants();
    expect(ms).toHaveLength(2);
    expect(ms.find((m) => m.kind === 'business')?.status).toBe('approved');
    expect(ms.find((m) => m.kind === 'individual')?.status).toBe('under_review');
  });

  it('merchant cá nhân có giấy tờ KYC chờ xác minh', () => {
    const m = getMerchant(PENDING);
    expect(m?.documents.map((d) => d.docType)).toContain('passport');
    expect(m?.documents.every((d) => d.status === 'pending')).toBe(true);
  });

  it('có dịch vụ đang chờ duyệt để thử luồng', () => {
    expect(listServices().find((s) => s.id === SERVICE_PENDING)?.status).toBe('under_review');
  });
});

describe('Xét duyệt merchant', () => {
  it('duyệt hồ sơ đang under_review', () => {
    const m = transitionMerchant(PENDING, 'approved', REVIEWER, 'Giấy tờ hợp lệ');
    expect(m.status).toBe('approved');
    expect(m.approvedAt).toBeTruthy();
  });

  it('yêu cầu bổ sung rồi merchant nộp lại', () => {
    transitionMerchant(PENDING, 'changes_requested', REVIEWER, 'Thiếu giấy phép hành nghề');
    expect(getMerchant(PENDING)?.status).toBe('changes_requested');
    transitionMerchant(PENDING, 'submitted', REVIEWER);
    expect(getMerchant(PENDING)?.status).toBe('submitted');
  });

  it('từ chối có ghi lý do', () => {
    const m = transitionMerchant(PENDING, 'rejected', REVIEWER, 'Giấy phép hết hạn');
    expect(m.status).toBe('rejected');
    expect(m.rejectionReason).toBe('Giấy phép hết hạn');
  });

  it('KHÔNG duyệt được hồ sơ ở trạng thái không cho phép', () => {
    transitionMerchant(PENDING, 'approved', REVIEWER);
    expect(() => transitionMerchant(PENDING, 'approved', REVIEWER)).toThrow(/không hợp lệ/);
  });

  it('hồ sơ không tồn tại báo lỗi rõ ràng', () => {
    expect(() => transitionMerchant('khong-co-that', 'approved', REVIEWER)).toThrow(MerchantReviewError);
  });

  it('mọi lần duyệt đều ghi lịch sử: ai, lúc nào, vì sao', () => {
    transitionMerchant(PENDING, 'approved', REVIEWER, 'Đã kiểm tra hộ chiếu');
    const h = listHistory(PENDING);
    expect(h).toHaveLength(1);
    expect(h[0].reviewerId).toBe(REVIEWER);
    expect(h[0].reason).toBe('Đã kiểm tra hộ chiếu');
    expect(h[0].fromStatus).toBe('under_review');
    expect(h[0].toStatus).toBe('approved');
  });
});

describe('Đình chỉ merchant thì dịch vụ ngừng công khai', () => {
  it('đình chỉ merchant → mọi dịch vụ active chuyển sang inactive', () => {
    const before = listServices(APPROVED).filter((s) => s.status === 'active');
    expect(before.length).toBeGreaterThan(0);

    transitionMerchant(APPROVED, 'suspended', REVIEWER, 'Nhiều khiếu nại chưa xử lý');

    const after = listServices(APPROVED).filter((s) => s.status === 'active');
    expect(after).toHaveLength(0);
  });

  it('việc tắt dịch vụ theo cũng được ghi vào lịch sử', () => {
    transitionMerchant(APPROVED, 'suspended', REVIEWER, 'Kiểm tra');
    const h = listHistory(SERVICE_ACTIVE);
    expect(h.some((x) => x.toStatus === 'inactive' && x.reason?.includes('suspended'))).toBe(true);
  });
});

describe('Xét duyệt dịch vụ', () => {
  it('duyệt rồi mới bật được', () => {
    transitionService(SERVICE_PENDING, 'approved', REVIEWER);
    const s = transitionService(SERVICE_PENDING, 'active', REVIEWER);
    expect(s.status).toBe('active');
  });

  it('KHÔNG bật thẳng dịch vụ chưa duyệt', () => {
    expect(() => transitionService(SERVICE_PENDING, 'active', REVIEWER)).toThrow(/không hợp lệ/);
  });

  it('KHÔNG công khai được dịch vụ khi merchant chưa duyệt', () => {
    transitionMerchant(APPROVED, 'suspended', REVIEWER, 'tạm dừng');
    transitionService(SERVICE_PENDING, 'approved', REVIEWER);
    expect(() => transitionService(SERVICE_PENDING, 'active', REVIEWER))
      .toThrow(/chưa được duyệt hoặc đang bị đình chỉ/);
  });

  it('dịch vụ đang chạy sửa lớn thì phải nộp duyệt lại', () => {
    const s = transitionService(SERVICE_ACTIVE, 'submitted', REVIEWER, 'Đổi giá và lịch trình');
    expect(s.status).toBe('submitted');
  });

  it('lịch sử duyệt dịch vụ ghi đủ thông tin', () => {
    transitionService(SERVICE_PENDING, 'approved', REVIEWER, 'Nội dung đầy đủ, ảnh rõ ràng');
    const h = listHistory(SERVICE_PENDING);
    expect(h[0].reviewerId).toBe(REVIEWER);
    expect(h[0].reason).toBe('Nội dung đầy đủ, ảnh rõ ràng');
  });
});
