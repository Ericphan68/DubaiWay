/**
 * Cấu hình toàn site — thông tin liên hệ, đối tác, social.
 * Đọc từ biến môi trường (NEXT_PUBLIC_*) với giá trị dự phòng an toàn.
 * KHÔNG hardcode số/liên kết thật trong component — luôn lấy từ đây.
 */

/**
 * LƯU Ý: phải viết `process.env.NEXT_PUBLIC_X` dạng TĨNH.
 * Truy cập động (`process.env[key]`) sẽ KHÔNG được Next.js inline vào bundle client
 * → server đọc được biến còn client thì không → lỗi hydration mismatch.
 */
const env = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const siteConfig = {
  name: 'DubaiWay',
  shortName: 'DubaiWay',
  tagline: 'Khởi đầu mọi hành trình của bạn',
  description:
    'Tra cứu vé máy bay, khách sạn, tour, visa và sự kiện quốc tế. Nhận tư vấn trực tiếp từ đội ngũ DubaiWay.',
  url: env(process.env.NEXT_PUBLIC_SITE_URL, 'https://dubaiway.com'),
  locale: 'vi_VN',

  contact: {
    whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, '971500000000'),
    hotline: env(process.env.NEXT_PUBLIC_HOTLINE, '+84 90 000 0000'),
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL, 'hello@dubaiway.com'),
    fanpage: env(process.env.NEXT_PUBLIC_FANPAGE_URL, 'https://facebook.com/dubaiway'),
    instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL, 'https://instagram.com/dubaiway'),
    youtube: env(process.env.NEXT_PUBLIC_YOUTUBE_URL, 'https://youtube.com/@dubaiway'),
    officeVN: 'Tầng 12, Toà nhà Central Park, Quận 1, TP. Hồ Chí Minh',
    officeDXB: 'Business Bay, Dubai, UAE',
  },

  partners: {
    flights: [
      env(process.env.NEXT_PUBLIC_PARTNER_FLIGHTS_1, 'https://partner-flights-1.example.com'),
      env(process.env.NEXT_PUBLIC_PARTNER_FLIGHTS_2, 'https://partner-flights-2.example.com'),
      env(process.env.NEXT_PUBLIC_PARTNER_FLIGHTS_3, 'https://partner-flights-3.example.com'),
    ],
    hotels: [
      env(process.env.NEXT_PUBLIC_PARTNER_HOTELS_1, 'https://partner-hotels-1.example.com'),
      env(process.env.NEXT_PUBLIC_PARTNER_HOTELS_2, 'https://partner-hotels-2.example.com'),
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
