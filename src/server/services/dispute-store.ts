/**
 * Huỷ đơn và khiếu nại.
 *
 * Huỷ đơn tính tiền hoàn theo đúng bậc chính sách của dịch vụ và ghi bút toán đảo
 * để thu hồi hoa hồng, doanh thu đối tác và thưởng giới thiệu tương ứng.
 */
import { randomUUID } from 'node:crypto';
import type { Money } from '@/core/money';
import { fromMinorUnits } from '@/core/money';
import { computeRefundAdjustment } from '@/core/pricing';
import { computeCancellationRefund } from './booking-service';
import { cancelBooking, getBookingByReference, type StoredBooking } from './booking-store';

export interface CancellationRecord {
  readonly id: string;
  readonly bookingReference: string;
  readonly requestedBy: string;
  readonly actorRole: 'customer' | 'merchant' | 'admin';
  readonly reason: string;
  readonly refundRateBps: number;
  readonly refundAmountMinor: number;
  readonly commissionReversalMinor: number;
  readonly merchantReversalMinor: number;
  readonly referralReversalMinor: number;
  readonly currency: 'AED';
  readonly createdAt: string;
}

export type DisputeStatus =
  | 'open' | 'under_review' | 'awaiting_customer' | 'awaiting_merchant' | 'resolved' | 'rejected';

export interface DisputeMessage {
  readonly id: string;
  readonly senderId: string;
  readonly senderRole: 'customer' | 'merchant' | 'admin';
  readonly body: string;
  readonly createdAt: string;
}

export interface Dispute {
  readonly id: string;
  readonly reference: string;
  readonly bookingReference: string;
  readonly openedBy: string;
  readonly merchantId: string;
  status: DisputeStatus;
  readonly category: string;
  readonly subject: string;
  readonly description: string;
  resolution: string | null;
  readonly messages: DisputeMessage[];
  readonly createdAt: string;
  resolvedAt: string | null;
}

interface DisputeState {
  cancellations: CancellationRecord[];
  disputes: Dispute[];
}
const g = globalThis as unknown as { __dubaiwayDisputes?: DisputeState };
const state: DisputeState = (g.__dubaiwayDisputes ??= { cancellations: [], disputes: [] });

export class CancellationError extends Error {
  constructor(message: string) { super(message); this.name = 'CancellationError'; }
}

/** Số giờ còn lại tới giờ dịch vụ. Âm nghĩa là đã qua. */
export function hoursUntilService(booking: StoredBooking, now = new Date()): number {
  const start = new Date(`${booking.serviceDate}T${booking.startTime ?? '00:00'}:00`);
  return (start.getTime() - now.getTime()) / 3_600_000;
}

export interface CancellationPreview {
  readonly refundRateBps: number;
  readonly refundAmount: Money;
  readonly hoursLeft: number;
  readonly canCancel: boolean;
  readonly reason: string | null;
}

/** Xem trước số tiền được hoàn TRƯỚC khi khách bấm huỷ — không để khách bất ngờ. */
export function previewCancellation(
  reference: string,
  tiers: readonly { hoursBefore: number; refundBps: number }[],
  now = new Date(),
): CancellationPreview {
  const b = getBookingByReference(reference);
  if (!b) throw new CancellationError('Không tìm thấy đơn hàng');

  const hoursLeft = hoursUntilService(b, now);
  const { rateBps, amount } = computeCancellationRefund(b.financials.customerTotal, tiers, hoursLeft);

  let canCancel = true;
  let reason: string | null = null;
  if (b.status === 'cancelled' || b.status === 'refunded') {
    canCancel = false; reason = 'Đơn này đã được huỷ trước đó.';
  } else if (b.voucher.status === 'redeemed') {
    canCancel = false; reason = 'Voucher đã được sử dụng nên không huỷ được. Nếu có vấn đề, hãy mở khiếu nại.';
  } else if (b.status === 'completed') {
    canCancel = false; reason = 'Đơn đã hoàn thành. Nếu có vấn đề, hãy mở khiếu nại.';
  }

  return { refundRateBps: rateBps, refundAmount: amount, hoursLeft, canCancel, reason };
}

export function cancelWithRefund(input: {
  reference: string;
  requestedBy: string;
  actorRole: 'customer' | 'merchant' | 'admin';
  reason: string;
  tiers: readonly { hoursBefore: number; refundBps: number }[];
  now?: Date;
}): CancellationRecord {
  const b = getBookingByReference(input.reference);
  if (!b) throw new CancellationError('Không tìm thấy đơn hàng');

  const preview = previewCancellation(input.reference, input.tiers, input.now ?? new Date());
  if (!preview.canCancel) throw new CancellationError(preview.reason ?? 'Không huỷ được đơn này');

  // Bút toán đảo: thu hồi hoa hồng, doanh thu đối tác và thưởng theo đúng tỷ lệ hoàn.
  const adj = computeRefundAdjustment(b.financials, preview.refundAmount);
  cancelBooking(input.reference);

  const record: CancellationRecord = {
    id: randomUUID(),
    bookingReference: b.reference,
    requestedBy: input.requestedBy,
    actorRole: input.actorRole,
    reason: input.reason.trim(),
    refundRateBps: preview.refundRateBps,
    refundAmountMinor: preview.refundAmount.amount,
    commissionReversalMinor: adj.commissionReversal.amount,
    merchantReversalMinor: adj.merchantRevenueReversal.amount,
    referralReversalMinor: adj.referralRewardReversal.amount,
    currency: 'AED',
    createdAt: new Date().toISOString(),
  };
  state.cancellations.push(record);
  return record;
}

