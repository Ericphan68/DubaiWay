import type { HolyLandJourney, HolyLandDetail, ItineraryDay } from '@/types';
import { holyLandJourneys } from './holyland';
import { img, photo, type PhotoKey } from './images';

const galleryByCountry: Record<string, PhotoKey[]> = {
  Israel: ['jerusalem', 'holyland', 'petra'],
  Jordan: ['petra', 'jerusalem', 'egypt'],
  'Ai Cập': ['egypt', 'jerusalem', 'holyland'],
  'Thổ Nhĩ Kỳ': ['cappadocia', 'holyland', 'greece'],
  'Hy Lạp': ['santorini', 'greece', 'rome'],
  Ý: ['vatican', 'rome', 'greece'],
};

function galleryFor(journey: HolyLandJourney): string[] {
  const keys = new Set<PhotoKey>();
  journey.countries.forEach((c) => (galleryByCountry[c] ?? ['holyland']).forEach((k) => keys.add(k)));
  const arr = Array.from(keys);
  return (arr.length ? arr : (['jerusalem', 'holyland'] as PhotoKey[])).map((k) => img(photo[k], 1400));
}

/** Timeline hành trình dựa trên các điểm dừng có ý nghĩa. */
function itineraryFrom(journey: HolyLandJourney): ItineraryDay[] {
  const days: ItineraryDay[] = [
    { day: 1, title: `Khởi hành → ${journey.countries[0]}`, description: 'Tập trung tại sân bay, khởi hành cùng đoàn. Trưởng đoàn hướng dẫn tĩnh nguyện mở đầu hành trình.', meals: 'Ăn trên máy bay' },
  ];
  journey.stops.forEach((stop, i) => {
    days.push({
      day: i + 2,
      title: stop.place,
      description: `${stop.meaning}. Tham quan, cầu nguyện và suy ngẫm tại địa điểm, có hướng dẫn viên am hiểu Kinh Thánh đồng hành.`,
      meals: 'Sáng · Trưa · Tối',
    });
  });
  days.push({
    day: journey.stops.length + 2,
    title: 'Trở về Việt Nam',
    description: 'Chia sẻ cảm nghiệm cuối hành trình, ra sân bay về nước với nhiều ơn phước.',
    meals: 'Ăn sáng',
  });
  return days;
}

const contextByTheme: Record<string, string> = {
  'Theo dấu Chúa Giê-su':
    'Hành trình đi qua những địa danh gắn liền với cuộc đời Chúa Giê-su — từ nơi Giáng sinh ở Bethlehem, thời niên thiếu tại Nazareth, đến sứ vụ bên bờ Biển hồ Galilê và đỉnh điểm là thương khó, phục sinh tại Jerusalem.',
  'Từ Xuất Ê-díp-tô đến Đất Hứa':
    'Tuyến hành trình tái hiện cuộc hành trình vĩ đại của dân Israel: từ Ai Cập cổ đại, băng qua Biển Đỏ, nhận Mười Điều Răn tại núi Sinai, cho tới khi bước vào Đất Hứa.',
  'Hành trình sứ đồ Phao-lô':
    'Theo bước chân sứ đồ Phao-lô và bảy Hội Thánh trong sách Khải Huyền, hành trình đi qua các trung tâm Cơ Đốc giáo sơ khai tại Tiểu Á, nơi đức tin được gieo trồng giữa thế giới Hy-La.',
  'Hành trình truyền giáo & Toà Thánh':
    'Từ Athens và Corinth nơi Phao-lô rao giảng, hành trình khép lại tại Rome và Toà Thánh Vatican — trái tim của Cơ Đốc giáo phương Tây suốt hai thiên niên kỷ.',
};

const authored: Record<string, Partial<HolyLandDetail>> = {};

export function getHolyLandDetail(journey: HolyLandJourney): HolyLandDetail {
  const a = authored[journey.slug] ?? {};
  return {
    gallery: a.gallery ?? galleryFor(journey),
    historicalContext:
      a.historicalContext ??
      contextByTheme[journey.theme] ??
      'Mỗi địa điểm trên hành trình đều mang bối cảnh lịch sử và ý nghĩa thiêng liêng riêng, được hướng dẫn viên và trưởng đoàn diễn giải theo Kinh Thánh.',
    spiritualTheme: a.spiritualTheme ?? journey.theme,
    itinerary: a.itinerary ?? itineraryFrom(journey),
    includes: a.includes ?? [
      'Vé máy bay quốc tế & nội tuyến',
      'Khách sạn 4–5 sao theo chương trình',
      'Ăn ba bữa mỗi ngày',
      'Xe du lịch máy lạnh & vé tham quan',
      'Trưởng đoàn mục vụ & hướng dẫn viên',
      'Hỗ trợ thủ tục nhập cảnh',
    ],
    faqs: a.faqs ?? [
      { question: 'Đoàn có chương trình tĩnh nguyện không?', answer: 'Có. Mỗi ngày đều có giờ tĩnh nguyện, cầu nguyện và suy ngẫm do trưởng đoàn hướng dẫn tại các thánh tích.' },
      { question: 'Tôi cần thể lực thế nào?', answer: 'Hành trình đi bộ vừa phải. Quý khách nên chuẩn bị giày êm, sức khoẻ ổn định và tinh thần sẵn sàng.' },
      { question: 'Có tổ chức đoàn riêng cho hội thánh không?', answer: 'Có. DubaiWay thiết kế đoàn riêng theo chủ đề, ngày khởi hành và số lượng của từng hội thánh.' },
    ],
  };
}

export function getHolyLandBySlug(slug: string): HolyLandJourney | undefined {
  return holyLandJourneys.find((j) => j.slug === slug);
}

export function relatedJourneys(journey: HolyLandJourney, limit = 3): HolyLandJourney[] {
  return holyLandJourneys.filter((j) => j.slug !== journey.slug).slice(0, limit);
}
