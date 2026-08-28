/**
 * Nội dung do Admin quản lý: bài viết cẩm nang và banner trang chủ.
 *
 * Bài viết lưu ở dạng Markdown đơn giản (tiêu đề, đoạn văn, danh sách) để Admin
 * soạn được mà không cần trình soạn thảo phức tạp.
 */
import { randomUUID } from 'node:crypto';

export type PostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  readonly id: string;
  slug: string;
  status: PostStatus;
  titleVi: string;
  titleEn: string;
  excerptVi: string;
  excerptEn: string;
  bodyVi: string;
  bodyEn: string;
  categorySlug: string | null;
  coverUrl: string | null;
  authorName: string;
  viewCount: number;
  publishedAt: string | null;
  readonly createdAt: string;
  updatedAt: string;
}

export interface Banner {
  readonly id: string;
  placement: string;
  headlineVi: string;
  headlineEn: string;
  subheadVi: string;
  subheadEn: string;
  ctaLabelVi: string;
  ctaLabelEn: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  readonly createdAt: string;
}

interface ContentState {
  posts: Map<string, BlogPost>;
  banners: Map<string, Banner>;
  seeded: boolean;
}

const g = globalThis as unknown as { __dubaiwayContent?: ContentState };
const state: ContentState = (g.__dubaiwayContent ??= {
  posts: new Map(), banners: new Map(), seeded: false,
});

function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);
}

