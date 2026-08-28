import type { MetadataRoute } from 'next';
import { getRepositories } from '@/server/repositories';
import { siteConfig } from '@/config/site';

/**
 * sitemap.xml sinh tự động từ dữ liệu thật.
 * Thêm dịch vụ mới là sitemap tự cập nhật, không phải sửa tay.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = ([
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/danh-muc`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/dich-vu`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/tim-kiem`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/uu-dai`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/ve-dubaiway`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/tro-thanh-doi-tac`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gioi-thieu-ban-be`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/tro-giup`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/lien-he`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/cam-nang`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/dieu-khoan`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/chinh-sach-bao-mat`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/chinh-sach-cookie`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/chinh-sach-huy-hoan-tien`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/dieu-khoan-doi-tac`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/dieu-khoan-gioi-thieu`, changeFrequency: 'yearly', priority: 0.3 },
  ] as const).map((p) => ({ ...p, lastModified: now }));

  try {
    const repo = getRepositories();
    const [categories, services] = await Promise.all([
      repo.catalog.listCategories('vi'),
      repo.catalog.searchServices({ pageSize: 500 }, 'vi'),
    ]);

    return [
      ...staticPages,
      ...categories.map((c) => ({
        url: `${base}/danh-muc/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...services.items.map((s) => ({
        url: `${base}/dich-vu/${s.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      })),
    ];
  } catch {
    // Nguồn dữ liệu lỗi thì vẫn trả sitemap tĩnh, tốt hơn là trả lỗi 500 cho Google.
    return staticPages;
  }
}
