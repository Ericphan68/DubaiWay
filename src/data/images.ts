/**
 * Ảnh demo lấy từ Unsplash (remote, tối ưu qua next/image).
 * Tập trung ID ở một nơi để sau này thay bằng ảnh thật của DubaiWay rất dễ:
 * chỉ cần đổi map bên dưới, mọi trang tự cập nhật.
 */

const UNSPLASH = 'https://images.unsplash.com';

/** Dựng URL ảnh theo ID + kích thước mong muốn. */
export function img(id: string, w = 1200, q = 80): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/** Thư viện ID ảnh theo chủ đề (dễ đọc, dễ thay). */
export const photo = {
  dubaiSkyline: 'photo-1512453979798-5ea266f8880c',
  dubaiMarina: 'photo-1518684079-3c830dcef090',
  dubaiDesert: 'photo-1506645728556-ac574e628eca',
  dubaiFrame: 'photo-1546412414-e1885259563a',
  burjKhalifa: 'photo-1526495124232-a04e1849168c',
  abuDhabi: 'photo-1512632578888-169bbbc64f33',
  airplane: 'photo-1436491865332-7a61a109cc05',
  airplaneWindow: 'photo-1540339832862-474599807836',
  businessClass: 'photo-1592985684811-6c0f98adb014',
  jerusalem: 'photo-1529079875474-0a66a1f176d0',
  // Hero trang chủ: Rome & Thánh đường Thánh Phêrô (Vatican) nhìn từ cầu Sant'Angelo lúc hoàng hôn.
  heroImage: 'photo-1765985268464-fa7de90ac2c1',
  holyland: 'photo-1529079688486-feaa9f516c9a',
  petra: 'photo-1579606032821-4e6161c81bd3',
  egypt: 'photo-1539768942893-daf53e448371',
  cappadocia: 'photo-1631152282084-b8f1b380ccab',
  santorini: 'photo-1570077188670-e3a8d69ac5ff',
  rome: 'photo-1552832230-c0197dd311b5',
  vatican: 'photo-1531572753322-ad063cecc140',
  greece: 'photo-1503152394-c571994fd383',
  luxuryHotel: 'photo-1566073771259-6a8506099945',
  hotelPool: 'photo-1571003123894-1f0594d2b5d9',
  hotelRoom: 'photo-1611892440504-42a792e24d32',
  resort: 'photo-1520250497591-112f2f40a3f4',
  yacht: 'photo-1567899378494-47b22a2ae96a',
  beach: 'photo-1507525428034-b723cf961d3e',
  vietnam: 'photo-1528127269322-539801943592',
  hoiAn: 'photo-1559592413-7cec4d0cae2b',
  thailand: 'photo-1528181304800-259b08848526',
  bangkok: 'photo-1508009603885-50cf7c579365',
  event: 'photo-1519671482749-fd09be7ccebf',
  gala: 'photo-1492684223066-81342ee5ff30',
  conference: 'photo-1505373877841-8d25f7d46678',
  wedding: 'photo-1519741497674-611481863552',
  concert: 'photo-1470229722913-7c0e2dbbafd3',
  chauffeur: 'photo-1503376780353-7e6692767b70',
  guide: 'photo-1488646953014-85cb44e25828',
  visa: 'photo-1569098644584-210bcd375b59',
  europe: 'photo-1499856871958-5b9627545d1a',
  team: 'photo-1522071820081-009f0129c71c',
} as const;

export type PhotoKey = keyof typeof photo;
