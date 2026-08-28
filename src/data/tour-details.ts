import type { Tour, TourDetail, ItineraryDay, TourReview } from '@/types';
import { img, photo, type PhotoKey } from './images';

/** Gallery mặc định theo vùng để trang chi tiết luôn có ảnh đẹp. */
const galleryByRegion: Record<string, PhotoKey[]> = {
  'Dubai & UAE': ['dubaiSkyline', 'dubaiDesert', 'dubaiMarina', 'abuDhabi', 'burjKhalifa'],
  'Israel & Jordan': ['jerusalem', 'holyland', 'petra', 'egypt'],
  'Thổ Nhĩ Kỳ': ['cappadocia', 'holyland', 'greece'],
  'Hy Lạp': ['santorini', 'greece', 'rome'],
  'Ý & Vatican': ['vatican', 'rome', 'greece'],
  'Ai Cập': ['egypt', 'jerusalem', 'petra'],
  'Việt Nam': ['hoiAn', 'vietnam', 'beach'],
};

function galleryFor(tour: Tour): string[] {
  const keys = galleryByRegion[tour.destination] ?? ['airplane', 'luxuryHotel', 'beach'];
  return keys.map((k) => img(photo[k], 1400));
}

/** Sinh lịch trình mẫu hợp lý theo số ngày khi tour chưa có bản viết tay. */
function defaultItinerary(tour: Tour): ItineraryDay[] {
  const n = tour.durationDays;
  const days: ItineraryDay[] = [];
  const fromVn = tour.mode === 'from-vietnam';

  for (let d = 1; d <= n; d++) {
    if (d === 1) {
      days.push({
        day: 1,
        title: fromVn ? `Khởi hành ${tour.departureFrom[0]} → ${tour.destination}` : `Đón khách & bắt đầu ${tour.destination}`,
        description: fromVn
          ? 'Tập trung tại sân bay, làm thủ tục và khởi hành. Trưởng đoàn DubaiWay đồng hành cùng quý khách.'
          : 'Đón tại điểm hẹn, gặp hướng dẫn viên và bắt đầu hành trình khám phá.',
        meals: fromVn ? 'Ăn trên máy bay' : 'Ăn trưa',
      });
    } else if (d === n) {
      days.push({
        day: n,
        title: fromVn ? `${tour.destination} → ${tour.departureFrom[0]}` : 'Kết thúc hành trình',
        description: 'Tự do mua sắm, ra sân bay và chia tay. Hẹn gặp lại quý khách trong những hành trình tiếp theo.',
        meals: 'Ăn sáng',
      });
    } else {
      days.push({
        day: d,
        title: `Ngày ${d}: Khám phá ${tour.destination}`,
        description: `Tham quan các điểm nổi bật: ${tour.highlights[(d - 1) % tour.highlights.length]}. Nghỉ ngơi và trải nghiệm ẩm thực địa phương.`,
        meals: 'Sáng · Trưa · Tối',
      });
    }
  }
  return days;
}

/**
 * Đã gỡ đánh giá mẫu: những người này không có thật.
 * Đánh giá thật chỉ đến từ khách đã hoàn thành booking.
 */
const defaultReviews: TourReview[] = [];

