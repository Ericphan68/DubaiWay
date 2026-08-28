/**
 * Kho danh mục và dịch vụ có thể ghi.
 *
 * Đây là nguồn sự thật cho cả hai phía: đối tác tạo/sửa dịch vụ ở đây, và trang
 * công khai đọc cũng từ đây. Nhờ vậy dịch vụ đối tác vừa tạo hiện ngay trên sàn
 * sau khi được duyệt — không phải hai kho dữ liệu rời nhau.
 *
 * Khởi tạo từ MEMORY_SERVICES (phản chiếu supabase/seed.sql). Khi chuyển sang
 * Supabase, thay bằng lệnh ghi database — interface không đổi.
 */
import { randomUUID } from 'node:crypto';
import { fromMajorUnits, type Money } from '@/core/money';
import type { ServiceStatus } from '@/core/state-machines';
import { MEMORY_CATEGORIES, MEMORY_SERVICES } from '@/server/repositories/memory/data';
import type { ServiceDetail, ServicePackageSummary } from '@/server/repositories/types';

export interface EditableService {
  id: string;
  merchantId: string;
  slug: string;
  categorySlug: string;
  status: ServiceStatus;
  city: string | null;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  meetingPoint: string | null;
  pickupAvailable: boolean;
  durationMinutes: number | null;
  languages: string[];
  minGuests: number;
  maxGuests: number | null;
  instantConfirmation: boolean;
  freeCancellation: boolean;
  bookingCutoffHours: number;
  guestRequirements: string | null;
  healthRequirements: string | null;
  usageTerms: string | null;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  bookingCount: number;
  coverImageUrl: string | null;
  media: { url: string; kind: 'image' | 'video'; altText: string | null }[];
  itinerary: { dayNumber: number; title: string; description: string | null; startTime: string | null }[];
  packages: ServicePackageSummary[];
  policies: ServiceDetail['policies'];
  i18n: Record<'vi' | 'en', {
    title: string; summary: string; description: string;
    highlights: string[]; included: string[]; excluded: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EditableCategory {
  id: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  name: Record<'vi' | 'en', string>;
}

/** Một ngày mở bán của dịch vụ. */
export interface AvailabilityDay {
  id: string;
  serviceId: string;
  packageId: string | null;
  date: string;
  startTime: string | null;
  capacityTotal: number;
  capacityReserved: number;
  isClosed: boolean;
}

interface CatalogState {
  services: Map<string, EditableService>;
  categories: Map<string, EditableCategory>;
  availability: Map<string, AvailabilityDay>;
  blackout: Set<string>;              // `${serviceId}:${date}`
  seeded: boolean;
}

const g = globalThis as unknown as { __dubaiwayCatalog?: CatalogState };
const state: CatalogState = (g.__dubaiwayCatalog ??= {
  services: new Map(),
  categories: new Map(),
  availability: new Map(),
  blackout: new Set(),
  seeded: false,
});

const DEFAULT_MERCHANT = 'e0000000-0000-4000-8000-000000000001';

function seed(): void {
  if (state.seeded) return;
  state.seeded = true;
  const now = new Date().toISOString();

  for (const [i, c] of MEMORY_CATEGORIES.entries()) {
    state.categories.set(c.slug, {
      id: c.id, slug: c.slug, isActive: true, sortOrder: i + 1,
      name: { vi: c.vi, en: c.en },
    });
  }

  for (const s of MEMORY_SERVICES) {
    state.services.set(s.id, {
      id: s.id,
      merchantId: s.merchant.id,
      slug: s.slug,
      categorySlug: s.categorySlug,
      status: 'active',
      city: s.city, country: s.country,
      address: s.address, latitude: s.latitude, longitude: s.longitude,
      meetingPoint: s.meetingPoint, pickupAvailable: s.pickupAvailable,
      durationMinutes: s.durationMinutes, languages: [...s.languages],
      minGuests: s.minGuests, maxGuests: s.maxGuests,
      instantConfirmation: s.instantConfirmation,
      freeCancellation: s.freeCancellation,
      bookingCutoffHours: s.bookingCutoffHours,
      guestRequirements: s.guestRequirements,
      healthRequirements: s.healthRequirements,
      usageTerms: s.usageTerms,
      isFeatured: s.isFeatured,
      ratingAvg: s.ratingAvg, ratingCount: s.ratingCount, bookingCount: s.bookingCount,
      coverImageUrl: s.coverImageUrl,
      media: [...s.media], itinerary: [...s.itinerary],
      packages: s.packages.map((p) => ({ ...p })),
      policies: s.policies,
      i18n: {
        vi: { ...s.i18n.vi, highlights: [...s.i18n.vi.highlights], included: [...s.i18n.vi.included], excluded: [...s.i18n.vi.excluded] },
        en: { ...s.i18n.en, highlights: [...s.i18n.en.highlights], included: [...s.i18n.en.included], excluded: [...s.i18n.en.excluded] },
      },
      createdAt: now, updatedAt: now,
    });
  }

  // Một dịch vụ đang chờ duyệt, để thử luồng xét duyệt từ đầu tới cuối.
  const pendingId = 'f0000000-0000-4000-8000-000000000007';
  state.services.set(pendingId, {
    id: pendingId, merchantId: DEFAULT_MERCHANT,
    slug: 'hot-air-balloon-sunrise', categorySlug: 'day-tours', status: 'under_review',
    city: 'Dubai', country: 'AE',
    address: 'Margham Desert', latitude: 24.9142, longitude: 55.6431,
    meetingPoint: 'Đón tại khách sạn lúc 04:00',
    pickupAvailable: true, durationMinutes: 300, languages: ['en', 'ar'],
    minGuests: 1, maxGuests: 20, instantConfirmation: false, freeCancellation: true,
    bookingCutoffHours: 48,
    guestRequirements: 'Không phù hợp với trẻ dưới 5 tuổi và phụ nữ mang thai.',
    healthRequirements: null, usageTerms: null, isFeatured: false,
    ratingAvg: 0, ratingCount: 0, bookingCount: 0, coverImageUrl: null,
    media: [], itinerary: [],
    packages: [{
      id: 'p10', code: 'standard', name: 'Tiêu chuẩn',
      description: 'Bay 1 giờ, ăn sáng tại trại sa mạc',
      priceAdult: fromMajorUnits(1095, 'AED'), priceChild: fromMajorUnits(895, 'AED'),
      priceGroup: null, groupSize: null, taxRateBps: 500, minGuests: 1, maxGuests: 20,
    }],
    policies: {
      cancellationText: 'Huỷ miễn phí trước 48 giờ. Thời tiết xấu được đổi lịch miễn phí.',
      cancellationTiers: [{ hoursBefore: 48, refundBps: 10000 }],
      rescheduleAllowed: true, refundText: null, disputeWindowHours: 72,
    },
    i18n: {
      vi: {
        title: 'Khinh khí cầu ngắm bình minh sa mạc',
        summary: 'Bay khinh khí cầu lúc bình minh trên sa mạc Margham, kèm bữa sáng tại trại Bedouin.',
        description: 'Xe đón tại khách sạn lúc 04:00, đi khoảng 60 phút tới bãi cất cánh Margham. Chuyến bay kéo dài khoảng 1 giờ, độ cao tối đa 1.200 m, nhìn toàn cảnh sa mạc lúc mặt trời lên. Sau khi hạ cánh có bữa sáng nóng tại trại Bedouin và chứng nhận bay. Về tới khách sạn khoảng 09:00.',
        highlights: ['Bay 1 giờ lúc bình minh', 'Phi công có chứng chỉ UAE GCAA', 'Bữa sáng nóng tại trại Bedouin', 'Chứng nhận bay kỷ niệm'],
        included: ['Đón trả tại khách sạn', 'Chuyến bay khinh khí cầu 1 giờ', 'Bữa sáng', 'Bảo hiểm', 'Chứng nhận bay'],
        excluded: ['Tiền tip', 'Ảnh chuyên nghiệp (phụ phí)'],
      },
      en: {
        title: 'Sunrise Hot Air Balloon over the Desert',
        summary: 'A dawn balloon flight over the Margham desert with breakfast at a Bedouin camp.',
        description: 'Hotel pickup at 04:00 for the 60-minute drive to the Margham launch site. The flight lasts about an hour, reaching 1,200 m, with panoramic desert views at sunrise. After landing there is a hot breakfast at a Bedouin camp and a flight certificate. Back at your hotel around 09:00.',
        highlights: ['One-hour flight at sunrise', 'UAE GCAA-certified pilots', 'Hot breakfast at a Bedouin camp', 'Commemorative flight certificate'],
        included: ['Hotel transfers', 'One-hour balloon flight', 'Breakfast', 'Insurance', 'Flight certificate'],
        excluded: ['Gratuities', 'Professional photos (surcharge)'],
      },
    },
    createdAt: now, updatedAt: now,
  });

  // Sinh lịch 90 ngày cho các dịch vụ đang bán.
  for (const s of state.services.values()) {
    if (s.status !== 'active') continue;
    for (let d = 1; d <= 90; d += 1) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      const iso = date.toISOString().slice(0, 10);
      const id = `${s.id}:${iso}`;
      state.availability.set(id, {
        id, serviceId: s.id, packageId: s.packages[0]?.id ?? null,
        date: iso, startTime: null,
        capacityTotal: s.maxGuests ?? 20,
        capacityReserved: 0,
        isClosed: false,
      });
    }
  }
}

// ─── ĐỌC ────────────────────────────────────────────────────────────────────
export function listCategories(): EditableCategory[] {
  seed();
  return [...state.categories.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategory(slug: string): EditableCategory | null {
  seed();
  return state.categories.get(slug) ?? null;
}

export function listServices(filter?: { merchantId?: string; status?: ServiceStatus }): EditableService[] {
  seed();
  let all = [...state.services.values()];
  if (filter?.merchantId) all = all.filter((s) => s.merchantId === filter.merchantId);
  if (filter?.status) all = all.filter((s) => s.status === filter.status);
  return all.sort((a, b) => a.i18n.vi.title.localeCompare(b.i18n.vi.title));
}

export function getService(id: string): EditableService | null {
  seed();
  return state.services.get(id) ?? null;
}

export function getServiceBySlug(slug: string): EditableService | null {
  seed();
  return [...state.services.values()].find((s) => s.slug === slug) ?? null;
}

export function listAvailability(serviceId: string, from: string, to: string): AvailabilityDay[] {
  seed();
  return [...state.availability.values()]
    .filter((a) => a.serviceId === serviceId && a.date >= from && a.date <= to)
    .filter((a) => !state.blackout.has(`${serviceId}:${a.date}`))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function listBlackoutDates(serviceId: string): string[] {
  seed();
  return [...state.blackout]
    .filter((k) => k.startsWith(`${serviceId}:`))
    .map((k) => k.split(':')[1])
    .sort();
}

// ─── GHI ────────────────────────────────────────────────────────────────────
export class CatalogError extends Error {
  constructor(message: string) { super(message); this.name = 'CatalogError'; }
}

function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export interface ServiceDraftInput {
  readonly merchantId: string;
  readonly titleVi: string;
  readonly titleEn: string;
  readonly summaryVi: string;
  readonly summaryEn: string;
  readonly descriptionVi: string;
  readonly descriptionEn: string;
  readonly categorySlug: string;
  readonly city: string;
  readonly meetingPoint: string;
  readonly durationMinutes: number;
  readonly languages: string[];
  readonly minGuests: number;
  readonly maxGuests: number;
  readonly priceAdult: Money;
  readonly priceChild: Money | null;
  readonly taxRateBps: number;
  readonly instantConfirmation: boolean;
  readonly freeCancellation: boolean;
  readonly pickupAvailable: boolean;
  readonly bookingCutoffHours: number;
  readonly highlightsVi: string[];
  readonly includedVi: string[];
  readonly excludedVi: string[];
  readonly cancellationText: string;
}

export function createServiceDraft(input: ServiceDraftInput): EditableService {
  seed();
  if (!state.categories.has(input.categorySlug)) {
    throw new CatalogError('Danh mục không tồn tại');
  }
  if (input.minGuests < 1) throw new CatalogError('Số khách tối thiểu phải từ 1');
  if (input.maxGuests < input.minGuests) {
    throw new CatalogError('Số khách tối đa phải lớn hơn hoặc bằng số tối thiểu');
  }
  if (input.priceAdult.amount <= 0) throw new CatalogError('Giá người lớn phải lớn hơn 0');

  let slug = slugify(input.titleEn || input.titleVi);
  if (!slug) slug = `dich-vu-${Date.now()}`;
  let unique = slug;
  let n = 2;
  while ([...state.services.values()].some((s) => s.slug === unique)) {
    unique = `${slug}-${n}`;
    n += 1;
  }

  const now = new Date().toISOString();
  const service: EditableService = {
    id: randomUUID(),
    merchantId: input.merchantId,
    slug: unique,
    categorySlug: input.categorySlug,
    status: 'draft',
    city: input.city, country: 'AE',
    address: null, latitude: null, longitude: null,
    meetingPoint: input.meetingPoint || null,
    pickupAvailable: input.pickupAvailable,
    durationMinutes: input.durationMinutes,
    languages: input.languages,
    minGuests: input.minGuests, maxGuests: input.maxGuests,
    instantConfirmation: input.instantConfirmation,
    freeCancellation: input.freeCancellation,
    bookingCutoffHours: input.bookingCutoffHours,
    guestRequirements: null, healthRequirements: null, usageTerms: null,
    isFeatured: false, ratingAvg: 0, ratingCount: 0, bookingCount: 0,
    coverImageUrl: null, media: [], itinerary: [],
    packages: [{
      id: randomUUID(), code: 'standard', name: 'Tiêu chuẩn', description: null,
      priceAdult: input.priceAdult, priceChild: input.priceChild,
      priceGroup: null, groupSize: null,
      taxRateBps: input.taxRateBps,
      minGuests: input.minGuests, maxGuests: input.maxGuests,
    }],
    policies: {
      cancellationText: input.cancellationText || null,
      cancellationTiers: input.freeCancellation ? [{ hoursBefore: 24, refundBps: 10000 }] : [],
      rescheduleAllowed: input.freeCancellation,
      refundText: null,
      disputeWindowHours: 72,
    },
    i18n: {
      vi: {
        title: input.titleVi, summary: input.summaryVi, description: input.descriptionVi,
        highlights: input.highlightsVi, included: input.includedVi, excluded: input.excludedVi,
      },
      en: {
        title: input.titleEn || input.titleVi,
        summary: input.summaryEn || input.summaryVi,
        description: input.descriptionEn || input.descriptionVi,
        highlights: input.highlightsVi, included: input.includedVi, excluded: input.excludedVi,
      },
    },
    createdAt: now, updatedAt: now,
  };
  state.services.set(service.id, service);
  return service;
}

export function updateService(
  serviceId: string,
  merchantId: string,
  patch: Partial<ServiceDraftInput>,
): EditableService {
  seed();
  const s = state.services.get(serviceId);
  if (!s) throw new CatalogError('Không tìm thấy dịch vụ');
  if (s.merchantId !== merchantId) throw new CatalogError('Dịch vụ không thuộc đơn vị của bạn');

  if (patch.titleVi !== undefined) s.i18n.vi.title = patch.titleVi;
  if (patch.titleEn !== undefined) s.i18n.en.title = patch.titleEn;
  if (patch.summaryVi !== undefined) s.i18n.vi.summary = patch.summaryVi;
  if (patch.summaryEn !== undefined) s.i18n.en.summary = patch.summaryEn;
  if (patch.descriptionVi !== undefined) s.i18n.vi.description = patch.descriptionVi;
  if (patch.descriptionEn !== undefined) s.i18n.en.description = patch.descriptionEn;
  if (patch.highlightsVi !== undefined) { s.i18n.vi.highlights = patch.highlightsVi; s.i18n.en.highlights = patch.highlightsVi; }
  if (patch.includedVi !== undefined) { s.i18n.vi.included = patch.includedVi; s.i18n.en.included = patch.includedVi; }
  if (patch.excludedVi !== undefined) { s.i18n.vi.excluded = patch.excludedVi; s.i18n.en.excluded = patch.excludedVi; }
  if (patch.categorySlug !== undefined) {
    if (!state.categories.has(patch.categorySlug)) throw new CatalogError('Danh mục không tồn tại');
    s.categorySlug = patch.categorySlug;
  }
  if (patch.city !== undefined) s.city = patch.city;
  if (patch.meetingPoint !== undefined) s.meetingPoint = patch.meetingPoint || null;
  if (patch.durationMinutes !== undefined) s.durationMinutes = patch.durationMinutes;
  if (patch.languages !== undefined) s.languages = patch.languages;
  if (patch.minGuests !== undefined) s.minGuests = patch.minGuests;
  if (patch.maxGuests !== undefined) s.maxGuests = patch.maxGuests;
  if (patch.instantConfirmation !== undefined) s.instantConfirmation = patch.instantConfirmation;
  if (patch.freeCancellation !== undefined) s.freeCancellation = patch.freeCancellation;
  if (patch.pickupAvailable !== undefined) s.pickupAvailable = patch.pickupAvailable;
  if (patch.bookingCutoffHours !== undefined) s.bookingCutoffHours = patch.bookingCutoffHours;
  if (patch.cancellationText !== undefined && s.policies) {
    s.policies = { ...s.policies, cancellationText: patch.cancellationText || null };
  }
  if (patch.priceAdult !== undefined || patch.priceChild !== undefined || patch.taxRateBps !== undefined) {
    const p = s.packages[0];
    if (p) {
      s.packages[0] = {
        ...p,
        priceAdult: patch.priceAdult ?? p.priceAdult,
        priceChild: patch.priceChild !== undefined ? patch.priceChild : p.priceChild,
        taxRateBps: patch.taxRateBps ?? p.taxRateBps,
        minGuests: patch.minGuests ?? p.minGuests,
        maxGuests: patch.maxGuests ?? p.maxGuests,
      };
    }
  }

  // Sửa dịch vụ đang bán thì phải nộp duyệt lại — đúng yêu cầu nghiệp vụ.
  if (s.status === 'active') s.status = 'submitted';

  s.updatedAt = new Date().toISOString();
  return s;
}

export function setServiceStatus(serviceId: string, status: ServiceStatus): EditableService {
  seed();
  const s = state.services.get(serviceId);
  if (!s) throw new CatalogError('Không tìm thấy dịch vụ');
  s.status = status;
  s.updatedAt = new Date().toISOString();

  // Bật bán mà chưa có lịch thì sinh lịch 90 ngày để khách đặt được ngay.
  if (status === 'active') {
    const existing = [...state.availability.values()].filter((a) => a.serviceId === serviceId);
    if (existing.length === 0) generateAvailability(serviceId, 90, s.maxGuests ?? 20);
  }
  return s;
}

export function generateAvailability(serviceId: string, days: number, capacity: number): number {
  seed();
  let created = 0;
  for (let d = 1; d <= days; d += 1) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const iso = date.toISOString().slice(0, 10);
    const id = `${serviceId}:${iso}`;
    if (state.availability.has(id)) continue;
    const s = state.services.get(serviceId);
    state.availability.set(id, {
      id, serviceId, packageId: s?.packages[0]?.id ?? null,
      date: iso, startTime: null,
      capacityTotal: capacity, capacityReserved: 0, isClosed: false,
    });
    created += 1;
  }
  return created;
}

export function setDayCapacity(serviceId: string, date: string, capacity: number): AvailabilityDay {
  seed();
  const id = `${serviceId}:${date}`;
  const day = state.availability.get(id);
  if (!day) throw new CatalogError('Không tìm thấy ngày này trong lịch');
  if (capacity < day.capacityReserved) {
    throw new CatalogError(
      `Không thể đặt sức chứa ${capacity} vì đã có ${day.capacityReserved} chỗ được giữ`,
    );
  }
  day.capacityTotal = capacity;
  return day;
}

export function toggleDayClosed(serviceId: string, date: string, closed: boolean): AvailabilityDay {
  seed();
  const day = state.availability.get(`${serviceId}:${date}`);
  if (!day) throw new CatalogError('Không tìm thấy ngày này trong lịch');
  if (closed && day.capacityReserved > 0) {
    throw new CatalogError('Không đóng được ngày đã có khách đặt. Liên hệ hỗ trợ để xử lý.');
  }
  day.isClosed = closed;
  return day;
}

export function addBlackoutDate(serviceId: string, date: string): void {
  seed();
  const day = state.availability.get(`${serviceId}:${date}`);
  if (day && day.capacityReserved > 0) {
    throw new CatalogError('Không chặn được ngày đã có khách đặt.');
  }
  state.blackout.add(`${serviceId}:${date}`);
}

export function removeBlackoutDate(serviceId: string, date: string): void {
  seed();
  state.blackout.delete(`${serviceId}:${date}`);
}

/** Giữ chỗ khi khách đặt. Trả false nếu không đủ chỗ. */
export function holdSeats(serviceId: string, date: string, seats: number): boolean {
  seed();
  const day = state.availability.get(`${serviceId}:${date}`);
  if (!day || day.isClosed) return false;
  if (state.blackout.has(`${serviceId}:${date}`)) return false;
  if (day.capacityReserved + seats > day.capacityTotal) return false;
  day.capacityReserved += seats;
  return true;
}

export function releaseSeats(serviceId: string, date: string, seats: number): void {
  seed();
  const day = state.availability.get(`${serviceId}:${date}`);
  if (day) day.capacityReserved = Math.max(0, day.capacityReserved - seats);
}

// ─── DANH MỤC (Admin) ───────────────────────────────────────────────────────
export function upsertCategory(input: {
  slug: string; nameVi: string; nameEn: string; isActive: boolean; sortOrder: number;
}): EditableCategory {
  seed();
  const existing = state.categories.get(input.slug);
  const cat: EditableCategory = {
    id: existing?.id ?? randomUUID(),
    slug: input.slug,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
    name: { vi: input.nameVi, en: input.nameEn },
  };
  state.categories.set(input.slug, cat);
  return cat;
}

export function setCategoryActive(slug: string, isActive: boolean): EditableCategory {
  seed();
  const c = state.categories.get(slug);
  if (!c) throw new CatalogError('Không tìm thấy danh mục');
  if (!isActive && listServices().some((s) => s.categorySlug === slug && s.status === 'active')) {
    throw new CatalogError('Không tắt được danh mục đang có dịch vụ bán. Chuyển dịch vụ sang nhóm khác trước.');
  }
  c.isActive = isActive;
  return c;
}

/** Chỉ dùng trong test. */
export function __resetCatalog(): void {
  state.services.clear();
  state.categories.clear();
  state.availability.clear();
  state.blackout.clear();
  state.seeded = false;
}
