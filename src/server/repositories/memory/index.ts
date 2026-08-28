/**
 * Repository chạy hoàn toàn trong bộ nhớ — dùng khi chưa cấu hình Supabase.
 * Cùng interface với bản Supabase nên UI không cần biết đang dùng nguồn nào.
 */
import type { CurrencyCode, Money } from '@/core/money';
import { fromMajorUnits } from '@/core/money';
import type {
  AvailabilitySlot, BookingRepository, BookingSummary, CatalogRepository, CategorySummary,
  Locale, MerchantSummary, ReferralRepository, Repositories, ServiceDetail,
  ServiceSearchFilters, ServiceSummary,
} from '../types';
import { MEMORY_CATEGORIES, MEMORY_SERVICES } from './data';

const localeOf = (locale: Locale): 'vi' | 'en' => (locale === 'en' ? 'en' : 'vi');

function toSummary(s: (typeof MEMORY_SERVICES)[number], locale: Locale): ServiceSummary {
  const t = s.i18n[localeOf(locale)];
  return {
    id: s.id, slug: s.slug, title: t.title, summary: t.summary,
    categorySlug: s.categorySlug, city: s.city, country: s.country,
    coverImageUrl: s.coverImageUrl, priceFrom: s.priceFrom,
    durationMinutes: s.durationMinutes, languages: [...s.languages],
    instantConfirmation: s.instantConfirmation, freeCancellation: s.freeCancellation,
    pickupAvailable: s.pickupAvailable, ratingAvg: s.ratingAvg, ratingCount: s.ratingCount,
    bookingCount: s.bookingCount, isFeatured: s.isFeatured, merchant: s.merchant,
  };
}

function toDetail(s: (typeof MEMORY_SERVICES)[number], locale: Locale): ServiceDetail {
  const t = s.i18n[localeOf(locale)];
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

const catalog: CatalogRepository = {
  async listCategories(locale) {
    const key = localeOf(locale);
    return MEMORY_CATEGORIES.map<CategorySummary>((c) => ({
      id: c.id, slug: c.slug, name: c[key], icon: null, imageUrl: null,
      serviceCount: MEMORY_SERVICES.filter((s) => s.categorySlug === c.slug).length,
    }));
  },

  async getCategoryBySlug(slug, locale) {
    return (await this.listCategories(locale)).find((c) => c.slug === slug) ?? null;
  },

  async searchServices(filters, locale) {
    let items = MEMORY_SERVICES.map((s) => toSummary(s, locale));
    const f: ServiceSearchFilters = filters;

    if (f.query) {
      const q = f.query.toLowerCase().trim();
      items = items.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.summary ?? '').toLowerCase().includes(q) ||
          (s.city ?? '').toLowerCase().includes(q),
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
        const full = MEMORY_SERVICES.find((x) => x.id === s.id);
        return !full || (g >= full.minGuests && (full.maxGuests === null || g <= full.maxGuests));
      });
    }

    switch (f.sort) {
      case 'price_asc':  items.sort((a, b) => (a.priceFrom?.amount ?? 0) - (b.priceFrom?.amount ?? 0)); break;
      case 'price_desc': items.sort((a, b) => (b.priceFrom?.amount ?? 0) - (a.priceFrom?.amount ?? 0)); break;
      case 'rating_desc':items.sort((a, b) => b.ratingAvg - a.ratingAvg); break;
      default:           items.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.bookingCount - a.bookingCount);
    }

    const page = f.page ?? 1;
    const pageSize = f.pageSize ?? 24;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
  },

  async getServiceBySlug(slug, locale) {
    const s = MEMORY_SERVICES.find((x) => x.slug === slug);
    return s ? toDetail(s, locale) : null;
  },

  async listFeaturedServices(locale, limit = 8) {
    return MEMORY_SERVICES.filter((s) => s.isFeatured).slice(0, limit).map((s) => toSummary(s, locale));
  },

  async listRelatedServices(serviceId, locale, limit = 4) {
    const base = MEMORY_SERVICES.find((s) => s.id === serviceId);
    if (!base) return [];
    return MEMORY_SERVICES
      .filter((s) => s.id !== serviceId && s.categorySlug === base.categorySlug)
      .concat(MEMORY_SERVICES.filter((s) => s.id !== serviceId && s.categorySlug !== base.categorySlug))
      .slice(0, limit)
      .map((s) => toSummary(s, locale));
  },

  async getMerchantBySlug(slug) {
    const s = MEMORY_SERVICES.find((x) => x.merchant.slug === slug);
    return (s?.merchant as MerchantSummary | undefined) ?? null;
  },

  async listAvailability(serviceId, from, to) {
    // Sinh lịch còn chỗ theo ngày, ổn định theo serviceId nên không nhảy số mỗi lần tải.
    const svc = MEMORY_SERVICES.find((s) => s.id === serviceId);
    if (!svc) return [];
    const out: AvailabilitySlot[] = [];
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    let seed = [...serviceId].reduce((a, c) => a + c.charCodeAt(0), 0);
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      const total = svc.maxGuests ?? 20;
      const remaining = Math.max(0, total - (seed % Math.max(2, Math.floor(total * 0.6))));
      out.push({
        id: `${serviceId}:${d.toISOString().slice(0, 10)}`,
        packageId: svc.packages[0]?.id ?? null,
        date: d.toISOString().slice(0, 10),
        startTime: null,
        capacityTotal: total,
        capacityRemaining: remaining,
        isClosed: remaining === 0,
      });
    }
    return out;
  },
};

const bookings: BookingRepository = {
  async listForUser() { return [] as BookingSummary[]; },
  async getByReference() { return null; },
};

const referral: ReferralRepository = {
  async getCodeForUser() { return null; },
  async getDirectReferrer() { return null; },
  async getWalletBalance(): Promise<Money | null> {
    return fromMajorUnits(0, 'AED' as CurrencyCode);
  },
};

export const memoryRepositories: Repositories = {
  catalog, bookings, referral, source: 'memory',
};
