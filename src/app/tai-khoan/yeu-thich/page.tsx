import type { Metadata } from 'next';
import { EmptyState } from '@/components/states';
import { ServiceGrid } from '@/components/marketplace/ServiceCard';
import { getSessionUser } from '@/server/auth';
import { getLocale } from '@/server/locale';
import { getRepositories } from '@/server/repositories';
import { listFavorites } from '@/server/services/customer-store';

export const metadata: Metadata = { title: 'Yêu thích', robots: { index: false, follow: false } };

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const locale = await getLocale();
  const repo = getRepositories();
  const slugs = listFavorites(user.id);

  const services = (
    await Promise.all(slugs.map((slug) => repo.catalog.getServiceBySlug(slug, locale).catch(() => null)))
  ).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Dịch vụ yêu thích</h1>
      <p className="mt-1 text-sm text-ink-muted">{services.length} dịch vụ đã lưu</p>

      <div className="mt-6">
        {services.length === 0 ? (
          <EmptyState
            title="Chưa lưu dịch vụ nào"
            body="Bấm ♡ trên trang dịch vụ để lưu lại xem sau."
            action={{ label: 'Khám phá dịch vụ', href: '/danh-muc' }}
          />
        ) : (
          <ServiceGrid services={services} />
        )}
      </div>
    </>
  );
}
