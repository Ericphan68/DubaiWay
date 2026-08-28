/**
 * Nhãn trạng thái dùng chung cho khu vực khách, đối tác và quản trị.
 * Tách khỏi file page/layout vì Next.js không cho phép layout export thêm thành phần khác.
 */

const BOOKING_STATUS: Record<string, { text: string; cls: string }> = {
  draft:           { text: 'Nháp',           cls: 'bg-mist-200 text-ink-muted' },
  pending_payment: { text: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-800' },
  paid:            { text: 'Đã thanh toán',  cls: 'bg-emerald-50 text-emerald-700' },
  confirmed:       { text: 'Đã xác nhận',    cls: 'bg-emerald-50 text-emerald-700' },
  completed:       { text: 'Đã hoàn thành',  cls: 'bg-royal/[0.08] text-royal' },
  cancelled:       { text: 'Đã huỷ',         cls: 'bg-mist-200 text-ink-soft' },
  refunded:        { text: 'Đã hoàn tiền',   cls: 'bg-mist-200 text-ink-soft' },
  expired:         { text: 'Đã hết hạn',     cls: 'bg-mist-200 text-ink-soft' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = BOOKING_STATUS[status] ?? BOOKING_STATUS.draft;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.text}
    </span>
  );
}

const MERCHANT_STATUS: Record<string, { text: string; cls: string }> = {
  draft:             { text: 'Nháp',           cls: 'bg-mist-200 text-ink-soft' },
  submitted:         { text: 'Đã nộp',         cls: 'bg-amber-50 text-amber-800' },
  under_review:      { text: 'Đang thẩm định', cls: 'bg-amber-50 text-amber-800' },
  changes_requested: { text: 'Cần bổ sung',    cls: 'bg-amber-50 text-amber-800' },
  approved:          { text: 'Đã duyệt',       cls: 'bg-emerald-50 text-emerald-700' },
  rejected:          { text: 'Bị từ chối',     cls: 'bg-red-50 text-red-700' },
  suspended:         { text: 'Đang đình chỉ',  cls: 'bg-red-50 text-red-700' },
};

export function StatusChip({ status }: { status: string }) {
  const s = MERCHANT_STATUS[status] ?? MERCHANT_STATUS.draft;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.text}
    </span>
  );
}
