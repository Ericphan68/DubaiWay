/**
 * Giao diện (interface) của tầng truy cập dữ liệu.
 *
 * Tầng UI và tầng service CHỈ nói chuyện qua những interface này, không gọi thẳng
 * Supabase. Nhờ vậy có thể đổi backend, và chạy được toàn bộ ứng dụng bằng
 * adapter trong bộ nhớ khi chưa có tài khoản Supabase.
 */
import type { CurrencyCode, Money } from '@/core/money';
import type { BookingStatus, MerchantStatus } from '@/core/state-machines';

export type Locale = 'vi' | 'en' | 'ar';

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  imageUrl: string | null;
  serviceCount?: number;
}

export interface MerchantSummary {
  id: string;
  slug: string | null;
  name: string;
  status: MerchantStatus;
  isVerified: boolean;
  logoUrl: string | null;
  city: string | null;
  country: string | null;
  ratingAvg: number;
  ratingCount: number;
}

export interface ServicePackageSummary {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceAdult: Money;
  priceChild: Money | null;
  priceGroup: Money | null;
  groupSize: number | null;
  taxRateBps: number;
  minGuests: number;
  maxGuests: number | null;
}

export interface ServiceSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  categorySlug: string;
  city: string | null;
  country: string;
  coverImageUrl: string | null;
  priceFrom: Money | null;
  durationMinutes: number | null;
  languages: string[];
  instantConfirmation: boolean;
  freeCancellation: boolean;
  pickupAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  bookingCount: number;
  isFeatured: boolean;
  merchant: MerchantSummary;
}

export interface ServiceDetail extends ServiceSummary {
  description: string | null;
  highlights: string[];
  included: string[];
  excluded: string[];
  usageTerms: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  meetingPoint: string | null;
  minGuests: number;
  maxGuests: number | null;
  guestRequirements: string | null;
  healthRequirements: string | null;
  bookingCutoffHours: number;
  media: { url: string; kind: 'image' | 'video'; altText: string | null }[];
  itinerary: { dayNumber: number; title: string; description: string | null; startTime: string | null }[];
  packages: ServicePackageSummary[];
  policies: {
    cancellationText: string | null;
    cancellationTiers: { hoursBefore: number; refundBps: number }[];
    rescheduleAllowed: boolean;
    refundText: string | null;
    disputeWindowHours: number;
  } | null;
}

/** Bộ lọc tìm kiếm — khớp đúng danh sách yêu cầu ở mục 6. */
export interface ServiceSearchFilters {
  query?: string;
  categorySlug?: string;
  country?: string;
  city?: string;
  date?: string; // ISO yyyy-mm-dd
  priceMin?: number; // đơn vị nhỏ nhất
  priceMax?: number;
  guests?: number;
  minRating?: number; // 1..5
  language?: string;
  pickupAvailable?: boolean;
  freeCancellation?: boolean;
  instantConfirmation?: boolean;
  onPromotion?: boolean;
  merchantId?: string;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AvailabilitySlot {
  id: string;
  packageId: string | null;
  date: string;
  startTime: string | null;
  capacityTotal: number;
  capacityRemaining: number;
  isClosed: boolean;
}

export interface BookingSummary {
  id: string;
  reference: string;
  status: BookingStatus;
  currency: CurrencyCode;
  customerTotal: Money;
  createdAt: string;
  serviceTitle: string;
  serviceDate: string;
  merchantName: string;
}

// ─── Interface các repository ───────────────────────────────────────────────
export interface CatalogRepository {
  listCategories(locale: Locale): Promise<CategorySummary[]>;
  getCategoryBySlug(slug: string, locale: Locale): Promise<CategorySummary | null>;
  searchServices(filters: ServiceSearchFilters, locale: Locale): Promise<Paginated<ServiceSummary>>;
  getServiceBySlug(slug: string, locale: Locale): Promise<ServiceDetail | null>;
  listFeaturedServices(locale: Locale, limit?: number): Promise<ServiceSummary[]>;
  listRelatedServices(serviceId: string, locale: Locale, limit?: number): Promise<ServiceSummary[]>;
  getMerchantBySlug(slug: string, locale: Locale): Promise<MerchantSummary | null>;
  listAvailability(serviceId: string, from: string, to: string): Promise<AvailabilitySlot[]>;
}

export interface BookingRepository {
  listForUser(userId: string): Promise<BookingSummary[]>;
  getByReference(reference: string): Promise<BookingSummary | null>;
}

export interface ReferralRepository {
  getCodeForUser(userId: string): Promise<string | null>;
  getDirectReferrer(userId: string): Promise<string | null>;
  getWalletBalance(userId: string): Promise<Money | null>;
}

export interface Repositories {
  catalog: CatalogRepository;
  bookings: BookingRepository;
  referral: ReferralRepository;
  /** Nguồn dữ liệu đang dùng — để hiển thị cảnh báo khi chạy ở chế độ giả lập. */
  readonly source: 'supabase' | 'memory';
}
