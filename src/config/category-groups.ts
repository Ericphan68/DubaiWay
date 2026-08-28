import {
  IconAnchor, IconBed, IconCalendar, IconCamera, IconCar, IconCompass, IconDune,
  IconFerrisWheel, IconGlobe, IconLuggage, IconMapPin, IconPassport, IconPlane,
  IconShield, IconSim, IconTicket, IconUsers, IconUtensils,
} from '@/components/ui/icons';
import type { CategorySummary } from '@/server/repositories/types';
import type { Locale } from '@/i18n';

type IconComponent = typeof IconCompass;

/**
 * Gom 20 danh mục dịch vụ thành các nhóm để bảng "Tất cả danh mục" đọc được.
 *
 * Nhóm chỉ là lớp TRÌNH BÀY. Nguồn danh mục vẫn là kho dữ liệu thật; hàm
 * `groupCategories` bên dưới nhận danh sách đã tải về rồi xếp vào nhóm. Danh mục
 * nào chưa được xếp sẽ rơi vào nhóm cuối, nên khi quản trị viên thêm danh mục
 * mới thì nó vẫn hiện ra chứ không biến mất khỏi bảng.
 */

export interface CategoryGroupDef {
  readonly id: string;
  readonly nameVi: string;
  readonly nameEn: string;
  /** Danh mục thuộc nhóm, theo thứ tự muốn hiển thị. */
  readonly slugs: readonly string[];
}

export const CATEGORY_GROUPS: readonly CategoryGroupDef[] = [
  {
    id: 'tours',
    nameVi: 'Tour & trải nghiệm',
    nameEn: 'Tours & experiences',
    slugs: ['day-tours', 'multi-day-tours', 'dubai-uae-tours', 'pilgrimage-tours', 'desert-safari', 'yacht-cruise', 'tour-guides'],
  },
  {
    id: 'tickets',
    nameVi: 'Vé tham quan & sự kiện',
    nameEn: 'Attractions & events',
    slugs: ['attraction-tickets', 'theme-parks', 'event-tickets'],
  },
  {
    id: 'stay',
    nameVi: 'Lưu trú',
    nameEn: 'Stay',
    slugs: ['hotels-apartments'],
  },
  {
    id: 'transport',
    nameVi: 'Di chuyển',
    nameEn: 'Transport',
    slugs: ['airport-transfer', 'flights'],
  },
  {
    id: 'car-rental',
    nameVi: 'Thuê xe',
    nameEn: 'Car rentals',
    slugs: ['car-rental'],
  },
  {
    id: 'dining',
    nameVi: 'Ăn uống',
    nameEn: 'Dining',
    slugs: ['dining-vouchers'],
  },
  {
    id: 'other',
    nameVi: 'Dịch vụ khác',
    nameEn: 'Other services',
    slugs: ['visa', 'travel-insurance', 'sim-esim', 'photography', 'other-services'],
  },
];

/** Biểu tượng riêng cho từng danh mục. Thiếu thì dùng biểu tượng của nhóm. */
const CATEGORY_ICONS: Record<string, IconComponent> = {
  'day-tours': IconCompass,
  'multi-day-tours': IconLuggage,
  'dubai-uae-tours': IconMapPin,
  'pilgrimage-tours': IconGlobe,
  'desert-safari': IconDune,
  'yacht-cruise': IconAnchor,
  'tour-guides': IconUsers,
  'attraction-tickets': IconTicket,
  'theme-parks': IconFerrisWheel,
  'event-tickets': IconCalendar,
  'hotels-apartments': IconBed,
  'airport-transfer': IconCar,
  flights: IconPlane,
  'car-rental': IconCar,
  'dining-vouchers': IconUtensils,
  visa: IconPassport,
  'travel-insurance': IconShield,
  'sim-esim': IconSim,
  photography: IconCamera,
  'other-services': IconCompass,
};

const GROUP_FALLBACK_ICONS: Record<string, IconComponent> = {
  tours: IconCompass,
  tickets: IconTicket,
  stay: IconBed,
  transport: IconPlane,
  'car-rental': IconCar,
  dining: IconUtensils,
  other: IconCompass,
};

export function categoryIcon(slug: string, groupId: string): IconComponent {
  return CATEGORY_ICONS[slug] ?? GROUP_FALLBACK_ICONS[groupId] ?? IconCompass;
}

export interface GroupedCategory {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly serviceCount?: number;
}

export interface CategoryGroup {
  readonly id: string;
  readonly name: string;
  readonly items: readonly GroupedCategory[];
}

/**
 * Xếp danh mục thật vào nhóm.
 *
 * Nhóm rỗng bị loại bỏ để bảng không hiện tiêu đề trống. Danh mục lạ (chưa khai
 * báo trong CATEGORY_GROUPS) được dồn vào nhóm "Dịch vụ khác" — thà hiện sai
 * nhóm còn hơn để khách không tìm thấy dịch vụ.
 */
export function groupCategories(
  categories: readonly CategorySummary[],
  locale: Locale,
): CategoryGroup[] {
  const byslug = new Map(categories.map((c) => [c.slug, c]));
  const placed = new Set<string>();
  const groups: CategoryGroup[] = [];

  for (const def of CATEGORY_GROUPS) {
    const items: GroupedCategory[] = [];
    for (const slug of def.slugs) {
      const found = byslug.get(slug);
      if (!found) continue; // danh mục bị tắt hoặc chưa có trong kho dữ liệu
      placed.add(slug);
      items.push({ id: found.id, slug: found.slug, name: found.name, serviceCount: found.serviceCount });
    }
    groups.push({ id: def.id, name: locale === 'en' ? def.nameEn : def.nameVi, items });
  }

  const leftovers = categories.filter((c) => !placed.has(c.slug));
  if (leftovers.length > 0) {
    const other = groups.find((g) => g.id === 'other');
    const extra = leftovers.map((c) => ({
      id: c.id, slug: c.slug, name: c.name, serviceCount: c.serviceCount,
    }));
    if (other) {
      groups[groups.indexOf(other)] = { ...other, items: [...other.items, ...extra] };
    } else {
      groups.push({ id: 'other', name: locale === 'en' ? 'Other services' : 'Dịch vụ khác', items: extra });
    }
  }

  return groups.filter((g) => g.items.length > 0);
}
