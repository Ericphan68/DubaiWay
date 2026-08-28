'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { changeRoleAction, type StaffState } from './actions';

const initial: StaffState = { error: null, notice: null };

export function RoleForm({
  targetUserId, currentRoles, allRoles,
}: {
  targetUserId: string;
  currentRoles: readonly string[];
  allRoles: readonly { value: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(changeRoleAction, initial);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <select name="role" className="h-9 rounded-lg border border-mist bg-ivory-100 px-2 text-sm">
        {allRoles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}{currentRoles.includes(r.value) ? ' (đang có)' : ''}
          </option>
        ))}
      </select>
      <select name="op" className="h-9 rounded-lg border border-mist bg-ivory-100 px-2 text-sm">
        <option value="grant">Cấp</option>
        <option value="revoke">Thu hồi</option>
      </select>
      <Button type="submit" variant="navy" size="sm" disabled={pending}>
        {pending ? 'Đang lưu…' : 'Áp dụng'}
      </Button>
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state.notice ? <p role="status" className="w-full text-sm text-emerald-700">{state.notice}</p> : null}
    </form>
  );
}
