import { beforeEach, describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import {
  CatalogError, __resetCatalog, addBlackoutDate, createServiceDraft, generateAvailability,
  getServiceBySlug, holdSeats, listAvailability, listCategories, listServices, releaseSeats,
  setCategoryActive, setDayCapacity, setServiceStatus, toggleDayClosed, updateService,
  upsertCategory,
} from '../catalog-store';

const MERCHANT = 'e0000000-0000-4000-8000-000000000001';
const OTHER = 'merchant-khac';
const usd = (v: number) => fromMajorUnits(v, 'USD');

const draft = (over: Partial<Parameters<typeof createServiceDraft>[0]> = {}) =>
  createServiceDraft({
    merchantId: MERCHANT,
    titleVi: 'Tour thuyền gỗ dhow buổi tối',
    titleEn: 'Evening Dhow Cruise',
    summaryVi: 'Du thuyền gỗ truyền thống dọc Dubai Creek kèm bữa tối buffet.',
    summaryEn: 'Traditional wooden dhow along Dubai Creek with buffet dinner.',
    descriptionVi: 'Hải trình 2 giờ trên thuyền dhow hai tầng dọc Dubai Creek.',
    descriptionEn: 'A two-hour cruise on a double-deck dhow along Dubai Creek.',
    categorySlug: 'yacht-cruise',
    city: 'Dubai',
    meetingPoint: 'Bến Dubai Creek, cổng số 2',
    durationMinutes: 120,
    languages: ['en', 'vi'],
    minGuests: 1, maxGuests: 60,
    priceAdult: usd(180), priceChild: usd(120),
    taxRateBps: 500,
    instantConfirmation: true, freeCancellation: true, pickupAvailable: false,
    bookingCutoffHours: 12,
    highlightsVi: ['Thuyền gỗ truyền thống', 'Bữa tối buffet', 'Nhạc sống'],
    includedVi: ['Bữa tối buffet', 'Nước uống'],
    excludedVi: ['Đưa đón', 'Đồ uống có cồn'],
    cancellationText: 'Huỷ miễn phí trước 24 giờ.',
    ...over,
  });

beforeEach(() => { __resetCatalog(); });

describe('Danh mục', () => {
  it('khởi tạo đủ 20 danh mục', () => {
    expect(listCategories()).toHaveLength(20);
  });

  it('Admin thêm được danh mục mới', () => {
    upsertCategory({ slug: 'spa-wellness', nameVi: 'Spa & chăm sóc sức khoẻ', nameEn: 'Spa & Wellness', isActive: true, sortOrder: 21 });
    expect(listCategories().some((c) => c.slug === 'spa-wellness')).toBe(true);
  });

  it('Admin sửa được tên danh mục có sẵn', () => {
    upsertCategory({ slug: 'desert-safari', nameVi: 'Safari sa mạc & cồn cát', nameEn: 'Desert Safari', isActive: true, sortOrder: 9 });
    expect(listCategories().find((c) => c.slug === 'desert-safari')?.name.vi).toBe('Safari sa mạc & cồn cát');
  });

  it('KHÔNG tắt được danh mục đang có dịch vụ bán', () => {
    expect(() => setCategoryActive('desert-safari', false)).toThrow(/đang có dịch vụ bán/);
  });

  it('tắt được danh mục rỗng', () => {
    expect(setCategoryActive('sim-esim', false).isActive).toBe(false);
  });
});

describe('Đối tác tạo dịch vụ', () => {
  it('tạo ở trạng thái nháp, chưa công khai', () => {
    const s = draft();
    expect(s.status).toBe('draft');
  });

  it('sinh slug từ tên, không trùng nhau', () => {
    const a = draft();
    const b = draft();
    expect(a.slug).toBe('evening-dhow-cruise');
    expect(b.slug).toBe('evening-dhow-cruise-2');
  });

  it('slug bỏ dấu tiếng Việt', () => {
    const s = draft({ titleEn: '', titleVi: 'Tour Đảo Cọ buổi chiều' });
    expect(s.slug).toBe('tour-dao-co-buoi-chieu');
  });

  it('từ chối danh mục không tồn tại', () => {
    expect(() => draft({ categorySlug: 'khong-co-that' })).toThrow(/Danh mục không tồn tại/);
  });

  it('từ chối giá 0 hoặc âm', () => {
    expect(() => draft({ priceAdult: usd(0) })).toThrow(/lớn hơn 0/);
  });

  it('từ chối số khách tối đa nhỏ hơn tối thiểu', () => {
    expect(() => draft({ minGuests: 5, maxGuests: 2 })).toThrow(/lớn hơn hoặc bằng/);
  });

  it('dịch vụ nháp KHÔNG hiện trên sàn', () => {
    const s = draft();
    expect(getServiceBySlug(s.slug)?.status).toBe('draft');
  });
});

describe('Đối tác sửa dịch vụ', () => {
  it('sửa được nội dung của mình', () => {
    const s = draft();
    const sau = updateService(s.id, MERCHANT, { titleVi: 'Tên mới', priceAdult: usd(200) });
    expect(sau.i18n.vi.title).toBe('Tên mới');
    expect(sau.packages[0].priceAdult).toEqual(usd(200));
  });

  it('KHÔNG sửa được dịch vụ của đối tác khác', () => {
    const s = draft();
    expect(() => updateService(s.id, OTHER, { titleVi: 'Chiếm quyền' }))
      .toThrow(/không thuộc đơn vị của bạn/);
  });

  it('sửa dịch vụ ĐANG BÁN thì tự chuyển sang chờ duyệt lại', () => {
    const s = draft();
    setServiceStatus(s.id, 'submitted');
    setServiceStatus(s.id, 'under_review');
    setServiceStatus(s.id, 'approved');
    setServiceStatus(s.id, 'active');
    expect(updateService(s.id, MERCHANT, { titleVi: 'Đổi tên' }).status).toBe('submitted');
  });

  it('sửa dịch vụ nháp thì vẫn là nháp', () => {
    const s = draft();
    expect(updateService(s.id, MERCHANT, { titleVi: 'Đổi tên' }).status).toBe('draft');
  });

  it('dịch vụ không tồn tại báo lỗi rõ ràng', () => {
    expect(() => updateService('khong-co', MERCHANT, {})).toThrow(CatalogError);
  });
});

describe('Lịch và tồn kho', () => {
  it('bật bán thì tự sinh lịch 90 ngày', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const from = new Date(); from.setDate(from.getDate() + 1);
    const to = new Date(); to.setDate(to.getDate() + 90);
    const days = listAvailability(s.id, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10));
    expect(days.length).toBe(90);
  });

  it('sinh thêm lịch không tạo trùng ngày', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    expect(generateAvailability(s.id, 90, 20)).toBe(0);
    expect(generateAvailability(s.id, 120, 20)).toBe(30);
  });

  it('đổi được sức chứa từng ngày', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const date = listAvailability(s.id, '2000-01-01', '2099-12-31')[0].date;
    expect(setDayCapacity(s.id, date, 8).capacityTotal).toBe(8);
  });

  it('KHÔNG hạ sức chứa xuống dưới số chỗ đã bán', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const date = listAvailability(s.id, '2000-01-01', '2099-12-31')[0].date;
    holdSeats(s.id, date, 5);
    expect(() => setDayCapacity(s.id, date, 3)).toThrow(/đã có 5 chỗ được giữ/);
  });

  it('đóng được ngày chưa có khách', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const date = listAvailability(s.id, '2000-01-01', '2099-12-31')[0].date;
    expect(toggleDayClosed(s.id, date, true).isClosed).toBe(true);
  });

  it('KHÔNG đóng được ngày đã có khách đặt', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const date = listAvailability(s.id, '2000-01-01', '2099-12-31')[0].date;
    holdSeats(s.id, date, 1);
    expect(() => toggleDayClosed(s.id, date, true)).toThrow(/đã có khách đặt/);
  });

  it('ngày bị chặn không hiện trong lịch', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const truoc = listAvailability(s.id, '2000-01-01', '2099-12-31');
    addBlackoutDate(s.id, truoc[0].date);
    expect(listAvailability(s.id, '2000-01-01', '2099-12-31')).toHaveLength(truoc.length - 1);
  });

  it('KHÔNG chặn được ngày đã có khách đặt', () => {
    const s = draft();
    setServiceStatus(s.id, 'active');
    const date = listAvailability(s.id, '2000-01-01', '2099-12-31')[0].date;
    holdSeats(s.id, date, 2);
    expect(() => addBlackoutDate(s.id, date)).toThrow(/đã có khách đặt/);
  });
});

