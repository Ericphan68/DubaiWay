import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listCategories } from '@/server/services/catalog-store';
import { listBanners, listPosts } from '@/server/services/content-store';
import { BannerForm, PostForm, PostStatusButton, ToggleBanner } from './ContentForms';

export const metadata: Metadata = { title: 'Nội dung — Quản trị', robots: { index: false, follow: false } };

const POST_STATUS: Record<string, { text: string; cls: string }> = {
  draft:     { text: 'Nháp',       cls: 'bg-mist-200 text-ink-soft' },
  published: { text: 'Đang đăng',  cls: 'bg-emerald-50 text-emerald-700' },
  archived:  { text: 'Lưu trữ',    cls: 'bg-mist-200 text-ink-soft' },
};

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AdminContentPage({ searchParams }: Props) {
  const user = await getSessionUser();
  const canManage = hasPermission(user, 'content.manage');
  const sp = await searchParams;

  const posts = listPosts();
  const banners = listBanners();
  const categories = listCategories().map((c) => ({ slug: c.slug, name: c.name.vi }));
  const editing = typeof sp.post === 'string' ? posts.find((p) => p.id === sp.post) : undefined;

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Nội dung website</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {posts.length} bài viết · {banners.length} banner
      </p>

      {!canManage ? (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn xem được nhưng không có quyền <code>content.manage</code> để sửa.
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Bài viết cẩm nang</h2>
        <div className="mt-3">
          {posts.length === 0 ? (
            <EmptyState title="Chưa có bài viết nào" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-mist">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-ivory-200 text-left">
                  <tr>
                    <Th>Tiêu đề</Th><Th>Slug</Th><Th>Lượt xem</Th>
                    <Th>Trạng thái</Th>{canManage ? <Th>Thao tác</Th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist bg-ivory-100">
                  {posts.map((p) => {
                    const st = POST_STATUS[p.status] ?? POST_STATUS.draft;
                    return (
                      <tr key={p.id}>
                        <Td className="text-midnight">{p.titleVi}</Td>
                        <Td className="font-mono text-xs">{p.slug}</Td>
                        <Td>{p.viewCount}</Td>
                        <Td>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                            {st.text}
                          </span>
                        </Td>
                        {canManage ? (
                          <Td>
                            <div className="flex flex-wrap gap-3">
                              <Link href={`/admin/noi-dung?post=${p.id}`} className="text-sm text-royal hover:underline">
                                Sửa
                              </Link>
                              {p.status === 'published' ? (
                                <PostStatusButton id={p.id} to="draft" label="Gỡ xuống" />
                              ) : (
                                <PostStatusButton id={p.id} to="published" label="Đăng" />
                              )}
                            </div>
                          </Td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {canManage ? (
          <div className="mt-6">
            <PostForm
              categories={categories}
              values={editing ? {
                id: editing.id,
                titleVi: editing.titleVi, titleEn: editing.titleEn,
                excerptVi: editing.excerptVi, excerptEn: editing.excerptEn,
                bodyVi: editing.bodyVi, bodyEn: editing.bodyEn,
                categorySlug: editing.categorySlug, status: editing.status,
              } : undefined}
            />
          </div>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-lg font-medium text-midnight">Banner</h2>
        <div className="mt-3">
          {banners.length === 0 ? (
            <EmptyState title="Chưa có banner nào" />
          ) : (
            <ul className="space-y-2">
              {banners.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mist bg-ivory-100 px-4 py-3">
                  <span>
                    <span className="block text-sm font-medium text-midnight">{b.headlineVi}</span>
                    <span className="text-xs text-ink-soft">
                      {b.placement} · thứ tự {b.sortOrder} · → {b.linkUrl}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-mist-200 text-ink-soft'}`}>
                      {b.isActive ? 'Đang hiện' : 'Đã tắt'}
                    </span>
                    {canManage ? <ToggleBanner id={b.id} isActive={b.isActive} /> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage ? <div className="mt-6"><BannerForm /></div> : null}
      </section>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-ink-muted ${className ?? ''}`}>{children}</td>;
}
