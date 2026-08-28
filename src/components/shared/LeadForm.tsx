'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';
import { formatLead, mailtoUrl, readForm, whatsappUrl, type LeadField } from '@/lib/lead';
import { siteConfig } from '@/config/site';

export interface LeadFieldSpec {
  readonly name: string;
  readonly label: string;
}

/**
 * Khung form gửi yêu cầu tư vấn.
 *
 * Bấm gửi sẽ mở WhatsApp kèm sẵn nội dung khách vừa điền. Nếu trình duyệt chặn
 * cửa sổ mới, khách vẫn thấy link dự phòng để bấm tay và một link gửi qua email —
 * không có đường nào khiến yêu cầu biến mất trong im lặng.
 */
export function LeadForm({
  title, subject, fields, children, submitLabel = 'Gửi yêu cầu', className,
}: {
  /** Mô tả ngắn điền vào câu "Tôi muốn …". */
  title: string;
  subject: string;
  fields: readonly LeadFieldSpec[];
  children: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [sent, setSent] = useState<{ message: string } | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values: LeadField[] = readForm(e.currentTarget, fields);
    const message = formatLead(title, values);
    setSent({ message });
    // Mở WhatsApp ở tab mới. Bị chặn cũng không sao — link dự phòng hiện ngay bên dưới.
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  }

  if (sent) {
    return (
      <div className={className}>
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <IconCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Đã chuyển yêu cầu của bạn sang WhatsApp</p>
            <p className="mt-1">
              Nếu cửa sổ WhatsApp không tự mở, bấm vào link bên dưới. Đội tư vấn phản hồi trong giờ làm việc.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button href={whatsappUrl(sent.message)} target="_blank" rel="noopener noreferrer" variant="primary">
            Mở WhatsApp
          </Button>
          <Button href={mailtoUrl(subject, sent.message)} variant="outline">
            Gửi qua email
          </Button>
          <Button href={`tel:${siteConfig.contact.hotline}`} variant="ghost">
            Gọi {siteConfig.contact.hotline}
          </Button>
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-ink-soft">Xem nội dung sẽ gửi</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-ivory-200 p-3 text-xs text-ink-muted">
            {sent.message}
          </pre>
        </details>

        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-4 text-sm text-royal hover:underline"
        >
          ← Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      <Button type="submit" variant="primary" size="lg" className="mt-5 w-full sm:w-auto">
        {submitLabel}
      </Button>
      <p className="mt-2 text-xs text-ink-soft">
        Yêu cầu được gửi qua WhatsApp tới đội tư vấn DubaiWay.
      </p>
    </form>
  );
}
