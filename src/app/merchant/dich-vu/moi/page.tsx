import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser, isMerchantMember } from '@/server/auth';
import { getMerchantForUser } from '@/server/services/merchant-store';
import { listCategories } from '@/server/services/catalog-store';
import { ServiceForm } from '../ServiceForm';

export const metadata: Metadata = { title: 'Tạo dịch vụ mới', robots: { index: false, follow: false } };

export default async function NewServicePage() {
  const user = await getSessionUser();
  if (!user || !isMerchantMember(user)) redirect('/tro-thanh-doi-tac');
  const merchant = getMerchantForUser(user.id);

  const categories = listCategories()
    .filter((c) => c.isActive)
    .map((c) => ({ slug: c.slug, name: c.name.vi }));

  return (
    <>
      <nav className="text-sm text-ink-soft">
        <Link href="/merchant/dich-vu" className="hover:text-champagne-600">← Quay lại danh sách dịch vụ</Link>
      </nav>
      <h1 className="mt-3 font-display text-2xl font-medium text-midnight">Tạo dịch vụ mới</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Điền đầy đủ để khách hiểu rõ trước khi đặt. Mô tả càng cụ thể càng ít khiếu nại về sau.
      </p>

      {merchant && merchant.status !== 'approved' ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Hồ sơ của bạn chưa được duyệt. Bạn vẫn tạo và lưu nháp được, nhưng chưa nộp duyệt dịch vụ
          cho tới khi hồ sơ đối tác được thông qua.
        </p>
      ) : null}

      <div className="mt-6">
        <ServiceForm mode="create" categories={categories} />
      </div>
    </>
  );
}
