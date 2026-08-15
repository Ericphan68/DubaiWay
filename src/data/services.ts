/** Dịch vụ bổ trợ — phân bổ vào đúng trang liên quan, không nhồi lên menu chính. */
export const supportServices = [
  { slug: 'airport-transfer', name: 'Airport Transfer', group: 'Di chuyển', summary: 'Đón tiễn sân bay riêng, xe đời mới, tài xế đúng giờ.' },
  { slug: 'chauffeur', name: 'Chauffeur', group: 'Di chuyển', summary: 'Tài xế riêng theo giờ hoặc trọn ngày cho hành trình linh hoạt.' },
  { slug: 'private-car', name: 'Private Car & Coach', group: 'Di chuyển', summary: 'Xe riêng 4–45 chỗ cho khách lẻ và đoàn.' },
  { slug: 'car-rental', name: 'Car Rental', group: 'Di chuyển', summary: 'Thuê xe tự lái tại điểm đến với bảo hiểm đầy đủ.' },
  { slug: 'cruise', name: 'Cruise & Du thuyền', group: 'Trải nghiệm', summary: 'Đặt du thuyền và tàu biển, từ dạo vịnh đến hải trình dài.' },
  { slug: 'insurance', name: 'Bảo hiểm du lịch', group: 'An tâm', summary: 'Gói bảo hiểm quốc tế đáp ứng yêu cầu visa và y tế.' },
  { slug: 'esim', name: 'SIM / eSIM', group: 'An tâm', summary: 'Kết nối data ngay khi hạ cánh, kích hoạt trước chuyến đi.' },
  { slug: 'guide', name: 'Hướng dẫn viên & Phiên dịch', group: 'Đồng hành', summary: 'HDV tiếng Việt và phiên dịch chuyên đề tại điểm đến.' },
  { slug: 'attraction-tickets', name: 'Vé tham quan', group: 'Trải nghiệm', summary: 'Vé điểm đến, công viên và show diễn với giá tham khảo tốt.' },
  { slug: 'dining', name: 'Nhà hàng & bữa ăn đoàn', group: 'Trải nghiệm', summary: 'Đặt bàn nhà hàng và set menu cho đoàn lớn.' },
  { slug: 'photographer', name: 'Photographer', group: 'Đồng hành', summary: 'Nhiếp ảnh gia đồng hành lưu giữ khoảnh khắc hành trình.' },
  { slug: 'fast-track', name: 'Fast Track & Lounge', group: 'Ưu tiên', summary: 'Ưu tiên sân bay, meet & greet và phòng chờ hạng thương gia.' },
];

/** Nhóm dịch vụ trong DubaiWay Signature (luxury). */
export const signatureServices = [
  'Vé thương gia & hạng nhất', 'Khách sạn 5 sao', 'Private Tour', 'Chauffeur riêng',
  'Du thuyền riêng', 'VIP Airport', 'Private Guide', 'Bespoke Itinerary',
  'Visa Concierge', 'Dịch vụ ưu tiên 24/7',
];
