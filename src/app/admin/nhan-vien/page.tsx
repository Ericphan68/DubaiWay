import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, hasPermission, ROLE_PERMISSIONS } from '@/server/auth';
import { listAllUsers } from '@/server/auth/memory-provider';
import { RoleForm } from './RoleForm';

export const metadata: Metadata = { title: 'Nhân viên & phân quyền', robots: { index: false, follow: false } };

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  merchant_reviewer: 'Merchant Reviewer',
  service_reviewer: 'Service Reviewer',
  customer_support: 'Customer Support',
  finance: 'Finance',
  dispute_officer: 'Dispute Officer',
  content_manager: 'Content Manager',
  marketing: 'Marketing',
  merchant_owner: 'Chủ đối tác',
  merchant_staff: 'Nhân viên đối tác',
  merchant_scanner: 'Nhân viên quét mã',
  customer: 'Khách hàng',
};

const PLATFORM_ROLES = [
  'super_admin', 'merchant_reviewer', 'service_reviewer', 'customer_support',
  'finance', 'dispute_officer', 'content_manager', 'marketing',
];

export default async function AdminStaffPage() {
  const user = await getSessionUser();
  // Chỉ người có quyền quản lý người dùng mới vào được trang này.
  if (!hasPermission(user, 'user.manage') && !hasPermission(user, 'role.manage')) {
    redirect('/admin');
  }
  const canManageRoles = hasPermission(user, 'role.manage');

  const users = listAllUsers();
  const staff = users.filter((u) => u.roles.some((r) => PLATFORM_ROLES.includes(r)));
  const others = users.filter((u) => !staff.includes(u));

  const roleOptions = Object.keys(ROLE_LABELS).map((v) => ({ value: v, label: ROLE_LABELS[v] }));

  return (
    <>
      <h1 className="font-display text-2xl font-medium text-midnight">Nhân viên & phân quyền</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {staff.length} nhân viên nền tảng · {users.length} tài khoản
      </p>

      <p className="mt-4 rounded-xl border border-mist bg-ivory-200 px-4 py-3 text-sm text-ink-soft">
        Chỉ <strong className="text-ink-muted">Super Admin</strong> được cấp và thu hồi vai trò.
        Không ai tự cấp quyền cho chính mình, và hệ thống không cho thu hồi Super Admin cuối cùng.
        Mọi thay đổi đều ghi vào nhật ký.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-midnight">Nhân viên nền tảng</h2>
        <div className="mt-3 space-y-3">
          {staff.map((u) => (
            <article key={u.id} className="rounded-2xl border border-mist bg-ivory-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-midnight">{u.fullName}</p>
                  <p className="text-sm text-ink-soft">{u.email}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {u.roles.map((r) => (
                    <span key={r} className="rounded-full bg-royal/[0.08] px-2.5 py-0.5 text-xs font-medium text-royal">
                      {ROLE_LABELS[r] ?? r}
                    </span>
                  ))}
                </div>
              </div>
              {canManageRoles ? (
                <RoleForm targetUserId={u.id} currentRoles={u.roles} allRoles={roleOptions} />
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium text-midnight">Tài khoản khác</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-mist">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-ivory-200 text-left">
              <tr>
                <Th>Họ tên</Th><Th>Email</Th><Th>Vai trò</Th><Th>Xác minh</Th>
                {canManageRoles ? <Th>Thao tác</Th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-mist bg-ivory-100">
              {others.map((u) => (
                <tr key={u.id}>
                  <Td className="text-midnight">{u.fullName}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.roles.map((r) => ROLE_LABELS[r] ?? r).join(', ')}</Td>
                  <Td>{u.emailVerified ? '✓' : '—'}</Td>
                  {canManageRoles ? (
                    <Td><RoleForm targetUserId={u.id} currentRoles={u.roles} allRoles={roleOptions} /></Td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium text-midnight">Ma trận phân quyền</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Vai trò phạm vi đối tác không có quyền cấp nền tảng nào.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-mist">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-ivory-200 text-left">
              <tr><Th>Vai trò</Th><Th>Quyền</Th></tr>
            </thead>
            <tbody className="divide-y divide-mist bg-ivory-100">
              {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                <tr key={role}>
                  <Td className="whitespace-nowrap text-midnight">{ROLE_LABELS[role] ?? role}</Td>
                  <Td className="font-mono text-xs">
                    {perms.length > 0 ? perms.join(', ') : '— không có quyền cấp nền tảng —'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-ink-muted ${className ?? ''}`}>{children}</td>;
}
