/**
 * Repository đọc dữ liệu thật từ Supabase/PostgreSQL.
 *
 * Dùng client ẩn danh (anon key) cho dữ liệu công khai — RLS ở database quyết định
 * ai thấy gì, nên không thể lộ dữ liệu chỉ vì quên kiểm tra ở tầng ứng dụng.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { fromMinorUnits, type CurrencyCode } from '@/core/money';
import { env } from '@/server/env';
import type {
  AvailabilitySlot, BookingRepository, CatalogRepository, CategorySummary, Locale,
  MerchantSummary, ReferralRepository, Repositories, ServiceDetail, ServiceSearchFilters,
  ServiceSummary,
} from '../types';

function client(): SupabaseClient {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Thiếu cấu hình Supabase — không tạo được client');
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

/** Cột dùng chung khi lấy danh sách dịch vụ. */
const SERVICE_SELECT = `
  id, slug, city, country, price_from_minor, currency, duration_minutes, languages,
  instant_confirmation, free_cancellation, pickup_available,
  rating_avg_x100, rating_count, booking_count, is_featured,
  category:categories!inner(slug),
  merchant:merchants!inner(id, slug, trading_name, legal_name, individual_full_name, status, logo_url, city, country),
  translations:service_translations!inner(locale, title, summary)
`;

