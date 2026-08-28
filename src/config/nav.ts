/**
 * Cấu trúc điều hướng chính + mega menu.
 * Thay đổi menu ở đây, mọi nơi (header, footer, mobile) tự cập nhật.
 */

export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  heading: string;
  children: NavChild[];
}

export interface NavItem {
  /** Nhãn tiếng Việt — dùng khi chưa có bản dịch cho ngôn ngữ đang chọn. */
  label: string;
  /** Khoá tra trong từ điển i18n (dictionary.nav). Thiếu thì dùng `label`. */
  labelKey?: 'travel' | 'flightsHotels' | 'visa' | 'events' | 'explore' | 'guide' | 'about' | 'contact';
  href: string;
  /** Mega menu nhiều cột (Du lịch, Vé & Khách sạn, Events). */
  megaMenu?: NavGroup[];
  /** Ảnh + slogan hiển thị ở cột phải mega menu. */
  feature?: { title: string; description: string; href: string; image: string };
}

export const mainNav: NavItem[] = [
  {
    label: 'Du lịch',
    labelKey: 'travel',
    href: '/du-lich',
    megaMenu: [
      {
        heading: 'Theo cách khởi hành',
        children: [
          { label: 'Tour khởi hành từ Việt Nam', href: '/du-lich/tu-viet-nam', description: 'Trọn gói gồm vé, visa, khách sạn' },
          { label: 'Tour tại điểm đến', href: '/du-lich/tai-diem-den', description: 'Khách tự bay, ghép đoàn địa phương' },
          { label: 'Tour ghép', href: '/du-lich?format=join' },
          { label: 'Tour đoàn riêng', href: '/du-lich?format=private-group' },
          { label: 'Private Tour', href: '/du-lich?format=individual' },
        ],
      },
      {
        heading: 'Theo nhóm khách',
        children: [
          { label: 'Tour gia đình', href: '/du-lich?format=family' },
          { label: 'Tour doanh nghiệp', href: '/du-lich?format=corporate' },
          { label: 'Tour hành hương', href: '/holy-land', description: 'DubaiWay Holy Land Journeys' },
          { label: 'Dubai Experiences', href: '/dubai' },
          { label: 'Tour Luxury', href: '/du-lich?segment=luxury' },
        ],
      },
    ],
    feature: {
      title: 'DubaiWay Signature',
      description: 'Hành trình luxury thiết kế riêng, dịch vụ ưu tiên từ đầu đến cuối.',
      href: '/signature',
      image:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
    },
  },
  {
    label: 'Vé & Khách sạn',
    labelKey: 'flightsHotels',
    href: '/ve-may-bay',
    megaMenu: [
      {
        heading: 'Bay',
        children: [
          { label: 'Vé máy bay', href: '/ve-may-bay', description: 'So sánh giá từ nhiều nền tảng' },
          { label: 'Vé thương gia & hạng nhất', href: '/ve-may-bay#business' },
          { label: 'Combo vé + khách sạn', href: '/khach-san#combo' },
        ],
      },
      {
        heading: 'Lưu trú & di chuyển',
        children: [
          { label: 'Khách sạn', href: '/khach-san' },
          { label: 'Khách sạn cho đoàn & sự kiện', href: '/khach-san#groups' },
          { label: 'Đưa đón sân bay', href: '/danh-muc/airport-transfer' },
          { label: 'Thuê xe', href: '/danh-muc/car-rental' },
          { label: 'Bảo hiểm du lịch', href: '/danh-muc/travel-insurance' },
        ],
      },
    ],
    feature: {
      title: 'Vé thương gia giá tốt',
      description: 'Gửi hành trình, đội DubaiWay săn giá khoang thương gia & hạng nhất cho bạn.',
      href: '/ve-may-bay#business',
      image:
        'https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=900&q=80',
    },
  },
  { label: 'Visa', labelKey: 'visa', href: '/visa' },
  {
    label: 'Events',
    labelKey: 'events',
    href: '/events',
    megaMenu: [
      {
        heading: 'Doanh nghiệp',
        children: [
          { label: 'Corporate Events', href: '/events/corporate-events' },
          { label: 'Conferences & MICE', href: '/events/mice' },
          { label: 'Product Launch', href: '/events/product-launch' },
          { label: 'Exhibition & Roadshow', href: '/events/exhibition' },
          { label: 'Business Delegation', href: '/events/business-delegation' },
        ],
      },
      {
        heading: 'Trải nghiệm & cộng đồng',
        children: [
          { label: 'Gala Dinner & Award', href: '/events/gala-dinner' },
          { label: 'Church Events', href: '/events/church-events' },
          { label: 'Destination Wedding', href: '/events/destination-wedding' },
          { label: 'Team Building', href: '/events/team-building' },
          { label: 'Concert & Stage Support', href: '/events/concert-stage' },
        ],
      },
    ],
    feature: {
      title: 'Events theo quốc gia',
      description: 'Dubai · Việt Nam · Thái Lan — đội ngũ tại chỗ, quy trình trọn gói.',
      href: '/events/dubai',
      image:
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80',
    },
  },
  { label: 'Khám phá', labelKey: 'explore', href: '/danh-muc' },
  { label: 'Cẩm nang', labelKey: 'guide', href: '/cam-nang' },
  { label: 'Về DubaiWay', labelKey: 'about', href: '/ve-dubaiway' },
  { label: 'Liên hệ', labelKey: 'contact', href: '/lien-he' },
];

