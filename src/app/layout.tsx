import type { Metadata, Viewport } from 'next';
import { Fraunces, Be_Vietnam_Pro } from 'next/font/google';
import { siteConfig } from '@/config/site';
import { Header } from '@/components/layout/Header';
import { getLocale } from '@/server/locale';
import { getDisplayCurrency } from '@/server/currency';
import { getSessionUser, isMerchantMember, isPlatformStaff } from '@/server/auth';
import { getDictionary, textDirection } from '@/i18n';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import './globals.css';

const display = Fraunces({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'du lịch quốc tế',
    'tour Dubai',
    'tour hành hương',
    'vé máy bay',
    'khách sạn',
    'visa',
    'tổ chức sự kiện quốc tế',
    'DubaiWay',
  ],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#364A63',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Ngôn ngữ và phiên đọc ở máy chủ rồi truyền xuống Header,
  // để menu hiện đúng trạng thái đăng nhập ngay từ lần render đầu.
  const locale = await getLocale();
  const currency = await getDisplayCurrency();
  const user = await getSessionUser();
  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={textDirection(locale)}
      className={`${display.variable} ${sans.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-royal focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          {t.nav.skipToContent}
        </a>
        <Header
          locale={locale}
          currency={currency.code}
          user={user ? {
            fullName: user.fullName,
            email: user.email,
            isMerchant: isMerchantMember(user),
            isStaff: isPlatformStaff(user),
          } : null}
        />
        <main id="main" className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
        <BottomNav locale={locale} />
      </body>
    </html>
  );
}
