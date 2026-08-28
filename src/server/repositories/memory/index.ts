/**
 * Repository đọc từ kho dữ liệu trong bộ nhớ.
 *
 * Nguồn là catalog-store — cùng kho mà đối tác ghi vào khi tạo/sửa dịch vụ.
 * Nhờ vậy dịch vụ đối tác vừa được duyệt hiện ngay trên sàn, không phải hai
 * kho dữ liệu rời nhau. Cùng interface với bản Supabase nên UI không cần biết
 * đang dùng nguồn nào.
 */
import type { CurrencyCode, Money } from '@/core/money';
import { fromMajorUnits } from '@/core/money';
import {
  type EditableService, getServiceBySlug as storeGetBySlug, listAvailability as storeAvailability,
  listCategories as storeCategories, listServices as storeServices,
} from '@/server/services/catalog-store';
import { getMerchant } from '@/server/services/merchant-store';
import { ratingSummary } from '@/server/services/review-store';
import type {
  AvailabilitySlot, BookingRepository, CatalogRepository, CategorySummary, Locale,
  MerchantSummary, ReferralRepository, Repositories, ServiceDetail, ServiceSearchFilters,
  ServiceSummary,
} from '../types';

const lang = (locale: Locale): 'vi' | 'en' => (locale === 'en' ? 'en' : 'vi');

function merchantOf(merchantId: string): MerchantSummary {
  const m = getMerchant(merchantId);
  return {
    id: merchantId,
    slug: m?.slug ?? null,
    name: m?.displayName ?? 'Đối tác DubaiWay',
    status: m?.status ?? 'approved',
    isVerified: m?.status === 'approved',
    logoUrl: null,
    city: m?.city ?? null,
    country: m?.country ?? 'AE',
    ratingAvg: 0,
    ratingCount: 0,
  };
}

function toSummary(s: EditableService, locale: Locale): ServiceSummary {
  const t = s.i18n[lang(locale)];
  // Điểm đánh giá lấy từ đánh giá thật; chưa có thì dùng số khởi tạo của dữ liệu mẫu.
  const live = ratingSummary(s.slug);
  return {
    id: s.id, slug: s.slug, title: t.title, summary: t.summary,
    categorySlug: s.categorySlug, city: s.city, country: s.country,
    coverImageUrl: s.coverImageUrl,
    priceFrom: s.packages[0]
      ? (s.packages[0].priceGroup && s.packages[0].priceGroup.amount > 0
          ? s.packages[0].priceGroup
          : s.packages[0].priceAdult)
      : null,
    durationMinutes: s.durationMinutes,
    languages: [...s.languages],
    instantConfirmation: s.instantConfirmation,
    freeCancellation: s.freeCancellation,
    pickupAvailable: s.pickupAvailable,
    ratingAvg: live.count > 0 ? live.average : s.ratingAvg,
    ratingCount: live.count > 0 ? live.count : s.ratingCount,
    bookingCount: s.bookingCount,
    isFeatured: s.isFeatured,
    merchant: merchantOf(s.merchantId),
  };
}

function toDetail(s: EditableService, locale: Locale): ServiceDetail {
  const t = s.i18n[lang(locale)];
  return {
    ...toSummary(s, locale),
    description: t.description,
    highlights: [...t.highlights], included: [...t.included], excluded: [...t.excluded],
    usageTerms: s.usageTerms, address: s.address,
    latitude: s.latitude, longitude: s.longitude, meetingPoint: s.meetingPoint,
    minGuests: s.minGuests, maxGuests: s.maxGuests,
    guestRequirements: s.guestRequirements, healthRequirements: s.healthRequirements,
    bookingCutoffHours: s.bookingCutoffHours,
    media: s.media, itinerary: s.itinerary, packages: s.packages, policies: s.policies,
  };
}

/** Chỉ dịch vụ đang bán của đối tác đã duyệt mới hiện công khai. */
function publiclyVisible(s: EditableService): boolean {
  if (s.status !== 'active') return false;
  return getMerchant(s.merchantId)?.status === 'approved';
}