/**
 * Điều hướng đáy cho mobile.
 * Bỏ "Trang chủ" theo yêu cầu — logo ở header đã dẫn về trang chủ.
 */
export const bottomNav = [
  { label: 'Khám phá', labelKey: 'explore' as const, href: '/danh-muc', icon: 'compass' as const },
  { label: 'Tìm kiếm', labelKey: 'search' as const, href: '/tim-kiem', icon: 'search' as const },
  { label: 'Visa', labelKey: 'visa' as const, href: '/visa', icon: 'passport' as const },
  { label: 'Tài khoản', labelKey: 'account' as const, href: '/tai-khoan', icon: 'user' as const },
  { label: 'WhatsApp', labelKey: 'whatsapp' as const, href: '#whatsapp', icon: 'whatsapp' as const },
];

export const footerNav: NavGroup[] = [
  {
    heading: 'Du lịch',
    children: [
      { label: 'Tour từ Việt Nam', href: '/du-lich/tu-viet-nam' },
      { label: 'Tour tại điểm đến', href: '/du-lich/tai-diem-den' },
      { label: 'DubaiWay Holy Land', href: '/holy-land' },
      { label: 'Dubai Experiences', href: '/dubai' },
      { label: 'DubaiWay Signature', href: '/signature' },
    ],
  },
  {
    heading: 'Dịch vụ',
    children: [
      { label: 'Vé máy bay', href: '/ve-may-bay' },
      { label: 'Khách sạn', href: '/khach-san' },
      { label: 'Visa', href: '/visa' },
      { label: 'DubaiWay Events', href: '/events' },
      { label: 'Tất cả dịch vụ', href: '/dich-vu' },
    ],
  },
  {
    heading: 'DubaiWay',
    children: [
      { label: 'Về chúng tôi', href: '/ve-dubaiway' },
      { label: 'Trở thành đối tác', href: '/tro-thanh-doi-tac' },
      { label: 'Giới thiệu bạn bè', href: '/gioi-thieu-ban-be' },
      { label: 'Trung tâm trợ giúp', href: '/tro-giup' },
      { label: 'Cẩm nang du lịch', href: '/cam-nang' },
      { label: 'Liên hệ', href: '/lien-he' },
    ],
  },
  {
    heading: 'Pháp lý',
    children: [
      { label: 'Điều khoản sử dụng', href: '/dieu-khoan' },
      { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
      { label: 'Chính sách cookie', href: '/chinh-sach-cookie' },
      { label: 'Huỷ & hoàn tiền', href: '/chinh-sach-huy-hoan-tien' },
      { label: 'Điều khoản đối tác', href: '/dieu-khoan-doi-tac' },
      { label: 'Điều khoản giới thiệu', href: '/dieu-khoan-gioi-thieu' },
    ],
  },
];
