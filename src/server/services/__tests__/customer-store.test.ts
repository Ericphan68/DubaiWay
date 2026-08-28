import { beforeEach, describe, expect, it } from 'vitest';
import {
  TravelerError, __resetCustomer, addTraveler, countUnread, isFavorite, listFavorites,
  listNotifications, listTravelers, markAllRead, markRead, pushNotification, removeTraveler,
  toggleFavorite,
} from '../customer-store';

const A = 'user-a';
const B = 'user-b';

beforeEach(() => { __resetCustomer(); });

describe('Yêu thích', () => {
  it('bật rồi tắt', () => {
    expect(toggleFavorite(A, 'safari')).toBe(true);
    expect(isFavorite(A, 'safari')).toBe(true);
    expect(toggleFavorite(A, 'safari')).toBe(false);
    expect(isFavorite(A, 'safari')).toBe(false);
  });

  it('yêu thích của người này không lẫn sang người khác', () => {
    toggleFavorite(A, 'safari');
    toggleFavorite(B, 'yacht');
    expect(listFavorites(A)).toEqual(['safari']);
    expect(listFavorites(B)).toEqual(['yacht']);
  });

  it('chưa lưu gì thì danh sách rỗng, không lỗi', () => {
    expect(listFavorites('nguoi-la')).toEqual([]);
    expect(isFavorite('nguoi-la', 'x')).toBe(false);
  });
});

describe('Người đi cùng', () => {
  it('lưu được thông tin cơ bản', () => {
    const t = addTraveler({ userId: A, fullName: 'Nguyễn Văn A', nationality: 'vn' });
    expect(t.fullName).toBe('Nguyễn Văn A');
    expect(t.nationality).toBe('VN');
  });

  it('CHỈ giữ 4 số cuối hộ chiếu, không lưu số đầy đủ', () => {
    const t = addTraveler({ userId: A, fullName: 'Lê Thị Bình', passportNumber: 'C1234567' });
    expect(t.passportLast4).toBe('4567');
    // Không có trường nào chứa số đầy đủ
    expect(JSON.stringify(t)).not.toContain('C1234567');
  });

  it('đặt người liên hệ chính thì bỏ cờ ở người khác', () => {
    addTraveler({ userId: A, fullName: 'Trần Văn X', isPrimary: true });
    addTraveler({ userId: A, fullName: 'Trần Văn Y', isPrimary: true });
    const list = listTravelers(A);
    expect(list.filter((t) => t.isPrimary)).toHaveLength(1);
    expect(list.find((t) => t.isPrimary)?.fullName).toBe('Trần Văn Y');
  });

  it('họ tên quá ngắn bị từ chối', () => {
    expect(() => addTraveler({ userId: A, fullName: 'A' })).toThrow(TravelerError);
  });

  it('giới hạn 20 người', () => {
    for (let i = 0; i < 20; i += 1) addTraveler({ userId: A, fullName: `Người ${i}` });
    expect(() => addTraveler({ userId: A, fullName: 'Người thứ 21' })).toThrow(/tối đa 20/);
  });

  it('xoá được người của mình', () => {
    const t = addTraveler({ userId: A, fullName: 'Phạm Văn X' });
    expect(removeTraveler(A, t.id)).toBe(true);
    expect(listTravelers(A)).toHaveLength(0);
  });

  it('KHÔNG xoá được người của tài khoản khác', () => {
    const t = addTraveler({ userId: A, fullName: 'Phạm Văn X' });
    expect(removeTraveler(B, t.id)).toBe(false);
    expect(listTravelers(A)).toHaveLength(1);
  });

  it('danh sách của mỗi người tách biệt', () => {
    addTraveler({ userId: A, fullName: 'Của A' });
    addTraveler({ userId: B, fullName: 'Của B' });
    expect(listTravelers(A)).toHaveLength(1);
    expect(listTravelers(B)).toHaveLength(1);
  });
});

describe('Thông báo', () => {
  it('thông báo mới là chưa đọc', () => {
    pushNotification({ userId: A, template: 'booking.confirmed', title: 'Đã đặt', body: 'x' });
    expect(countUnread(A)).toBe(1);
  });

  it('mới nhất lên đầu', () => {
    pushNotification({ userId: A, template: 't', title: 'Cũ', body: 'x' });
    pushNotification({ userId: A, template: 't', title: 'Mới', body: 'x' });
    expect(listNotifications(A)[0].title).toBe('Mới');
  });

  it('đánh dấu đã đọc một cái', () => {
    const n = pushNotification({ userId: A, template: 't', title: 'X', body: 'y' });
    expect(markRead(A, n.id)).toBe(true);
    expect(countUnread(A)).toBe(0);
    // Đọc lại lần hai không đổi gì
    expect(markRead(A, n.id)).toBe(false);
  });

  it('KHÔNG đọc hộ thông báo của người khác', () => {
    const n = pushNotification({ userId: A, template: 't', title: 'X', body: 'y' });
    expect(markRead(B, n.id)).toBe(false);
    expect(countUnread(A)).toBe(1);
  });

  it('đánh dấu đã đọc tất cả', () => {
    pushNotification({ userId: A, template: 't', title: '1', body: 'x' });
    pushNotification({ userId: A, template: 't', title: '2', body: 'x' });
    pushNotification({ userId: B, template: 't', title: '3', body: 'x' });
    expect(markAllRead(A)).toBe(2);
    expect(countUnread(A)).toBe(0);
    expect(countUnread(B)).toBe(1);   // của người khác không bị đụng
  });
});
