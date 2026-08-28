import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * robots.txt sinh tự động.
 * Chặn các khu vực riêng tư: tài khoản, dashboard đối tác, quản trị, luồng thanh toán.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/tai-khoan',
          '/merchant',
          '/admin',
          '/dat-cho',
          '/dang-nhap',
          '/dang-ky',
          '/quen-mat-khau',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