/** Bản viết tay cho các tour tiêu biểu (ưu tiên khi có). */
const authored: Record<string, Partial<TourDetail>> = {
  'dubai-abu-dhabi-6n5d-tu-tphcm': {
    itinerary: [
      { day: 1, title: 'TP.HCM → Dubai', description: 'Tập trung tại sân bay Tân Sơn Nhất, khởi hành đi Dubai trên chuyến bay Emirates. Nghỉ đêm trên máy bay.', meals: 'Ăn trên máy bay' },
      { day: 2, title: 'Dubai City Tour', description: 'Đến Dubai, tham quan Dubai Frame, khu phố cổ Al Fahidi, Palm Jumeirah và checkin Atlantis. Tối ngắm nhạc nước Dubai Mall.', meals: 'Trưa · Tối' },
      { day: 3, title: 'Burj Khalifa & Desert Safari', description: 'Lên đài quan sát Burj Khalifa tầng 124. Chiều tham gia safari sa mạc, cưỡi lạc đà và tiệc BBQ dưới sao.', meals: 'Sáng · Trưa · Tối' },
      { day: 4, title: 'Abu Dhabi', description: 'Khởi hành đi Abu Dhabi, tham quan Grand Mosque, Qasr Al Watan và Louvre Abu Dhabi.', meals: 'Sáng · Trưa · Tối' },
      { day: 5, title: 'Du thuyền Marina & mua sắm', description: 'Sáng tự do nghỉ dưỡng. Chiều du thuyền Dubai Marina, tối mua sắm tại Dubai Mall.', meals: 'Sáng · Trưa' },
      { day: 6, title: 'Dubai → TP.HCM', description: 'Làm thủ tục ra sân bay, về lại TP.HCM, kết thúc hành trình.', meals: 'Sáng' },
    ],
    hotels: 'Khách sạn 5 sao trung tâm Dubai (hoặc tương đương), 2 khách/phòng.',
    meals: 'Theo chương trình, gồm buffet sáng tại khách sạn và bữa BBQ sa mạc.',
    transport: 'Xe đời mới máy lạnh, vé máy bay khứ hồi Emirates hạng phổ thông.',
    visa: 'Bao gồm visa UAE (DubaiWay xử lý hồ sơ).',
    faqs: [
      { question: 'Tour đã bao gồm visa UAE chưa?', answer: 'Đã bao gồm. Quý khách chỉ cần cung cấp hộ chiếu và ảnh theo hướng dẫn, DubaiWay lo phần còn lại.' },
      { question: 'Thời tiết Dubai thế nào?', answer: 'Nóng và khô. Nên mang kem chống nắng, kính râm và trang phục nhẹ; buổi tối sa mạc có thể mát hơn.' },
      { question: 'Có phù hợp cho trẻ em không?', answer: 'Rất phù hợp gia đình. Có chính sách giá trẻ em và nhiều hoạt động hợp trẻ nhỏ.' },
    ],
  },
  'israel-jordan-hanh-huong-9n8d': {
    hotels: 'Khách sạn 4–5 sao tại Jerusalem, Galilee và Amman.',
    meals: 'Ăn ba bữa theo chương trình, có bữa đặc sản địa phương.',
    transport: 'Vé máy bay quốc tế, xe du lịch máy lạnh, phà/di chuyển nội tuyến.',
    visa: 'Hỗ trợ thủ tục nhập cảnh Israel & Jordan theo quy định hiện hành.',
    faqs: [
      { question: 'Đoàn có trưởng đoàn mục vụ không?', answer: 'Có. Mỗi đoàn hành hương đều có trưởng đoàn hướng dẫn tĩnh nguyện và hướng dẫn viên am hiểu Kinh Thánh.' },
      { question: 'Thể lực cần thiết ra sao?', answer: 'Hành trình đi bộ vừa phải tại các thánh tích. Quý khách nên chuẩn bị giày êm và sức khoẻ ổn định.' },
    ],
  },
};

const defaultIncludes = [
  'Vé máy bay khứ hồi (với tour trọn gói từ Việt Nam)',
  'Khách sạn theo tiêu chuẩn chương trình',
  'Các bữa ăn theo lịch trình',
  'Xe đưa đón và tham quan',
  'Hướng dẫn viên & trưởng đoàn',
  'Vé tham quan theo chương trình',
];

const defaultExcludes = [
  'Chi tiêu cá nhân, đồ uống ngoài chương trình',
  'Tiền tip cho hướng dẫn viên & tài xế',
  'Chi phí phát sinh do thay đổi lịch trình bất khả kháng',
  'Bảo hiểm nâng cao (có thể mua thêm)',
];

/** Trả về nội dung chi tiết đầy đủ cho một tour (ưu tiên bản viết tay). */
export function getTourDetail(tour: Tour): TourDetail {
  const a = authored[tour.slug] ?? {};
  return {
    gallery: a.gallery ?? galleryFor(tour),
    videoUrl: a.videoUrl,
    itinerary: a.itinerary ?? defaultItinerary(tour),
    hotels: a.hotels ?? 'Khách sạn tiêu chuẩn tương ứng phân khúc tour, 2 khách/phòng.',
    meals: a.meals ?? 'Các bữa ăn theo lịch trình chi tiết từng ngày.',
    transport: a.transport ?? 'Xe du lịch máy lạnh; vé máy bay với tour trọn gói.',
    visa: a.visa ?? 'DubaiWay tư vấn và hỗ trợ hồ sơ visa phù hợp hành trình.',
    includes: a.includes ?? defaultIncludes,
    excludes: a.excludes ?? defaultExcludes,
    childPolicy:
      a.childPolicy ??
      'Trẻ em dưới 2 tuổi tính phí em bé; 2–11 tuổi áp dụng giá trẻ em; từ 12 tuổi tính như người lớn. Chi tiết theo từng ngày khởi hành.',
    cancellationPolicy:
      a.cancellationPolicy ??
      'Huỷ trước 30 ngày: phí nhẹ. Huỷ 15–29 ngày: phí một phần. Huỷ dưới 15 ngày hoặc no-show: theo điều kiện vé và dịch vụ đã đặt.',
    faqs: a.faqs ?? [
      { question: 'Giá đã bao gồm những gì?', answer: 'Xem mục “Bao gồm / Không bao gồm”. Mọi giá là giá tham khảo, xác nhận khi đặt.' },
      { question: 'Tôi cần đặt trước bao lâu?', answer: 'Nên đặt sớm 3–6 tuần để đảm bảo chỗ và giá tốt, đặc biệt vào mùa cao điểm.' },
    ],
    reviews: a.reviews ?? defaultReviews,
  };
}