export function listCancellations(): CancellationRecord[] {
  return [...state.cancellations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCancellation(reference: string): CancellationRecord | null {
  return state.cancellations.find((c) => c.bookingReference === reference) ?? null;
}

export function refundedAmount(reference: string): Money {
  const c = getCancellation(reference);
  return fromMinorUnits(c?.refundAmountMinor ?? 0, 'AED');
}

// ─── KHIẾU NẠI ──────────────────────────────────────────────────────────────
export class DisputeError extends Error {
  constructor(message: string) { super(message); this.name = 'DisputeError'; }
}

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function reference(prefix: string): string {
  let out = '';
  for (let i = 0; i < 6; i += 1) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `${prefix}-${out}`;
}

export function openDispute(input: {
  bookingReference: string;
  openedBy: string;
  category: string;
  subject: string;
  description: string;
}): Dispute {
  const b = getBookingByReference(input.bookingReference);
  if (!b) throw new DisputeError('Không tìm thấy đơn hàng');
  if (b.userId !== input.openedBy) {
    throw new DisputeError('Bạn chỉ khiếu nại được đơn hàng của chính mình');
  }
  // Chưa thanh toán thì chưa có gì để khiếu nại.
  if (b.status === 'draft' || b.status === 'pending_payment') {
    throw new DisputeError('Đơn chưa thanh toán nên chưa mở khiếu nại được');
  }
  if (state.disputes.some((d) => d.bookingReference === input.bookingReference && d.status !== 'resolved' && d.status !== 'rejected')) {
    throw new DisputeError('Đơn này đang có khiếu nại chưa xử lý xong');
  }
  if (input.description.trim().length < 20) {
    throw new DisputeError('Vui lòng mô tả rõ vấn đề, ít nhất 20 ký tự');
  }

  const dispute: Dispute = {
    id: randomUUID(),
    reference: reference('KN'),
    bookingReference: b.reference,
    openedBy: input.openedBy,
    merchantId: b.merchantId,
    status: 'open',
    category: input.category,
    subject: input.subject.trim(),
    description: input.description.trim(),
    resolution: null,
    messages: [],
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  state.disputes.push(dispute);
  return dispute;
}

export function addDisputeMessage(input: {
  disputeId: string;
  senderId: string;
  senderRole: 'customer' | 'merchant' | 'admin';
  body: string;
}): DisputeMessage {
  const d = state.disputes.find((x) => x.id === input.disputeId);
  if (!d) throw new DisputeError('Không tìm thấy khiếu nại');
  if (d.status === 'resolved' || d.status === 'rejected') {
    throw new DisputeError('Khiếu nại đã đóng, không gửi thêm tin nhắn được');
  }
  if (input.body.trim().length < 2) throw new DisputeError('Nội dung quá ngắn');

  const msg: DisputeMessage = {
    id: randomUUID(),
    senderId: input.senderId,
    senderRole: input.senderRole,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  };
  d.messages.push(msg);
  return msg;
}

const DISPUTE_TRANSITIONS: Record<DisputeStatus, readonly DisputeStatus[]> = {
  open: ['under_review', 'rejected'],
  under_review: ['awaiting_customer', 'awaiting_merchant', 'resolved', 'rejected'],
  awaiting_customer: ['under_review', 'resolved', 'rejected'],
  awaiting_merchant: ['under_review', 'resolved', 'rejected'],
  resolved: [],
  rejected: [],
};

export function setDisputeStatus(
  disputeId: string,
  to: DisputeStatus,
  resolution?: string,
): Dispute {
  const d = state.disputes.find((x) => x.id === disputeId);
  if (!d) throw new DisputeError('Không tìm thấy khiếu nại');
  if (!DISPUTE_TRANSITIONS[d.status].includes(to)) {
    throw new DisputeError(`Không chuyển được khiếu nại từ ${d.status} sang ${to}`);
  }
  if ((to === 'resolved' || to === 'rejected') && !resolution?.trim()) {
    throw new DisputeError('Phải ghi kết luận khi đóng khiếu nại');
  }
  d.status = to;
  if (resolution) d.resolution = resolution.trim();
  if (to === 'resolved' || to === 'rejected') d.resolvedAt = new Date().toISOString();
  return d;
}

export function listDisputes(filter?: { userId?: string; merchantId?: string }): Dispute[] {
  let all = [...state.disputes];
  if (filter?.userId) all = all.filter((d) => d.openedBy === filter.userId);
  if (filter?.merchantId) all = all.filter((d) => d.merchantId === filter.merchantId);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDispute(id: string): Dispute | null {
  return state.disputes.find((d) => d.id === id) ?? null;
}

/** Chỉ dùng trong test. */
export function __resetDisputes(): void {
  state.cancellations.length = 0;
  state.disputes.length = 0;
}
