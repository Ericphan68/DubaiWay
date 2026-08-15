import type { FlightOffer, SampleFlight } from '@/types';
import { siteConfig } from '@/config/site';

/**
 * Ba nền tảng đối tác hiển thị giá tham khảo song song.
 * Link lấy từ config (không hardcode). Giá thực xác nhận trên nền tảng đối tác.
 */
export const flightOffers: FlightOffer[] = [
  {
    partner: 'SkyCompare',
    logoInitial: 'SC',
    price: { from: 12850000, currency: 'VND' },
    baggage: '1 x 23kg ký gửi + 7kg xách tay',
    changePolicy: 'Đổi vé có phí từ 900.000₫',
    duration: '14h 35m',
    stops: '1 điểm dừng · DXB',
    partnerUrl: siteConfig.partners.flights[0],
  },
  {
    partner: 'AeroDeal',
    logoInitial: 'AD',
    price: { from: 13420000, currency: 'VND' },
    baggage: '2 x 23kg ký gửi + 7kg xách tay',
    changePolicy: 'Đổi vé miễn phí 1 lần',
    duration: '15h 10m',
    stops: '1 điểm dừng · BKK',
    partnerUrl: siteConfig.partners.flights[1],
  },
  {
    partner: 'GlobeFare',
    logoInitial: 'GF',
    price: { from: 12290000, currency: 'VND' },
    baggage: '1 x 23kg ký gửi + 7kg xách tay',
    changePolicy: 'Vé tiết kiệm, không hoàn',
    duration: '16h 45m',
    stops: '1 điểm dừng · DOH',
    partnerUrl: siteConfig.partners.flights[2],
  },
];

/** Cabin class cho form tìm vé. */
export const cabinClasses = [
  { value: 'economy', label: 'Phổ thông' },
  { value: 'business', label: 'Thương gia' },
  { value: 'first', label: 'Hạng nhất' },
] as const;

/** Tuyến bay mẫu — mỗi tuyến hiển thị giá tham khảo từ 3 nền tảng đối tác. */
export const sampleFlights: SampleFlight[] = [
  {
    id: 'sgn-dxb',
    fromCity: 'TP.HCM',
    fromCode: 'SGN',
    toCity: 'Dubai',
    toCode: 'DXB',
    cabin: 'Phổ thông · Khứ hồi',
    offers: [
      { partner: 'SkyCompare', logoInitial: 'SC', airline: 'Emirates', departTime: '06:05', arriveTime: '19:40', price: { from: 12850000, currency: 'VND' }, baggage: '1 x 23kg + 7kg', changePolicy: 'Đổi vé từ 900.000₫', duration: '14h 35m', stops: '1 điểm dừng · DXB', partnerUrl: siteConfig.partners.flights[0] },
      { partner: 'AeroDeal', logoInitial: 'AD', airline: 'Qatar Airways', departTime: '23:15', arriveTime: '12:25', price: { from: 13420000, currency: 'VND' }, baggage: '2 x 23kg + 7kg', changePolicy: 'Đổi vé miễn phí 1 lần', duration: '15h 10m', stops: '1 điểm dừng · DOH', partnerUrl: siteConfig.partners.flights[1] },
      { partner: 'GlobeFare', logoInitial: 'GF', airline: 'Etihad', departTime: '18:30', arriveTime: '09:15', price: { from: 12290000, currency: 'VND' }, baggage: '1 x 23kg + 7kg', changePolicy: 'Vé tiết kiệm, không hoàn', duration: '16h 45m', stops: '1 điểm dừng · AUH', partnerUrl: siteConfig.partners.flights[2] },
    ],
  },
  {
    id: 'han-nrt',
    fromCity: 'Hà Nội',
    fromCode: 'HAN',
    toCity: 'Tokyo',
    toCode: 'NRT',
    cabin: 'Phổ thông · Khứ hồi',
    offers: [
      { partner: 'SkyCompare', logoInitial: 'SC', airline: 'Vietnam Airlines', departTime: '00:45', arriveTime: '07:20', price: { from: 9850000, currency: 'VND' }, baggage: '2 x 23kg + 7kg', changePolicy: 'Đổi vé từ 1.200.000₫', duration: '5h 35m', stops: 'Bay thẳng', partnerUrl: siteConfig.partners.flights[0] },
      { partner: 'AeroDeal', logoInitial: 'AD', airline: 'Japan Airlines', departTime: '08:10', arriveTime: '15:05', price: { from: 11200000, currency: 'VND' }, baggage: '2 x 23kg + 7kg', changePolicy: 'Đổi vé miễn phí 1 lần', duration: '5h 55m', stops: 'Bay thẳng', partnerUrl: siteConfig.partners.flights[1] },
      { partner: 'GlobeFare', logoInitial: 'GF', airline: 'ANA', departTime: '23:30', arriveTime: '06:05', price: { from: 10650000, currency: 'VND' }, baggage: '1 x 23kg + 7kg', changePolicy: 'Vé tiết kiệm, không hoàn', duration: '5h 35m', stops: 'Bay thẳng', partnerUrl: siteConfig.partners.flights[2] },
    ],
  },
  {
    id: 'sgn-cdg',
    fromCity: 'TP.HCM',
    fromCode: 'SGN',
    toCity: 'Paris',
    toCode: 'CDG',
    cabin: 'Phổ thông · Khứ hồi',
    offers: [
      { partner: 'SkyCompare', logoInitial: 'SC', airline: 'Qatar Airways', departTime: '21:00', arriveTime: '13:10', price: { from: 21500000, currency: 'VND' }, baggage: '2 x 23kg + 7kg', changePolicy: 'Đổi vé từ 1.500.000₫', duration: '17h 10m', stops: '1 điểm dừng · DOH', partnerUrl: siteConfig.partners.flights[0] },
      { partner: 'AeroDeal', logoInitial: 'AD', airline: 'Turkish Airlines', departTime: '22:40', arriveTime: '15:30', price: { from: 20800000, currency: 'VND' }, baggage: '2 x 23kg + 7kg', changePolicy: 'Đổi vé miễn phí 1 lần', duration: '18h 50m', stops: '1 điểm dừng · IST', partnerUrl: siteConfig.partners.flights[1] },
      { partner: 'GlobeFare', logoInitial: 'GF', airline: 'Emirates', departTime: '06:05', arriveTime: '22:35', price: { from: 22300000, currency: 'VND' }, baggage: '1 x 23kg + 7kg', changePolicy: 'Vé tiết kiệm, không hoàn', duration: '19h 30m', stops: '1 điểm dừng · DXB', partnerUrl: siteConfig.partners.flights[2] },
    ],
  },
];
