'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setCurrencyAction, setLocaleAction } from '@/app/locale-actions';
import {
  CURRENCY_OPTIONS, LANGUAGE_OPTIONS, type CurrencyOption, type LanguageOption,
} from '@/config/locales';
import { cn } from '@/lib/utils';

/**
 * Nút chọn ngôn ngữ + tiền tệ gộp làm một, mở ra bảng hai tab.
 *
 * Ngôn ngữ và tiền tệ chưa bật vẫn được liệt kê nhưng hiện mờ và không bấm được —
 * để người dùng thấy lộ trình thay vì tưởng nền tảng chỉ có 2 ngôn ngữ.
 */
export function LocalePicker({
  currentLanguage, currentCurrency, tone = 'light',
}: {
  currentLanguage: string;
  currentCurrency: string;
  tone?: 'light' | 'dark';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'language' | 'currency'>('language');
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const lang = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) ?? LANGUAGE_OPTIONS[0];
  const currency = CURRENCY_OPTIONS.find((c) => c.code === currentCurrency) ?? CURRENCY_OPTIONS[0];

  // Đóng bảng khi bấm ra ngoài hoặc nhấn Esc — người dùng mong đợi cả hai cách.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (kind: 'language' | 'currency', code: string) => {
    const fd = new FormData();
    if (kind === 'language') fd.set('locale', code);
    else fd.set('currency', code);

    startTransition(async () => {
      if (kind === 'language') await setLocaleAction(fd);
      else await setCurrencyAction(fd);
      // revalidatePath ở máy chủ không làm mới bộ nhớ đệm router phía client.
      router.refresh();
      setOpen(false);
    });
  };

  const isVi = currentLanguage === 'vi';
  const label = {
    language: isVi ? 'Ngôn ngữ' : 'Language',
    currency: isVi ? 'Tiền tệ' : 'Currency',
    suggested: isVi ? 'Ngôn ngữ gợi ý' : 'Suggested languages',
    more: isVi ? 'Ngôn ngữ khác' : 'More languages',
    popular: isVi ? 'Tiền tệ phổ biến' : 'Popular currencies',
    moreCur: isVi ? 'Tiền tệ khác' : 'More currencies',
    soon: isVi ? 'sắp có' : 'coming soon',
    note: isVi
      ? 'Giá quy đổi chỉ để tham khảo. Mọi đơn hàng vẫn được tính và thu bằng USD.'
      : 'Converted prices are indicative. All bookings are charged in USD.',
    openLabel: isVi ? 'Chọn ngôn ngữ và tiền tệ' : 'Choose language and currency',
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          // Mở lại luôn về tab Ngôn ngữ để lần nào cũng thấy cùng một chỗ,
          // không phụ thuộc tab đã xem ở lần mở trước.
          setOpen((v) => { if (!v) setTab('language'); return !v; });
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label.openLabel}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          tone === 'dark'
            ? 'bg-white/10 text-white hover:bg-white/15'
            : 'bg-mist/40 text-ink-muted hover:bg-mist/70 hover:text-midnight',
        )}
      >
        <GlobeIcon className="h-3.5 w-3.5" />
        <span>{lang.label}{lang.region ? `(${lang.region})` : ''}</span>
        <span className={tone === 'dark' ? 'text-white/30' : 'text-mist-400'}>|</span>
        <span>{currency.code}</span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label.openLabel}
          className="absolute right-0 z-50 mt-2 max-h-[70vh] w-[min(92vw,44rem)] overflow-y-auto rounded-2xl border border-mist bg-ivory-100 p-5 shadow-xl"
        >
          {/* Tab */}
          <div className="flex gap-6 border-b border-mist">
            {(['language', 'currency'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                aria-selected={tab === k}
                role="tab"
                className={cn(
                  '-mb-px border-b-2 pb-3 text-base font-semibold transition-colors',
                  tab === k
                    ? 'border-champagne text-champagne-600'
                    : 'border-transparent text-ink-muted hover:text-midnight',
                )}
              >
                {label[k]}
              </button>
            ))}
          </div>

          {tab === 'language' ? (
            <div className="mt-5">
              <Group title={label.suggested}>
                {LANGUAGE_OPTIONS.filter((l) => l.suggested).map((l) => (
                  <LanguageItem key={l.code} option={l} active={l.code === currentLanguage}
                                soon={label.soon} pending={pending}
                                onSelect={() => choose('language', l.code)} />
                ))}
              </Group>
              <Group title={label.more}>
                {LANGUAGE_OPTIONS.filter((l) => !l.suggested).map((l) => (
                  <LanguageItem key={l.code} option={l} active={l.code === currentLanguage}
                                soon={label.soon} pending={pending}
                                onSelect={() => choose('language', l.code)} />
                ))}
              </Group>
            </div>
          ) : (
            <div className="mt-5">
              <Group title={label.popular} cols={2}>
                {CURRENCY_OPTIONS.filter((c) => c.popular).map((c) => (
                  <CurrencyItem key={c.code} option={c} active={c.code === currentCurrency}
                                isVi={isVi} pending={pending}
                                onSelect={() => choose('currency', c.code)} />
                ))}
              </Group>
              <Group title={label.moreCur} cols={2}>
                {CURRENCY_OPTIONS.filter((c) => !c.popular).map((c) => (
                  <CurrencyItem key={c.code} option={c} active={c.code === currentCurrency}
                                isVi={isVi} pending={pending}
                                onSelect={() => choose('currency', c.code)} />
                ))}
              </Group>
              <p className="mt-5 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-xs leading-relaxed text-ink-soft">
                {label.note}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Group({ title, cols = 3, children }: {
  title: string; cols?: 2 | 3; children: React.ReactNode;
}) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="font-display text-lg font-medium text-midnight">{title}</h3>
      <div className={cn('mt-3 grid gap-x-6 gap-y-1', cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')}>
        {children}
      </div>
    </section>
  );
}

function LanguageItem({ option, active, soon, pending, onSelect }: {
  option: LanguageOption; active: boolean; soon: string; pending: boolean; onSelect: () => void;
}) {
  const disabled = !option.available || pending;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      title={option.available ? undefined : soon}
      className={cn(
        'rounded-lg px-2 py-2 text-left text-sm transition-colors',
        active
          ? 'font-semibold text-champagne-600'
          : option.available
            ? 'text-midnight hover:bg-mist/40'
            : 'cursor-not-allowed text-ink-soft/50',
      )}
    >
      {option.label}
      {option.region ? <span className="text-ink-soft"> ({option.region})</span> : null}
      {!option.available ? <span className="ml-1.5 text-[0.68rem]">· {soon}</span> : null}
    </button>
  );
}

function CurrencyItem({ option, active, isVi, pending, onSelect }: {
  option: CurrencyOption; active: boolean; isVi: boolean; pending: boolean; onSelect: () => void;
}) {
  const disabled = !option.available || pending;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex items-baseline gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors',
        active
          ? 'font-semibold text-champagne-600'
          : option.available
            ? 'text-midnight hover:bg-mist/40'
            : 'cursor-not-allowed text-ink-soft/50',
      )}
    >
      <span className={cn('w-10 shrink-0 font-mono text-xs', active ? 'text-champagne-600' : 'text-ink-soft')}>
        {option.code}
      </span>
      <span>{isVi ? option.nameVi : option.nameEn}</span>
    </button>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9s1.2-6.4 3.6-9Z"
            stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
