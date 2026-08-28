'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocaleAction } from '@/app/locale-actions';
import { ENABLED_LOCALES, LOCALE_LABELS, type Locale } from '@/i18n';
import { cn } from '@/lib/utils';

const SHORT: Record<Locale, string> = { vi: 'VI', en: 'EN', ar: 'AR' };

/**
 * Bộ chọn ngôn ngữ.
 *
 * Dùng form + server action thay vì gọi API phía client, để lựa chọn được ghi
 * vào cookie httpOnly-safe và trang render lại ngay ở máy chủ với đúng ngôn ngữ.
 */
export function LocaleSwitcher({
  current, tone = 'light',
}: {
  current: Locale;
  tone?: 'light' | 'dark';
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn('inline-flex items-center gap-0.5 rounded-full p-0.5',
        tone === 'dark' ? 'bg-white/10' : 'bg-mist/40')}
      role="group"
      aria-label="Chọn ngôn ngữ"
    >
      {ENABLED_LOCALES.map((code) => {
        const active = code === current;
        return (
          <form
            key={code}
            /*
              Ghi cookie xong phải gọi router.refresh(): revalidatePath ở máy chủ
              không tự làm mới bộ nhớ đệm router phía client, nên trang vẫn giữ
              ngôn ngữ cũ cho tới lần điều hướng sau.
            */
            action={(fd) => startTransition(async () => {
              await setLocaleAction(fd);
              router.refresh();
            })}
          >
            <input type="hidden" name="locale" value={code} />
            <button
              type="submit"
              disabled={pending || active}
              aria-current={active ? 'true' : undefined}
              title={LOCALE_LABELS[code]}
              className={cn(
                'rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide transition-colors',
                active
                  ? tone === 'dark'
                    ? 'bg-champagne text-white'
                    : 'bg-midnight text-white'
                  : tone === 'dark'
                    ? 'text-white/70 hover:text-white'
                    : 'text-ink-muted hover:text-midnight',
                pending && !active && 'opacity-50',
              )}
            >
              {SHORT[code]}
            </button>
          </form>
        );
      })}
    </div>
  );
}