function seed(): void {
  if (state.seeded) return;
  state.seeded = true;
  const now = new Date().toISOString();

  const posts: Array<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>> = [
    {
      slug: 'chuan-bi-gi-cho-chuyen-dubai-dau-tien',
      status: 'published',
      titleVi: 'Chuẩn bị gì cho chuyến Dubai đầu tiên',
      titleEn: 'What to prepare for your first trip to Dubai',
      excerptVi: 'Visa, thời điểm đi, trang phục, tiền tệ và những điều nên biết trước khi bay.',
      excerptEn: 'Visa, timing, dress code, currency and what to know before you fly.',
      bodyVi: `## Thời điểm nên đi

Tháng 11 đến tháng 3 là mùa đẹp nhất: nhiệt độ 20–28°C, dễ chịu để đi bộ và ra sa mạc. Tháng 6 đến tháng 8 có thể lên 45°C — vẫn đi được nhưng nên chọn hoạt động trong nhà và các tour buổi tối.

## Visa

Hộ chiếu Việt Nam cần xin visa trước khi bay. Visa du lịch 30 ngày là loại phổ biến nhất, xử lý khoảng 3–5 ngày làm việc. Hộ chiếu cần còn hạn ít nhất 6 tháng.

## Trang phục

Dubai thoáng hơn nhiều người nghĩ, nhưng ở nơi công cộng nên che vai và đầu gối. Vào thánh đường bắt buộc trang phục kín; nhiều nơi có cho mượn áo choàng tại chỗ.

## Tiền tệ và thanh toán

Đơn vị là dirham (AED). Thẻ được chấp nhận gần như khắp nơi. Nên đổi ít tiền mặt cho chợ truyền thống và tiền tip.

## Đi lại

Metro sạch, rẻ và đúng giờ, nhưng không tới được mọi nơi. Taxi nhiều và có đồng hồ. Nếu đi theo nhóm, thuê xe riêng thường rẻ hơn nhiều chuyến taxi lẻ.`,
      bodyEn: `## When to go

November to March is the best window: 20–28°C, comfortable for walking and desert trips. June to August can reach 45°C — still doable, but plan indoor activities and evening tours.

## Visa

Vietnamese passport holders need a visa before flying. The 30-day tourist visa is the most common, processed in about 3–5 working days. Your passport must be valid for at least six months.

## Dress code

Dubai is more relaxed than many expect, but cover shoulders and knees in public places. Mosques require modest dress; many provide robes on site.

## Currency and payment

The currency is the dirham (AED). Cards are accepted almost everywhere. Carry some cash for traditional markets and tips.

## Getting around

The metro is clean, cheap and punctual, but does not reach everywhere. Taxis are plentiful and metered. For groups, a private car is often cheaper than several separate taxi rides.`,
      categorySlug: 'dubai-uae-tours',
      coverUrl: null,
      authorName: 'DubaiWay',
      publishedAt: now,
    },
    {
      slug: 'safari-sa-mac-chon-tour-nao',
      status: 'published',
      titleVi: 'Safari sa mạc: chọn tour nào cho đúng',
      titleEn: 'Desert safari: choosing the right tour',
      excerptVi: 'Khác biệt giữa tour ghép và tour riêng, buổi chiều và qua đêm, nên tránh gì.',
      excerptEn: 'Shared versus private, evening versus overnight, and what to avoid.',
      bodyVi: `## Tour ghép hay tour riêng

Tour ghép rẻ hơn nhiều và vẫn đầy đủ hoạt động, nhưng bạn đi chung xe 6 khách và chờ đón nhiều điểm. Tour riêng đắt gấp đôi nhưng chủ động giờ giấc, phù hợp gia đình có trẻ nhỏ hoặc người lớn tuổi.

## Buổi chiều hay qua đêm

Tour chiều là lựa chọn của đa số: khởi hành 15:00, về khoảng 21:30, có lái cồn cát, hoàng hôn và bữa tối. Tour qua đêm thêm phần ngủ lều và ngắm sao — đáng thử nếu bạn có nhiều thời gian.

## Điều nên hỏi trước khi đặt

- Xe đón ở đâu, mất bao lâu tới sa mạc
- Lái cồn cát bao nhiêu phút
- Bữa tối có món chay và halal không
- Có phụ phí gì không (quad bike thường tính riêng)

## Nên tránh

Đừng chọn tour rẻ bất thường. Lái cồn cát cần tài xế có chứng chỉ và xe được bảo dưỡng — đây không phải chỗ để tiết kiệm.`,
      bodyEn: `## Shared or private

Shared tours are much cheaper and still include everything, but you share a 4x4 with up to six guests and wait through several pickups. Private tours cost about double but you control the timing — better for families with small children or older travellers.

## Evening or overnight

The evening tour is what most people choose: departing 15:00, back around 21:30, with dune bashing, sunset and dinner. Overnight tours add camping and stargazing — worth it if you have the time.

## What to ask before booking

- Where the pickup is and how long the drive takes
- How many minutes of dune bashing
- Whether dinner includes vegetarian and halal options
- Any surcharges (quad bikes are usually extra)

## What to avoid

Do not pick an unusually cheap tour. Dune bashing needs a certified driver and a maintained vehicle — this is not the place to save money.`,
      categorySlug: 'desert-safari',
      coverUrl: null,
      authorName: 'DubaiWay',
      publishedAt: now,
    },
    {
      slug: 'burj-khalifa-dat-ve-the-nao',
      status: 'published',
      titleVi: 'Burj Khalifa: đặt vé thế nào cho hợp lý',
      titleEn: 'Burj Khalifa: how to book sensibly',
      excerptVi: 'Chọn tầng nào, khung giờ nào, và vì sao nên đặt trước vài ngày.',
      excerptEn: 'Which level, which time slot, and why booking days ahead matters.',
      bodyVi: `## Tầng 124/125 hay tầng 148

Tầng 124 và 125 có đài quan sát ngoài trời, đủ để thấy toàn cảnh Dubai và là lựa chọn của hầu hết khách. Tầng 148 cao hơn, ít đông hơn, có phục vụ đồ uống — nhưng giá gấp đôi và hoàn toàn trong nhà.

## Khung giờ

Hoàng hôn là khung đẹp nhất và cũng kín chỗ sớm nhất, thường hết trước 3–5 ngày. Nếu không đặt kịp, khung 10:00–12:00 vắng hơn và ánh sáng vẫn tốt để chụp ảnh.

## Lưu ý

Vé đã xuất không hoàn và không đổi ngày. Kiểm tra kỹ ngày giờ trước khi thanh toán.`,
      bodyEn: `## Level 124/125 or level 148

Levels 124 and 125 have the outdoor terrace, enough for the full Dubai panorama, and are what most visitors choose. Level 148 is higher, less crowded and includes refreshments — but costs about double and is entirely indoors.

## Time slots

Sunset is the best and the first to sell out, usually 3–5 days ahead. If you miss it, the 10:00–12:00 window is quieter and the light is still good for photos.

## Note

Issued tickets are non-refundable and cannot be rescheduled. Check the date and time carefully before paying.`,
      categorySlug: 'attraction-tickets',
      coverUrl: null,
      authorName: 'DubaiWay',
      publishedAt: now,
    },
  ];

  for (const p of posts) {
    const id = randomUUID();
    state.posts.set(id, { ...p, id, viewCount: 0, createdAt: now, updatedAt: now });
  }

  state.banners.set('home-1', {
    id: 'home-1',
    placement: 'home_hero',
    headlineVi: 'Khám phá Dubai theo cách của bạn',
    headlineEn: 'Discover Dubai your way',
    subheadVi: 'Tour, vé tham quan, safari sa mạc và du thuyền — đặt một chỗ, nhận một voucher.',
    subheadEn: 'Tours, tickets, desert safaris and yachts — book once, get one voucher.',
    ctaLabelVi: 'Khám phá ngay',
    ctaLabelEn: 'Start exploring',
    linkUrl: '/danh-muc',
    sortOrder: 1,
    isActive: true,
    startsAt: null,
    endsAt: null,
    createdAt: now,
  });
}

export class ContentError extends Error {
  constructor(message: string) { super(message); this.name = 'ContentError'; }
}

