import type { Metadata } from 'next';
import { getSessionUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Hồ sơ', robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Hồ sơ</h1>
      <dl className="mt-6 max-w-lg divide-y divide-mist rounded-2xl border border-mist bg-ivory-100">
        <Row label="Họ và tên" value={user.fullName ?? '—'} />
        <Row label="Email" value={user.email} />
        <Row
          label="Xác minh email"
          value={user.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
        />
        <Row label="Ngôn ngữ" value={user.locale === 'en' ? 'English' : 'Tiếng Việt'} />
        <Row label="Vai trò" value={user.roles.join(', ')} />
      </dl>
      <p className="mt-4 max-w-lg text-sm text-ink-soft">
        Chỉnh sửa hồ sơ sẽ có ở bản cập nhật tiếp theo. Cần đổi thông tin gấp, liên hệ bộ phận hỗ trợ.
      </p>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="text-sm text-midnight">{value}</dd>
    </div>
  );
}