describe('Giữ chỗ — không bao giờ bán quá', () => {
  const setup = () => {
    const s = draft({ maxGuests: 10 });
    setServiceStatus(s.id, 'active');
    const date = listAvailability(s.id, '2000-01-01', '2099-12-31')[0].date;
    setDayCapacity(s.id, date, 10);
    return { s, date };
  };

  it('giữ trong sức chứa thì được', () => {
    const { s, date } = setup();
    expect(holdSeats(s.id, date, 6)).toBe(true);
    expect(holdSeats(s.id, date, 4)).toBe(true);
  });

  it('giữ vượt sức chứa thì TỪ CHỐI', () => {
    const { s, date } = setup();
    holdSeats(s.id, date, 10);
    expect(holdSeats(s.id, date, 1)).toBe(false);
  });

  it('trả chỗ thì đặt lại được', () => {
    const { s, date } = setup();
    holdSeats(s.id, date, 10);
    releaseSeats(s.id, date, 4);
    expect(holdSeats(s.id, date, 4)).toBe(true);
  });

  it('ngày đã đóng thì không giữ được', () => {
    const { s, date } = setup();
    toggleDayClosed(s.id, date, true);
    expect(holdSeats(s.id, date, 1)).toBe(false);
  });

  it('ngày bị chặn thì không giữ được', () => {
    const { s, date } = setup();
    addBlackoutDate(s.id, date);
    expect(holdSeats(s.id, date, 1)).toBe(false);
  });
});

describe('Lọc theo đối tác', () => {
  it('mỗi đối tác chỉ thấy dịch vụ của mình', () => {
    draft();
    const mine = listServices({ merchantId: MERCHANT });
    const others = listServices({ merchantId: OTHER });
    expect(mine.length).toBeGreaterThan(0);
    expect(others).toHaveLength(0);
  });

  it('lọc theo trạng thái', () => {
    draft();
    expect(listServices({ status: 'draft' }).length).toBeGreaterThan(0);
  });
});