// ─── BÀI VIẾT ───────────────────────────────────────────────────────────────
export function listPosts(filter?: { status?: PostStatus }): BlogPost[] {
  seed();
  let all = [...state.posts.values()];
  if (filter?.status) all = all.filter((p) => p.status === filter.status);
  return all.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}

export function getPostBySlug(slug: string): BlogPost | null {
  seed();
  return [...state.posts.values()].find((p) => p.slug === slug) ?? null;
}

export function upsertPost(input: {
  id?: string;
  titleVi: string; titleEn: string;
  excerptVi: string; excerptEn: string;
  bodyVi: string; bodyEn: string;
  categorySlug?: string;
  status: PostStatus;
  authorName: string;
}): BlogPost {
  seed();
  if (input.titleVi.trim().length < 5) throw new ContentError('Tiêu đề tiếng Việt quá ngắn');
  if (input.bodyVi.trim().length < 50) throw new ContentError('Nội dung tiếng Việt cần ít nhất 50 ký tự');

  const now = new Date().toISOString();
  const existing = input.id ? state.posts.get(input.id) : undefined;

  let slug = existing?.slug ?? slugify(input.titleEn || input.titleVi);
  if (!existing) {
    let unique = slug; let n = 2;
    while ([...state.posts.values()].some((p) => p.slug === unique)) { unique = `${slug}-${n}`; n += 1; }
    slug = unique;
  }

  const post: BlogPost = {
    id: existing?.id ?? randomUUID(),
    slug,
    status: input.status,
    titleVi: input.titleVi.trim(),
    titleEn: (input.titleEn || input.titleVi).trim(),
    excerptVi: input.excerptVi.trim(),
    excerptEn: (input.excerptEn || input.excerptVi).trim(),
    bodyVi: input.bodyVi.trim(),
    bodyEn: (input.bodyEn || input.bodyVi).trim(),
    categorySlug: input.categorySlug || null,
    coverUrl: existing?.coverUrl ?? null,
    authorName: input.authorName,
    viewCount: existing?.viewCount ?? 0,
    publishedAt: input.status === 'published' ? (existing?.publishedAt ?? now) : null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  state.posts.set(post.id, post);
  return post;
}

export function setPostStatus(id: string, status: PostStatus): BlogPost {
  seed();
  const p = state.posts.get(id);
  if (!p) throw new ContentError('Không tìm thấy bài viết');
  p.status = status;
  if (status === 'published' && !p.publishedAt) p.publishedAt = new Date().toISOString();
  p.updatedAt = new Date().toISOString();
  return p;
}

export function incrementViews(slug: string): void {
  seed();
  const p = [...state.posts.values()].find((x) => x.slug === slug);
  if (p) p.viewCount += 1;
}

// ─── BANNER ─────────────────────────────────────────────────────────────────
export function listBanners(placement?: string): Banner[] {
  seed();
  const now = new Date();
  return [...state.banners.values()]
    .filter((b) => !placement || b.placement === placement)
    .filter((b) => {
      if (!b.isActive) return placement === undefined;   // Admin vẫn thấy banner đã tắt
      if (b.startsAt && new Date(b.startsAt) > now) return false;
      if (b.endsAt && new Date(b.endsAt) < now) return false;
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function upsertBanner(input: {
  id?: string;
  placement: string;
  headlineVi: string; headlineEn: string;
  subheadVi: string; subheadEn: string;
  ctaLabelVi: string; ctaLabelEn: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string; endsAt?: string;
}): Banner {
  seed();
  if (input.headlineVi.trim().length < 3) throw new ContentError('Tiêu đề banner quá ngắn');
  if (!input.linkUrl.startsWith('/') && !input.linkUrl.startsWith('http')) {
    throw new ContentError('Đường dẫn phải bắt đầu bằng / hoặc http');
  }

  const existing = input.id ? state.banners.get(input.id) : undefined;
  const banner: Banner = {
    id: existing?.id ?? randomUUID(),
    placement: input.placement,
    headlineVi: input.headlineVi.trim(),
    headlineEn: (input.headlineEn || input.headlineVi).trim(),
    subheadVi: input.subheadVi.trim(),
    subheadEn: (input.subheadEn || input.subheadVi).trim(),
    ctaLabelVi: input.ctaLabelVi.trim(),
    ctaLabelEn: (input.ctaLabelEn || input.ctaLabelVi).trim(),
    linkUrl: input.linkUrl.trim(),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  state.banners.set(banner.id, banner);
  return banner;
}

export function setBannerActive(id: string, isActive: boolean): Banner {
  seed();
  const b = state.banners.get(id);
  if (!b) throw new ContentError('Không tìm thấy banner');
  b.isActive = isActive;
  return b;
}

/** Chỉ dùng trong test. */
export function __resetContent(): void {
  state.posts.clear();
  state.banners.clear();
  state.seeded = false;
}
