'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav, type NavItem } from '@/config/nav';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { LocalePicker } from './LocalePicker';
import { getDictionary, type Locale } from '@/i18n';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import {
  IconChevronDown,
  IconMenu,
  IconPhone,
  IconArrowUpRight,
} from '@/components/ui/icons';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { AllCategoriesButton } from '@/components/categories/AllCategoriesButton';
import type { CategoryGroup } from '@/config/category-groups';

export interface HeaderUser {
  readonly fullName: string | null;
  readonly email: string;
  readonly isMerchant: boolean;
  readonly isStaff: boolean;
}

export function Header({
  locale, currency, categoryGroups, user,
}: {
  locale: Locale;
  currency: string;
  categoryGroups: readonly CategoryGroup[];
  user: HeaderUser | null;
}) {
  const t = getDictionary(locale);
  /** Nhãn menu theo ngôn ngữ; thiếu bản dịch thì giữ nhãn tiếng Việt. */
  const navLabel = (item: NavItem) => (item.labelKey ? t.nav[item.labelKey] : item.label);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Đóng mega menu khi đổi trang.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (item: NavItem) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  return (
    <header className="sticky top-0 z-50">
      {/* Thanh tiện ích */}
      <div className="hidden border-b border-mist bg-ivory-200 text-ink-muted xl:block">
        <div className="shell flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <a href={`tel:${siteConfig.contact.hotline}`} className="inline-flex items-center gap-1.5 hover:text-champagne-600">
              <IconPhone className="h-3.5 w-3.5" /> {siteConfig.contact.hotline}
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-champagne-600">
              {siteConfig.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <LocalePicker currentLanguage={locale} currentCurrency={currency} />

            {user ? (
              <>
                {user.isStaff ? (
                  <Link href="/admin" className="hover:text-champagne-600">{t.account.adminArea}</Link>
                ) : null}
                {user.isMerchant ? (
                  <Link href="/merchant" className="hover:text-champagne-600">{t.account.merchantArea}</Link>
                ) : null}
                <Link href="/tai-khoan" className="font-semibold text-champagne-600 hover:text-midnight">
                  {user.fullName ?? user.email}
                </Link>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" className="hover:text-champagne-600">{t.account.signIn}</Link>
                <Link
                  href="/dang-ky"
                  className="inline-flex items-center gap-1 font-semibold text-champagne-600 hover:text-midnight"
                >
                  {t.account.signUp} <IconArrowUpRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thanh chính */}
      <div
        className={cn(
          'border-b transition-colors duration-300 ease-dubaiway',
          scrolled
            ? 'border-mist bg-ivory/90 backdrop-blur-md'
            : 'border-mist/60 bg-ivory',
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Logo tone="dark" />

          <nav className="hidden items-center xl:flex" aria-label="Điều hướng chính">
            <AllCategoriesButton groups={categoryGroups} locale={locale} variant="nav" />
            {mainNav.map((item) => {
              const hasMenu = Boolean(item.megaMenu);
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(hasMenu ? item.label : null)}
                >
                  <Link
                    href={item.href}
                    aria-expanded={hasMenu ? openMenu === item.label : undefined}
                    className={cn(
                      'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item)
                        ? 'text-champagne-600'
                        : 'text-midnight/80 hover:text-champagne-600',
                    )}
                  >
                    {navLabel(item)}
                    {hasMenu && (
                      <IconChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-300',
                          openMenu === item.label && 'rotate-180',
                        )}
                      />
                    )}
                  </Link>
                  {hasMenu && openMenu === item.label && (
                    <MegaMenu item={item} onNavigate={() => setOpenMenu(null)} />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/tim-kiem" variant="outline" size="sm" className="hidden 2xl:inline-flex">
              Tìm chuyến đi
            </Button>
            <Button href="/yeu-cau-bao-gia" variant="primary" size="sm" className="hidden sm:inline-flex">
              Nhận tư vấn
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-midnight hover:bg-midnight/[0.06] xl:hidden"
              aria-label="Mở menu"
            >
              <IconMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        locale={locale}
        currency={currency}
        categoryGroups={categoryGroups}
        user={user}
      />
    </header>
  );
}
