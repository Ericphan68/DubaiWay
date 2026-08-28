import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/states';
import { getSessionUser, hasPermission } from '@/server/auth';
import { listAudit } from '@/server/services/audit-store';

export const metadata: Metadata = { title: 'Nhật ký hệ thống', robots: { index: false, follow: false } };

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AuditLogPage({ searchParams }: Props) {
  const user = await getSessionUser();
  // Nhật ký chứa dấu vết mọi thao tác — chỉ người có quyền mới đọc được.
  if (!hasPermission(user, 'audit.read')) redirect('/admin');

  const sp = await searchParams;
  const entityType = typeof sp.type === 'string' ? sp.type : undefined;
  const entries = listAudit({ entityType, limit: 200 });

  const types = ['merchant', 'service', 'category', 'coupon', 'review', 'dispute'];

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Nhật ký hệ thống</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Mọi thao tác quan trọng đều được ghi lại. Bản ghi chỉ thêm, không sửa hay xoá được.
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        Dữ liệu nhạy cảm (mật khẩu, số hộ chiếu, số tài khoản, token) tự động bị ẩn trước khi ghi.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        <a href="/admin/nhat-ky"
           className={`rounded-full border px-3 py-1.5 text-sm ${!entityType ? 'border-royal bg-royal text-white' : 'border-mist text-ink-muted'}`}>
          Tất cả
        </a>
        {types.map((t) => (
          <a key={t} href={`/admin/nhat-ky?type=${t}`}
             className={`rounded-full border px-3 py-1.5 text-sm ${entityType === t ? 'border-royal bg-royal text-white' : 'border-mist text-ink-muted'}`}>
            {t}
          </a>
        ))}
      </nav>

      <div className="mt-6">
        {entries.length === 0 ? (
          <EmptyState
            title="Chưa có bản ghi nào"
            body="Nhật ký ghi lại từ thao tác quản trị đầu tiên."
          />
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li key={e.id} className="rounded-xl border border-mist bg-ivory-100 p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p>
                    <span className="font-mono font-medium text-midnight">{e.action}</span>
                    <span className="ml-2 text-ink-soft">
                      {e.entityType}{e.entityId ? ` · ${e.entityId.slice(0, 12)}…` : ''}
                    </span>
                  </p>
                  <p className="text-xs text-ink-soft">{new Date(e.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <p className="mt-1 text-ink-muted">
                  {e.actorName}
                  <span className="ml-2 text-xs text-ink-soft">({e.actorRoles.join(', ')})</span>
                </p>
                {e.reason ? <p className="mt-1 text-ink-muted">Lý do: {e.reason}</p> : null}
                {e.beforeData || e.afterData ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-royal">Dữ liệu trước/sau</summary>
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-ivory-200 p-2 text-xs text-ink-muted">
{JSON.stringify({ truoc: e.beforeData, sau: e.afterData }, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
