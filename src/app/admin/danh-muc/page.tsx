import type { Metadata } from 'next';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listCategories, listServices } from '@/server/services/catalog-store';
import { CategoryForm, ToggleCategory } from '../OpsForms';

export const metadata: Metadata = { title: 'Danh mục — Quản trị', robots: { index: false, follow: false } };

export default async function AdminCategoriesPage() {
  const user = await getSessionUser();
  const canManage = hasPermission(user, 'category.manage');
  const categories = listCategories();
  const services = listServices();

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Danh mục dịch vụ</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {categories.length} danh mục · {categories.filter((c) => c.isActive).length} đang hiển thị
      </p>

      {!canManage ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn xem được nhưng không có quyền <code>category.manage</code> để sửa.
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-mist">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-ivory-200 text-left">
            <tr>
              <Th>Thứ tự</Th><Th>Slug</Th><Th>Tên tiếng Việt</Th><Th>Tên tiếng Anh</Th>
              <Th>Dịch vụ</Th><Th>Trạng thái</Th>{canManage ? <Th>Thao tác</Th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-mist bg-ivory-100">
            {categories.map((c) => {
              const count = services.filter((s) => s.categorySlug === c.slug && s.status === 'active').length;
              return (
                <tr key={c.slug}>
                  <Td>{c.sortOrder}</Td>
                  <Td className="font-mono text-xs">{c.slug}</Td>
                  <Td className="text-midnight">{c.name.vi}</Td>
                  <Td>{c.name.en}</Td>
                  <Td>{count}</Td>
                  <Td>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-mist-200 text-ink-soft'}`}>
                      {c.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                    </span>
                  </Td>
                  {canManage ? <Td><ToggleCategory slug={c.slug} isActive={c.isActive} /></Td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canManage ? (
        <div className="mt-8">
          <CategoryForm />
        </div>
      ) : null}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
