import { beforeEach, describe, expect, it } from 'vitest';
import {
  ContentError, __resetContent, getPostBySlug, incrementViews, listBanners, listPosts,
  setBannerActive, setPostStatus, upsertBanner, upsertPost,
} from '../content-store';

const author = 'DubaiWay Admin';

const validPost = (over: Partial<Parameters<typeof upsertPost>[0]> = {}) => ({
  titleVi: 'Kinh nghiệm đi Dubai mùa hè',
  titleEn: 'Visiting Dubai in summer',
  excerptVi: 'Nắng nóng nhưng vẫn đi được nếu biết cách sắp lịch.',
  excerptEn: 'Hot, but manageable if you plan the day right.',
  bodyVi: 'Nhiệt độ tháng 7 có thể lên 45 độ. Nên chọn hoạt động trong nhà buổi trưa và ra ngoài sau 17 giờ.',
  bodyEn: 'July temperatures can reach 45C. Plan indoor activities at midday and go out after 17:00.',
  status: 'draft' as const,
  authorName: author,
  ...over,
});

beforeEach(() => { __resetContent(); });

describe('Bài viết khởi tạo', () => {
  it('có sẵn 3 bài đã đăng', () => {
    expect(listPosts({ status: 'published' })).toHaveLength(3);
  });

  it('bài khởi tạo có nội dung cả tiếng Việt và tiếng Anh', () => {
    for (const p of listPosts()) {
      expect(p.titleVi.length).toBeGreaterThan(5);
      expect(p.titleEn.length).toBeGreaterThan(5);
      expect(p.bodyVi.length).toBeGreaterThan(50);
      expect(p.bodyEn.length).toBeGreaterThan(50);
    }
  });

  it('không có nội dung lorem ipsum', () => {
    const text = listPosts().map((p) => p.bodyVi + p.bodyEn).join(' ').toLowerCase();
    expect(text).not.toContain('lorem');
    expect(text).not.toContain('ipsum');
  });
});

describe('Soạn bài viết', () => {
  it('tạo bài mới ở dạng nháp, chưa hiện công khai', () => {
    const p = upsertPost(validPost());
    expect(p.status).toBe('draft');
    expect(p.publishedAt).toBeNull();
    expect(listPosts({ status: 'published' }).some((x) => x.id === p.id)).toBe(false);
  });

  it('sinh slug từ tiêu đề, không trùng nhau', () => {
    const a = upsertPost(validPost());
    const b = upsertPost(validPost());
    expect(a.slug).toBe('visiting-dubai-in-summer');
    expect(b.slug).toBe('visiting-dubai-in-summer-2');
  });

  it('đăng bài thì có mốc thời gian đăng', () => {
    const p = upsertPost(validPost({ status: 'published' }));
    expect(p.publishedAt).toBeTruthy();
  });

  it('sửa bài giữ nguyên slug và lượt xem', () => {
    const p = upsertPost(validPost({ status: 'published' }));
    incrementViews(p.slug);
    incrementViews(p.slug);
    const sau = upsertPost(validPost({ id: p.id, titleVi: 'Tiêu đề đã đổi' }));
    expect(sau.slug).toBe(p.slug);
    expect(sau.viewCount).toBe(2);
    expect(sau.titleVi).toBe('Tiêu đề đã đổi');
  });

  it('tiêu đề quá ngắn bị từ chối', () => {
    expect(() => upsertPost(validPost({ titleVi: 'ABC' }))).toThrow(/quá ngắn/);
  });

  it('nội dung quá ngắn bị từ chối', () => {
    expect(() => upsertPost(validPost({ bodyVi: 'ngắn' }))).toThrow(/ít nhất 50 ký tự/);
  });

  it('thiếu bản tiếng Anh thì dùng tạm bản tiếng Việt, không để trống', () => {
    const p = upsertPost(validPost({ titleEn: '', bodyEn: '', excerptEn: '' }));
    expect(p.titleEn).toBe(p.titleVi);
    expect(p.bodyEn).toBe(p.bodyVi);
  });
});

describe('Đăng và gỡ bài', () => {
  it('gỡ bài đã đăng thì không còn hiện công khai', () => {
    const p = upsertPost(validPost({ status: 'published' }));
    setPostStatus(p.id, 'draft');
    expect(listPosts({ status: 'published' }).some((x) => x.id === p.id)).toBe(false);
  });

  it('bài không tồn tại báo lỗi', () => {
    expect(() => setPostStatus('khong-co', 'published')).toThrow(ContentError);
  });

  it('tra được bài theo slug', () => {
    const p = upsertPost(validPost({ status: 'published' }));
    expect(getPostBySlug(p.slug)?.id).toBe(p.id);
    expect(getPostBySlug('khong-co')).toBeNull();
  });
});

describe('Banner', () => {
  it('có sẵn banner trang chủ', () => {
    expect(listBanners('home_hero')).toHaveLength(1);
  });

  it('tạo banner mới', () => {
    const b = upsertBanner({
      placement: 'category_top',
      headlineVi: 'Ưu đãi mùa hè', headlineEn: 'Summer offers',
      subheadVi: 'Giảm tới 15%', subheadEn: 'Up to 15% off',
      ctaLabelVi: 'Xem ngay', ctaLabelEn: 'See offers',
      linkUrl: '/uu-dai', sortOrder: 1, isActive: true,
    });
    expect(b.placement).toBe('category_top');
  });

  it('đường dẫn sai định dạng bị từ chối', () => {
    expect(() => upsertBanner({
      placement: 'home_hero', headlineVi: 'Test', headlineEn: 'Test',
      subheadVi: '', subheadEn: '', ctaLabelVi: 'X', ctaLabelEn: 'X',
      linkUrl: 'danh-muc', sortOrder: 1, isActive: true,
    })).toThrow(/bắt đầu bằng/);
  });

  it('banner đã tắt không hiện ở vị trí công khai', () => {
    const b = listBanners('home_hero')[0];
    setBannerActive(b.id, false);
    expect(listBanners('home_hero')).toHaveLength(0);
  });

  it('banner hết hạn không hiện', () => {
    const b = upsertBanner({
      placement: 'checkout_side', headlineVi: 'Hết hạn', headlineEn: 'Expired',
      subheadVi: '', subheadEn: '', ctaLabelVi: 'X', ctaLabelEn: 'X',
      linkUrl: '/uu-dai', sortOrder: 1, isActive: true,
      endsAt: new Date(Date.now() - 86_400_000).toISOString(),
    });
    expect(listBanners('checkout_side').some((x) => x.id === b.id)).toBe(false);
  });

  it('banner chưa tới ngày không hiện', () => {
    const b = upsertBanner({
      placement: 'checkout_side', headlineVi: 'Sắp tới', headlineEn: 'Upcoming',
      subheadVi: '', subheadEn: '', ctaLabelVi: 'X', ctaLabelEn: 'X',
      linkUrl: '/uu-dai', sortOrder: 1, isActive: true,
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    expect(listBanners('checkout_side').some((x) => x.id === b.id)).toBe(false);
  });
});
