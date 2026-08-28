/**
 * Hồ sơ Merchant và dịch vụ chờ duyệt.
 *
 * Mọi chuyển trạng thái đi qua máy trạng thái trong src/core/state-machines.ts,
 * và ghi lại lịch sử duyệt (bất biến) để sau này truy được ai duyệt, lúc nào, vì sao.
 */
import { randomUUID } from 'node:crypto';
import {
  type MerchantStatus, type ServiceStatus, canPublishService, merchantState, serviceState,
} from '@/core/state-machines';

export interface MerchantDocument {
  readonly id: string;
  readonly docType: string;
  readonly fileName: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface MerchantRecord {
  readonly id: string;
  readonly kind: 'business' | 'individual';
  status: MerchantStatus;
  readonly slug: string;
  readonly displayName: string;
  readonly legalName: string | null;
  readonly registrationNumber: string | null;
  readonly taxNumber: string | null;
  readonly individualFullName: string | null;
  readonly nationality: string | null;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly city: string;
  readonly country: string;
  readonly description: string;
  readonly ownerUserId: string;
  readonly documents: MerchantDocument[];
  readonly submittedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  readonly createdAt: string;
}

export interface ReviewHistoryEntry {
  readonly id: string;
  readonly targetType: 'merchant' | 'service';
  readonly targetId: string;
  readonly fromStatus: string | null;
  readonly toStatus: string;
  readonly reviewerId: string;
  readonly reason: string | null;
  readonly at: string;
}

export interface ServiceRecord {
  readonly id: string;
  readonly merchantId: string;
  readonly slug: string;
  readonly title: string;
  readonly categorySlug: string;
  status: ServiceStatus;
  readonly priceFromMinor: number;
  readonly currency: 'AED';
  readonly submittedAt: string | null;
  readonly createdAt: string;
}

interface MerchantState {
  merchants: Map<string, MerchantRecord>;
  services: Map<string, ServiceRecord>;
  history: ReviewHistoryEntry[];
  seeded: boolean;
}

const g = globalThis as unknown as { __dubaiwayMerchants?: MerchantState };
const state: MerchantState = (g.__dubaiwayMerchants ??= {
  merchants: new Map(),
  services: new Map(),
  history: [],
  seeded: false,
});

/** Dữ liệu khởi tạo khớp với supabase/seed.sql. */
function seed(): void {
  if (state.seeded) return;
  state.seeded = true;

  const now = new Date().toISOString();

  state.merchants.set('e0000000-0000-4000-8000-000000000001', {
    id: 'e0000000-0000-4000-8000-000000000001',
    kind: 'business',
    status: 'approved',
    slug: 'desert-rose-tourism',
    displayName: 'Desert Rose Dubai',
    legalName: 'Desert Rose Tourism LLC',
    registrationNumber: 'CN-1234567',
    taxNumber: '100234567800003',
    individualFullName: null,
    nationality: null,
    contactEmail: 'booking@desertrose.example.test',
    contactPhone: '+971500000011',
    city: 'Dubai',
    country: 'AE',
    description: 'Đơn vị lữ hành nội địa tại Dubai từ 2015, chuyên safari sa mạc, city tour và du thuyền Marina.',
    ownerUserId: 'b0000000-0000-4000-8000-000000000001',
    documents: [
      { id: randomUUID(), docType: 'trade_license', fileName: 'trade-license.pdf', status: 'verified' },
      { id: randomUUID(), docType: 'tourism_license', fileName: 'dtcm-license.pdf', status: 'verified' },
      { id: randomUUID(), docType: 'tax_cert', fileName: 'vat-certificate.pdf', status: 'verified' },
    ],
    submittedAt: now,
    approvedAt: now,
    rejectionReason: null,
    createdAt: now,
  });

  state.merchants.set('e0000000-0000-4000-8000-000000000002', {
    id: 'e0000000-0000-4000-8000-000000000002',
    kind: 'individual',
    status: 'under_review',
    slug: 'omar-private-guide',
    displayName: 'Omar Haddad',
    legalName: null,
    registrationNumber: null,
    taxNumber: null,
    individualFullName: 'Omar Haddad',
    nationality: 'JO',
    contactEmail: 'omar.guide@example.test',
    contactPhone: '+971500000012',
    city: 'Dubai',
    country: 'AE',
    description: 'Hướng dẫn viên tự do 8 năm tại Dubai, nói tiếng Anh, Ả Rập và tiếng Việt cơ bản.',
    ownerUserId: 'b0000000-0000-4000-8000-000000000002',
    documents: [
      { id: randomUUID(), docType: 'passport', fileName: 'passport.pdf', status: 'pending' },
      { id: randomUUID(), docType: 'emirates_id', fileName: 'emirates-id.pdf', status: 'pending' },
    ],
    submittedAt: now,
    approvedAt: null,
    rejectionReason: null,
    createdAt: now,
  });

  const services: Array<[string, string, string, string, number, ServiceStatus]> = [
    ['f0000000-0000-4000-8000-000000000001', 'evening-desert-safari-bbq',      'Safari sa mạc buổi chiều kèm tiệc BBQ', 'desert-safari',      15000, 'active'],
    ['f0000000-0000-4000-8000-000000000002', 'burj-khalifa-124-125-floor',     'Vé Burj Khalifa tầng 124 & 125',       'attraction-tickets', 17900, 'active'],
    ['f0000000-0000-4000-8000-000000000003', 'dubai-marina-luxury-yacht',      'Thuê du thuyền riêng Dubai Marina',     'yacht-cruise',       45000, 'active'],
    ['f0000000-0000-4000-8000-000000000004', 'dxb-airport-transfer-private',   'Đưa đón sân bay Dubai (DXB)',           'airport-transfer',   12000, 'active'],
    ['f0000000-0000-4000-8000-000000000005', 'abu-dhabi-full-day-tour',        'Tour Abu Dhabi trọn ngày',              'day-tours',          28000, 'active'],
    ['f0000000-0000-4000-8000-000000000006', 'pierchic-seafood-dinner-voucher','Voucher hải sản Pierchic',              'dining-vouchers',    39000, 'active'],
    // Một dịch vụ đang chờ duyệt để thử luồng xét duyệt
    ['f0000000-0000-4000-8000-000000000007', 'hot-air-balloon-sunrise',        'Khinh khí cầu ngắm bình minh sa mạc',   'day-tours',          109500, 'under_review'],
  ];

  for (const [id, slug, title, categorySlug, price, status] of services) {
    state.services.set(id, {
      id, merchantId: 'e0000000-0000-4000-8000-000000000001',
      slug, title, categorySlug, status,
      priceFromMinor: price, currency: 'AED',
      submittedAt: now, createdAt: now,
    });
  }
}

function logHistory(entry: Omit<ReviewHistoryEntry, 'id' | 'at'>): void {
  state.history.push({ ...entry, id: randomUUID(), at: new Date().toISOString() });
}

export function listMerchants(): MerchantRecord[] {
  seed();
  return [...state.merchants.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getMerchant(id: string): MerchantRecord | null {
  seed();
  return state.merchants.get(id) ?? null;
}

export function getMerchantForUser(userId: string): MerchantRecord | null {
  seed();
  return [...state.merchants.values()].find((m) => m.ownerUserId === userId) ?? null;
}

export class MerchantReviewError extends Error {
  constructor(message: string) { super(message); this.name = 'MerchantReviewError'; }
}

/** Chuyển trạng thái hồ sơ merchant. Máy trạng thái chặn mọi bước nhảy không hợp lệ. */
export function transitionMerchant(
  merchantId: string,
  to: MerchantStatus,
  reviewerId: string,
  reason?: string,
): MerchantRecord {
  seed();
  const m = state.merchants.get(merchantId);
  if (!m) throw new MerchantReviewError('Không tìm thấy hồ sơ merchant');

  merchantState.assert(m.status, to);
  const from = m.status;
  m.status = to;
  if (to === 'approved') { m.approvedAt = new Date().toISOString(); m.rejectionReason = null; }
  if (to === 'rejected') m.rejectionReason = reason ?? null;

  logHistory({ targetType: 'merchant', targetId: merchantId, fromStatus: from, toStatus: to, reviewerId, reason: reason ?? null });

  // Merchant bị đình chỉ hoặc từ chối thì mọi dịch vụ của họ dừng công khai.
  if (to === 'suspended' || to === 'rejected') {
    for (const s of state.services.values()) {
      if (s.merchantId === merchantId && s.status === 'active') {
        s.status = 'inactive';
        logHistory({
          targetType: 'service', targetId: s.id, fromStatus: 'active', toStatus: 'inactive',
          reviewerId, reason: `Merchant chuyển sang ${to}`,
        });
      }
    }
  }
  return m;
}

export function listServices(merchantId?: string): ServiceRecord[] {
  seed();
  const all = [...state.services.values()];
  return (merchantId ? all.filter((s) => s.merchantId === merchantId) : all)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function transitionService(
  serviceId: string,
  to: ServiceStatus,
  reviewerId: string,
  reason?: string,
): ServiceRecord {
  seed();
  const s = state.services.get(serviceId);
  if (!s) throw new MerchantReviewError('Không tìm thấy dịch vụ');

  // Không cho bật dịch vụ khi merchant chưa được duyệt.
  if (to === 'active') {
    const m = state.merchants.get(s.merchantId);
    if (!m || !canPublishService(m.status, 'active')) {
      throw new MerchantReviewError(
        'Không thể công khai dịch vụ: hồ sơ merchant chưa được duyệt hoặc đang bị đình chỉ',
      );
    }
  }

  serviceState.assert(s.status, to);
  const from = s.status;
  s.status = to;
  logHistory({ targetType: 'service', targetId: serviceId, fromStatus: from, toStatus: to, reviewerId, reason: reason ?? null });
  return s;
}

export function listHistory(targetId?: string): ReviewHistoryEntry[] {
  seed();
  return state.history
    .filter((h) => !targetId || h.targetId === targetId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** Chỉ dùng trong test. */
export function __resetMerchants(): void {
  state.merchants.clear();
  state.services.clear();
  state.history.length = 0;
  state.seeded = false;
}