/**
 * Kết quả trả về từ Supabase có hình dạng phụ thuộc chuỗi `select()` viết tay,
 * TypeScript không suy ra được. Dùng `any` giới hạn ở đúng chỗ này; mọi giá trị
 * được các hàm map bên dưới chuyển ngay sang kiểu domain đã định nghĩa chặt chẽ.
 * Khi có Supabase CLI, chạy `supabase gen types typescript` để thay bằng kiểu sinh tự động.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function mapMerchant(m: Row): MerchantSummary {
  return {
    id: m.id,
    slug: m.slug ?? null,
    name: m.trading_name ?? m.legal_name ?? m.individual_full_name ?? 'Merchant',
    status: m.status,
    isVerified: m.status === 'approved',
    logoUrl: m.logo_url ?? null,
    city: m.city ?? null,
    country: m.country ?? null,
    ratingAvg: 0,
    ratingCount: 0,
  };
}

function mapSummary(r: Row): ServiceSummary {
  const tr = Array.isArray(r.translations) ? r.translations[0] : r.translations;
  return {
    id: r.id,
    slug: r.slug,
    title: tr?.title ?? r.slug,
    summary: tr?.summary ?? null,
    categorySlug: (Array.isArray(r.category) ? r.category[0] : r.category)?.slug ?? '',
    city: r.city ?? null,
    country: r.country ?? 'AE',
    coverImageUrl: r.cover_url ?? null,
    priceFrom:
      r.price_from_minor === null || r.price_from_minor === undefined
        ? null
        : fromMinorUnits(r.price_from_minor, (r.currency ?? 'AED') as CurrencyCode),
    durationMinutes: r.duration_minutes ?? null,
    languages: r.languages ?? [],
    instantConfirmation: Boolean(r.instant_confirmation),
    freeCancellation: Boolean(r.free_cancellation),
    pickupAvailable: Boolean(r.pickup_available),
    ratingAvg: (r.rating_avg_x100 ?? 0) / 100,
    ratingCount: r.rating_count ?? 0,
    bookingCount: r.booking_count ?? 0,
    isFeatured: Boolean(r.is_featured),
    merchant: mapMerchant(Array.isArray(r.merchant) ? r.merchant[0] : r.merchant),
  };
}

const catalog: CatalogRepository = {
  async listCategories(locale: Locale): Promise<CategorySummary[]> {
    const { data, error } = await client()
      .from('categories')
      .select('id, slug, icon, image_url, translations:category_translations!inner(locale, name)')
      .eq('is_active', true)
      .eq('category_translations.locale', locale)
      .order('sort_order');
    if (error) throw new Error(`listCategories: ${error.message}`);
    return (data ?? []).map((c: Row) => ({
      id: c.id,
      slug: c.slug,
      name: (Array.isArray(c.translations) ? c.translations[0] : c.translations)?.name ?? c.slug,
      icon: c.icon ?? null,
      imageUrl: c.image_url ?? null,
    }));
  },

  async getCategoryBySlug(slug, locale) {
    return (await this.listCategories(locale)).find((c) => c.slug === slug) ?? null;
  },

  async searchServices(filters: ServiceSearchFilters, locale: Locale) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 24;
    let q = client()
      .from('services')
      .select(SERVICE_SELECT, { count: 'exact' })
      .eq('status', 'active')
      .eq('merchants.status', 'approved')
      .eq('service_translations.locale', locale);

    if (filters.categorySlug) q = q.eq('categories.slug', filters.categorySlug);
    if (filters.city) q = q.eq('city', filters.city);
    if (filters.country) q = q.eq('country', filters.country);
    if (filters.merchantId) q = q.eq('merchant_id', filters.merchantId);
    if (filters.pickupAvailable) q = q.eq('pickup_available', true);
    if (filters.freeCancellation) q = q.eq('free_cancellation', true);
    if (filters.instantConfirmation) q = q.eq('instant_confirmation', true);
    if (filters.language) q = q.contains('languages', [filters.language]);
    if (typeof filters.priceMin === 'number') q = q.gte('price_from_minor', filters.priceMin);
    if (typeof filters.priceMax === 'number') q = q.lte('price_from_minor', filters.priceMax);
    if (typeof filters.minRating === 'number') q = q.gte('rating_avg_x100', filters.minRating * 100);
    if (filters.query) q = q.ilike('service_translations.title', `%${filters.query}%`);

    switch (filters.sort) {
      case 'price_asc':   q = q.order('price_from_minor', { ascending: true }); break;
      case 'price_desc':  q = q.order('price_from_minor', { ascending: false }); break;
      case 'rating_desc': q = q.order('rating_avg_x100', { ascending: false }); break;
      case 'newest':      q = q.order('published_at', { ascending: false }); break;
      default:            q = q.order('is_featured', { ascending: false }).order('booking_count', { ascending: false });
    }

    const { data, error, count } = await q.range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw new Error(`searchServices: ${error.message}`);
    return { items: (data ?? []).map(mapSummary), total: count ?? 0, page, pageSize };
  },

  async getServiceBySlug(slug: string, locale: Locale): Promise<ServiceDetail | null> {
    const { data, error } = await client()
      .from('services')
      .select(`
        ${SERVICE_SELECT},
        address, latitude, longitude, meeting_point, min_guests, max_guests,
        guest_requirements, health_requirements, booking_cutoff_hours,
        full_tr:service_translations!inner(locale, title, summary, description, highlights, included, excluded, usage_terms),
        media:service_media(url, kind, alt_text, sort_order, is_cover),
        itinerary:service_itinerary(day_number, title, description, start_time, locale, sort_order),
        packages:service_packages(id, code, price_adult_minor, price_child_minor, price_group_minor,
                                  group_size, currency, tax_rate_bps, min_guests, max_guests, is_active,
                                  tr:package_translations(locale, name, description)),
        policies:service_policies(cancellation_text, cancellation_tiers, reschedule_allowed,
                                  refund_text, dispute_window_hours)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .eq('service_translations.locale', locale)
      .maybeSingle();

    if (error) throw new Error(`getServiceBySlug: ${error.message}`);
    if (!data) return null;

    const r = data as Row;
    const tr = (Array.isArray(r.full_tr) ? r.full_tr[0] : r.full_tr) ?? {};
    const pol = Array.isArray(r.policies) ? r.policies[0] : r.policies;

    return {
      ...mapSummary(r),
      description: tr.description ?? null,
      highlights: tr.highlights ?? [],
      included: tr.included ?? [],
      excluded: tr.excluded ?? [],
      usageTerms: tr.usage_terms ?? null,
      address: r.address ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      meetingPoint: r.meeting_point ?? null,
      minGuests: r.min_guests ?? 1,
      maxGuests: r.max_guests ?? null,
      guestRequirements: r.guest_requirements ?? null,
      healthRequirements: r.health_requirements ?? null,
      bookingCutoffHours: r.booking_cutoff_hours ?? 24,
      media: (r.media ?? [])
        .sort((a: Row, b: Row) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((m: Row) => ({ url: m.url, kind: m.kind, altText: m.alt_text ?? null })),
      itinerary: (r.itinerary ?? [])
        .filter((i: Row) => i.locale === locale)
        .sort((a: Row, b: Row) => (a.day_number ?? 0) - (b.day_number ?? 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((i: Row) => ({
          dayNumber: i.day_number ?? 1, title: i.title,
          description: i.description ?? null, startTime: i.start_time ?? null,
        })),
      packages: (r.packages ?? [])
        .filter((p: Row) => p.is_active)
        .map((p: Row) => {
          const ptr = (p.tr ?? []).find((x: Row) => x.locale === locale) ?? (p.tr ?? [])[0];
          const cur = (p.currency ?? 'AED') as CurrencyCode;
          return {
            id: p.id,
            code: p.code,
            name: ptr?.name ?? p.code,
            description: ptr?.description ?? null,
            priceAdult: fromMinorUnits(p.price_adult_minor ?? 0, cur),
            priceChild: p.price_child_minor === null ? null : fromMinorUnits(p.price_child_minor, cur),
            priceGroup: p.price_group_minor === null ? null : fromMinorUnits(p.price_group_minor, cur),
            groupSize: p.group_size ?? null,
            taxRateBps: p.tax_rate_bps ?? 0,
            minGuests: p.min_guests ?? 1,
            maxGuests: p.max_guests ?? null,
          };
        }),
      policies: pol
        ? {
            cancellationText: pol.cancellation_text ?? null,
            cancellationTiers: (pol.cancellation_tiers ?? []).map((t: Row) => ({
              hoursBefore: t.hours_before, refundBps: t.refund_bps,
            })),
            rescheduleAllowed: Boolean(pol.reschedule_allowed),
            refundText: pol.refund_text ?? null,
            disputeWindowHours: pol.dispute_window_hours ?? 72,
          }
        : null,
    };
  },

  async listFeaturedServices(locale, limit = 8) {
    const r = await this.searchServices({ sort: 'featured', pageSize: limit }, locale);
    return r.items.filter((s) => s.isFeatured);
  },

  async listRelatedServices(serviceId, locale, limit = 4) {
    const { data } = await client().from('services').select('category_id').eq('id', serviceId).maybeSingle();
    if (!data) return [];
    const r = await this.searchServices({ pageSize: limit + 1 }, locale);
    return r.items.filter((s) => s.id !== serviceId).slice(0, limit);
  },

  async getMerchantBySlug(slug: string): Promise<MerchantSummary | null> {
    const { data, error } = await client()
      .from('merchants')
      .select('id, slug, trading_name, legal_name, individual_full_name, status, logo_url, city, country')
      .eq('slug', slug)
      .eq('status', 'approved')
      .maybeSingle();
    if (error) throw new Error(`getMerchantBySlug: ${error.message}`);
    return data ? mapMerchant(data as Row) : null;
  },

  async listAvailability(serviceId: string, from: string, to: string): Promise<AvailabilitySlot[]> {
    const { data, error } = await client()
      .from('service_availability')
      .select('id, package_id, available_date, start_time, capacity_total, capacity_reserved, is_closed')
      .eq('service_id', serviceId)
      .gte('available_date', from)
      .lte('available_date', to)
      .order('available_date');
    if (error) throw new Error(`listAvailability: ${error.message}`);
    return (data ?? []).map((a: Row) => ({
      id: a.id,
      packageId: a.package_id ?? null,
      date: a.available_date,
      startTime: a.start_time ?? null,
      capacityTotal: a.capacity_total,
      capacityRemaining: Math.max(0, a.capacity_total - a.capacity_reserved),
      isClosed: Boolean(a.is_closed) || a.capacity_reserved >= a.capacity_total,
    }));
  },
};

const bookings: BookingRepository = {
  async listForUser(userId: string) {
    const { data, error } = await client()
      .from('bookings')
      .select('id, reference, status, currency, customer_total_minor, created_at, merchant:merchants(trading_name, legal_name), items:booking_items(service_title_snapshot, service_date)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`listForUser: ${error.message}`);
    return (data ?? []).map((b: Row) => {
      const item = (b.items ?? [])[0] ?? {};
      const m = Array.isArray(b.merchant) ? b.merchant[0] : b.merchant;
      return {
        id: b.id,
        reference: b.reference,
        status: b.status,
        currency: b.currency as CurrencyCode,
        customerTotal: fromMinorUnits(b.customer_total_minor, b.currency as CurrencyCode),
        createdAt: b.created_at,
        serviceTitle: item.service_title_snapshot ?? '',
        serviceDate: item.service_date ?? '',
        merchantName: m?.trading_name ?? m?.legal_name ?? '',
      };
    });
  },

  async getByReference(reference: string) {
    const all = await this.listForUser('');
    return all.find((b) => b.reference === reference) ?? null;
  },
};

const referral: ReferralRepository = {
  async getCodeForUser(userId: string) {
    const { data } = await client().from('referral_codes').select('code').eq('user_id', userId).maybeSingle();
    return (data as Row | null)?.code ?? null;
  },
  async getDirectReferrer(userId: string) {
    const { data } = await client().rpc('get_direct_referrer', { p_user_id: userId });
    return (data as string | null) ?? null;
  },
  async getWalletBalance(userId: string) {
    const { data } = await client()
      .from('wallets')
      .select('balance_available_minor, currency')
      .eq('user_id', userId)
      .maybeSingle();
    const row = data as Row | null;
    return row ? fromMinorUnits(row.balance_available_minor, row.currency as CurrencyCode) : null;
  },
};

export const supabaseRepositories: Repositories = {
  catalog, bookings, referral, source: 'supabase',
};