const catalog: CatalogRepository = {
  async listCategories(locale) {
    const key = lang(locale);
    const services = storeServices().filter(publiclyVisible);
    return storeCategories()
      .filter((c) => c.isActive)
      .map<CategorySummary>((c) => ({
        id: c.id, slug: c.slug, name: c.name[key], icon: null, imageUrl: null,
        serviceCount: services.filter((s) => s.categorySlug === c.slug).length,
      }));
  },

  async getCategoryBySlug(slug, locale) {
    return (await this.listCategories(locale)).find((c) => c.slug === slug) ?? null;
  },

  async searchServices(filters: ServiceSearchFilters, locale) {
    let items = storeServices().filter(publiclyVisible).map((s) => toSummary(s, locale));
    const f = filters;

    if (f.query) {
      const q = f.query.toLowerCase().trim();
      items = items.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.summary ?? '').toLowerCase().includes(q) ||
          (s.city ?? '').toLowerCase().includes(q) ||
          s.categorySlug.includes(q),
      );
    }
    if (f.categorySlug) items = items.filter((s) => s.categorySlug === f.categorySlug);
    if (f.city) items = items.filter((s) => s.city === f.city);
    if (f.country) items = items.filter((s) => s.country === f.country);
    if (f.merchantId) items = items.filter((s) => s.merchant.id === f.merchantId);
    if (f.language) items = items.filter((s) => s.languages.includes(f.language as string));
    if (f.pickupAvailable) items = items.filter((s) => s.pickupAvailable);
    if (f.freeCancellation) items = items.filter((s) => s.freeCancellation);
    if (f.instantConfirmation) items = items.filter((s) => s.instantConfirmation);
    if (typeof f.minRating === 'number') items = items.filter((s) => s.ratingAvg >= (f.minRating as number));
    if (typeof f.priceMin === 'number') items = items.filter((s) => (s.priceFrom?.amount ?? 0) >= (f.priceMin as number));
    if (typeof f.priceMax === 'number') items = items.filter((s) => (s.priceFrom?.amount ?? 0) <= (f.priceMax as number));
    if (typeof f.guests === 'number') {
      const g = f.guests;
      items = items.filter((s) => {
        const full = storeServices().find((x) => x.id === s.id);
        return !full || (g >= full.minGuests && (full.maxGuests === null || g <= full.maxGuests));
      });
    }
    // Lọc theo ngày: chỉ giữ dịch vụ còn chỗ đúng ngày đó.
    if (f.date) {
      const date = f.date;
      items = items.filter((s) => {
        const days = storeAvailability(s.id, date, date);
        return days.length > 0 && !days[0].isClosed && days[0].capacityReserved < days[0].capacityTotal;
      });
    }

    switch (f.sort) {
      case 'price_asc':   items.sort((a, b) => (a.priceFrom?.amount ?? 0) - (b.priceFrom?.amount ?? 0)); break;
      case 'price_desc':  items.sort((a, b) => (b.priceFrom?.amount ?? 0) - (a.priceFrom?.amount ?? 0)); break;
      case 'rating_desc': items.sort((a, b) => b.ratingAvg - a.ratingAvg); break;
      case 'newest':      items.sort((a, b) => b.id.localeCompare(a.id)); break;
      default:            items.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.bookingCount - a.bookingCount);
    }

    const page = f.page ?? 1;
    const pageSize = f.pageSize ?? 24;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
  },

  async getServiceBySlug(slug, locale) {
    const s = storeGetBySlug(slug);
    return s && publiclyVisible(s) ? toDetail(s, locale) : null;
  },

  async listFeaturedServices(locale, limit = 8) {
    const featured = storeServices().filter((s) => publiclyVisible(s) && s.isFeatured);
    const rest = storeServices().filter((s) => publiclyVisible(s) && !s.isFeatured);
    return [...featured, ...rest].slice(0, limit).map((s) => toSummary(s, locale));
  },

  async listRelatedServices(serviceId, locale, limit = 4) {
    const all = storeServices().filter(publiclyVisible);
    const base = all.find((s) => s.id === serviceId);
    if (!base) return [];
    const sameCategory = all.filter((s) => s.id !== serviceId && s.categorySlug === base.categorySlug);
    const others = all.filter((s) => s.id !== serviceId && s.categorySlug !== base.categorySlug);
    return [...sameCategory, ...others].slice(0, limit).map((s) => toSummary(s, locale));
  },

  async getMerchantBySlug(slug) {
    const s = storeServices().find((x) => getMerchant(x.merchantId)?.slug === slug);
    return s ? merchantOf(s.merchantId) : null;
  },

  async listAvailability(serviceId, from, to): Promise<AvailabilitySlot[]> {
    return storeAvailability(serviceId, from, to).map((a) => ({
      id: a.id,
      packageId: a.packageId,
      date: a.date,
      startTime: a.startTime,
      capacityTotal: a.capacityTotal,
      capacityRemaining: Math.max(0, a.capacityTotal - a.capacityReserved),
      isClosed: a.isClosed || a.capacityReserved >= a.capacityTotal,
    }));
  },
};

const bookings: BookingRepository = {
  async listForUser() { return []; },
  async getByReference() { return null; },
};

const referral: ReferralRepository = {
  async getCodeForUser() { return null; },
  async getDirectReferrer() { return null; },
  async getWalletBalance(): Promise<Money | null> {
    return fromMajorUnits(0, 'USD' as CurrencyCode);
  },
};

export const memoryRepositories: Repositories = { catalog, bookings, referral, source: 'memory' };
