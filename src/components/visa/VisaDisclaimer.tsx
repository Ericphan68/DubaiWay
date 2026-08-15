import { VISA_DISCLAIMER } from '@/data/visas';
import { IconShield } from '@/components/ui/icons';

/** Cảnh báo pháp lý bắt buộc — hiển thị ở mọi nơi liên quan visa. */
export function VisaDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-champagne-200 bg-champagne-200/25 p-4">
      <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-champagne-600" />
      <p className="text-sm leading-relaxed text-ink-muted">{VISA_DISCLAIMER}</p>
    </div>
  );
}
