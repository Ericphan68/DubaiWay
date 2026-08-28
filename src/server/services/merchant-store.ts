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
import {
  getService as catalogGetService, listServices as catalogListServices,
  setServiceStatus as catalogSetStatus,
} from './catalog-store';

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
  readonly currency: 'USD';
  readonly submittedAt: string | null;
  readonly createdAt: string;
}

/**
 * Dịch vụ KHÔNG lưu ở đây. Nguồn sự thật duy nhất là catalog-store — cùng kho mà
 * trang công khai đọc. Nếu giữ hai bản, đối tác sẽ thấy một đằng khách thấy một nẻo.
 */
interface MerchantState {
  merchants: Map<string, MerchantRecord>;
  history: ReviewHistoryEntry[];
  seeded: boolean;
}

const g = globalThis as unknown as { __dubaiwayMerchants?: MerchantState };
const state: MerchantState = (g.__dubaiwayMerchants ??= {
  merchants: new Map(),
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

export interface MerchantRegistrationInput {
  readonly kind: 'business' | 'individual';
  readonly ownerUserId: string;
  readonly displayName: string;
  readonly legalName?: string;
  readonly registrationNumber?: string;
  readonly taxNumber?: string;
  readonly individualFullName?: string;
  readonly nationality?: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly city: string;
  readonly country: string;
  readonly description: string;
  readonly documentNames: readonly string[];
}

function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 50);
}

/**
 * Tạo hồ sơ đối tác ở trạng thái `draft`.
 * Một tài khoản chỉ gắn với một đối tác — tránh trường hợp một người mở nhiều
 * gian hàng để lách quy trình thẩm định.
 */
export function registerMerchant(input: MerchantRegistrationInput): MerchantRecord {
  seed();
  if (getMerchantForUser(input.ownerUserId)) {
    throw new MerchantReviewError('Tài khoản của bạn đã gắn với một hồ sơ đối tác');
  }
  if (input.kind === 'business' && !input.legalName?.trim()) {
    throw new MerchantReviewError('Doanh nghiệp bắt buộc có tên pháp lý');
  }
  if (input.kind === 'individual' && !input.individualFullName?.trim()) {
    throw new MerchantReviewError('Cá nhân bắt buộc có họ tên đầy đủ');
  }
  if (input.description.trim().length < 30) {
    throw new MerchantReviewError('Mô tả cần ít nhất 30 ký tự để đội thẩm định hiểu bạn làm gì');
  }

  const slug = slugify(input.displayName) || `doi-tac-${Date.now()}`;
  let unique = slug;
  let n = 2;
  while ([...state.merchants.values()].some((m) => m.slug === unique)) {
    unique = `${slug}-${n}`; n += 1;
  }

  const now = new Date().toISOString();
  const record: MerchantRecord = {
    id: randomUUID(),
    kind: input.kind,
    status: 'draft',
    slug: unique,
    displayName: input.displayName.trim(),
    legalName: input.legalName?.trim() ?? null,
    registrationNumber: input.registrationNumber?.trim() ?? null,
    taxNumber: input.taxNumber?.trim() ?? null,
    individualFullName: input.individualFullName?.trim() ?? null,
    nationality: input.nationality?.trim().toUpperCase().slice(0, 2) ?? null,
    contactEmail: input.contactEmail.trim(),
    contactPhone: input.contactPhone.trim(),
    city: input.city.trim(),
    country: input.country.trim().toUpperCase().slice(0, 2),
    description: input.description.trim(),
    ownerUserId: input.ownerUserId,
    // Chỉ lưu TÊN file, không lưu nội dung. Bản production đưa file vào kho riêng tư.
    documents: input.documentNames.map((fileName) => ({
      id: randomUUID(),
      docType: fileName.split('.')[0] || 'document',
      fileName,
      status: 'pending' as const,
    })),
    submittedAt: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: now,
  };
  state.merchants.set(record.id, record);
  logHistory({
    targetType: 'merchant', targetId: record.id,
    fromStatus: null, toStatus: 'draft',
    reviewerId: input.ownerUserId, reason: 'Đối tác tạo hồ sơ',
  });
  return record;
}

/** Đối tác nộp hồ sơ cho DubaiWay thẩm định. */
export function submitMerchantForReview(merchantId: string, ownerUserId: string): MerchantRecord {
  seed();
  const m = state.merchants.get(merchantId);
  if (!m) throw new MerchantReviewError('Không tìm thấy hồ sơ');
  if (m.ownerUserId !== ownerUserId) throw new MerchantReviewError('Hồ sơ này không thuộc tài khoản của bạn');
  if (m.documents.length === 0) {
    throw new MerchantReviewError('Cần đính kèm ít nhất một giấy tờ trước khi nộp');
  }
  merchantState.assert(m.status, 'submitted');
  m.status = 'submitted';
  (m as { submittedAt: string | null }).submittedAt = new Date().toISOString();
  logHistory({
    targetType: 'merchant', targetId: merchantId,
    fromStatus: 'draft', toStatus: 'submitted',
    reviewerId: ownerUserId, reason: 'Đối tác nộp hồ sơ',
  });
  return m;
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
    for (const s of catalogListServices({ merchantId })) {
      if (s.status === 'active') {
        catalogSetStatus(s.id, 'inactive');
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
  return catalogListServices(merchantId ? { merchantId } : undefined).map((s) => ({
    id: s.id,
    merchantId: s.merchantId,
    slug: s.slug,
    title: s.i18n.vi.title,
    categorySlug: s.categorySlug,
    status: s.status,
    priceFromMinor: s.packages[0]?.priceAdult.amount ?? 0,
    currency: 'USD' as const,
    submittedAt: s.updatedAt,
    createdAt: s.createdAt,
  }));
}

export function transitionService(
  serviceId: string,
  to: ServiceStatus,
  reviewerId: string,
  reason?: string,
): ServiceRecord {
  seed();
  const s = catalogGetService(serviceId);
  if (!s) throw new MerchantReviewError('Không tìm thấy dịch vụ');

  // Không cho bật dịch vụ khi hồ sơ đối tác chưa được duyệt.
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
  catalogSetStatus(serviceId, to);
  logHistory({ targetType: 'service', targetId: serviceId, fromStatus: from, toStatus: to, reviewerId, reason: reason ?? null });

  return listServices().find((x) => x.id === serviceId) as ServiceRecord;
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
  state.history.length = 0;
  state.seeded = false;
}
