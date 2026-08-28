import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/states';
import { getSessionUser } from '@/server/auth';
import { countUnread, listNotifications } from '@/server/services/customer-store';
import { markAllReadAction } from '../actions';

export const metadata: Metadata = { title: 'Thông báo', robots: { index: false, follow: false } };

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const items = listNotifications(user.id);
  const unread = countUnread(user.id);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-midnight">Thông báo</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {unread > 0 ? `${unread} thông báo chưa đọc` : 'Bạn đã đọc hết'}
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllReadAction}>
            <button type="submit" className="text-sm text-royal hover:underline">
              Đánh dấu đã đọc tất cả
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            title="Chưa có thông báo nào"
            body="Chúng tôi báo cho bạn khi đơn hàng thay đổi trạng thái, có thưởng giới thiệu, hoặc khiếu nại được xử lý."
          />
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id}
                  className={`rounded-2xl border p-4 ${n.readAt ? 'border-mist bg-ivory-100' : 'border-champagne-200 bg-champagne/[0.04]'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-midnight">
                    {n.readAt ? null : <span className="mr-2 inline-block h-2 w-2 rounded-full bg-champagne" aria-label="Chưa đọc" />}
                    {n.title}
                  </p>
                  <p className="text-xs text-ink-soft">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{n.body}</p>
                {n.linkUrl ? (
                  <Link href={n.linkUrl} className="mt-2 inline-block text-sm text-royal hover:underline">
                    Xem chi tiết →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
