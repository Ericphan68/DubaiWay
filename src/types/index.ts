/**
 * Kiểu dữ liệu dùng chung toàn site.
 * Giữ tối giản ở Phase 1 — mở rộng khi tích hợp API thật.
 */

/** Ba loại hành động mọi sản phẩm phải thuộc về (xem ActionBadge). */
export type ActionType = 'book' | 'quote' | 'partner';

export type Currency = 'VND' | 'USD';

export interface Price {
  /** Giá "từ" — luôn là giá tham khảo, có thể thay đổi. */
  from: number;
  currency: Currency;
  /** Đơn vị hiển thị kèm, ví dụ "/khách", "/đêm". */
  unit?: string;
}

export type TourSegment = 'saver' | 'standard' | 'premium' | 'luxury' | 'private';
export type TourFormat =
  | 'join'
  | 'private-group'
  | 'individual'
  | 'family'
  | 'corporate'
  | 'church'
  | 'school'
  | 'bespoke';
export type DepartureMode = 'from-vietnam' | 'at-destination';

export interface Tour {
  slug: string;
  title: string;
  destination: string;
  region: string;
  image: string;
  durationDays: number;
  durationNights: number;
  departureFrom: string[];
  nextDepartures: string[];
  price: Price;
  seatsLeft: number;
  format: TourFormat;
  segment: TourSegment;
  mode: DepartureMode;
  action: ActionType;
  highlights: string[];
  summary: string;
  /** Giá trẻ em (nếu áp dụng, dùng cho tour tại điểm đến). */
  childPrice?: Price;
  /** Ngôn ngữ phục vụ (tour tại điểm đến). */
  languages?: string[];
  /** Có đón tại khách sạn không (tour tại điểm đến). */
  hotelPickup?: boolean;
  /** Điểm tập trung / giờ bắt đầu (tour tại điểm đến). */
  meetingPoint?: string;
  startTime?: string;
  /** Nội dung chi tiết — chỉ có ở một số tour tiêu biểu. */
  detail?: TourDetail;
}

export interface TourDetail {
  gallery: string[];
  videoUrl?: string;
  itinerary: ItineraryDay[];
  hotels: string;
  meals: string;
  transport: string;
  visa: string;
  includes: string[];
  excludes: string[];
  childPolicy: string;
  cancellationPolicy: string;
  faqs: FaqItem[];
  reviews: TourReview[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TourReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  quote: string;
}

export interface FlightOffer {
  partner: string;
  logoInitial: string;
  price: Price;
  baggage: string;
  changePolicy: string;
  duration: string;
  stops: string;
  partnerUrl: string;
  airline?: string;
  departTime?: string;
  arriveTime?: string;
}

export interface SampleFlight {
  id: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  cabin: string;
  offers: FlightOffer[];
}

export interface Hotel {
  slug: string;
  name: string;
  city: string;
  country: string;
  image: string;
  stars: number;
  rating: number;
  reviewCount: number;
  price: Price;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  area: string;
  amenities: string[];
  action: ActionType;
}

export interface DubaiExperience {
  slug: string;
  title: string;
  category: string;
  image: string;
  price: Price;
  duration: string;
  pickup: string;
  schedule: string;
  action: ActionType;
  summary: string;
}

export interface HolyLandJourney {
  slug: string;
  title: string;
  countries: string[];
  image: string;
  durationDays: number;
  theme: string;
  mode: string;
  leader: string;
  price: Price;
  nextDepartures: string[];
  summary: string;
  stops: { place: string; meaning: string }[];
  detail?: HolyLandDetail;
}

export interface HolyLandDetail {
  gallery: string[];
  historicalContext: string;
  spiritualTheme: string;
  itinerary: ItineraryDay[];
  includes: string[];
  faqs: FaqItem[];
}

export interface DubaiDetail {
  gallery: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  faqs: FaqItem[];
}

export interface VisaCountry {
  slug: string;
  country: string;
  flag: string;
  region: string;
  visaTypes: string[];
  processingTime: string;
  stayDuration: string;
  popular: boolean;
  summary: string;
  detail?: VisaDetail;
}

export interface VisaDetail {
  whoCanApply: string;
  eligibility: string[];
  validity: string;
  entries: string;
  documents: string[];
  process: string[];
  notes: string[];
  faqs: FaqItem[];
}

export interface EventType {
  slug: string;
  title: string;
  image: string;
  summary: string;
  scope: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  destination: string;
  topic: string;
  readingMinutes: number;
  publishedAt: string;
  author: string;
}

export interface Review {
  name: string;
  role: string;
  location: string;
  rating: number;
  quote: string;
  product: string;
}

export interface Destination {
  name: string;
  slug: string;
  image: string;
  tourCount: number;
  tagline: string;
}
