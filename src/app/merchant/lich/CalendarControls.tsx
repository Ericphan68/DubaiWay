'use client';

import { useActionState } from 'react';
import { updateCalendarAction, type CalendarState } from './actions';

const initial: CalendarState = { error: null, notice: null };

export function CalendarGrid({
  serviceId, days, blackout,
}: {
  serviceId: string;
  days: readonly {
    date: string; capacityTotal: number; capacityReserved: number; isClosed: boolean;
  }[];
  blackout: readonly string[];
}) {
  const [state, action, pending] = useActionState(updateCalendarAction, initial);
  const blocked = new Set(blackout);

  return (
    <>
      {state.error ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.notice ? (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.notice}</p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-mist">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-ivory-200 text-left">
            <tr>
              <Th>Ngày</Th><Th>Sức chứa</Th><Th>Đã đặt</Th><Th>Còn lại</Th><Th>Trạng thái</Th><Th>Thao tác</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist bg-ivory-100">
            {days.map((d) => {
              const isBlocked = blocked.has(d.date);
              const remaining = Math.max(0, d.capacityTotal - d.capacityReserved);
              const hasBookings = d.capacityReserved > 0;
              return (
                <tr key={d.date} className={isBlocked ? 'opacity-50' : undefined}>
                  <Td>
                    {new Date(`${d.date}T00:00:00`).toLocaleDateString('vi-VN', {
                      weekday: 'short', day: '2-digit', month: '2-digit',
                    })}
                  </Td>
                  <Td>
                    <form action={action} className="flex items-center gap-1.5">
                      <input type="hidden" name="serviceId" value={serviceId} />
                      <input type="hidden" name="date" value={d.date} />
                      <input type="hidden" name="action" value="setCapacity" />
                      <input
                        name="capacity" type="number" min={d.capacityReserved} max={1000}
                        defaultValue={d.capacityTotal}
                        className="h-8 w-20 rounded-lg border border-mist bg-ivory-100 px-2 text-sm"
                        aria-label={`Sức chứa ngày ${d.date}`}
                      />
                      <button type="submit" disabled={pending}
                              className="text-xs text-royal hover:underline disabled:opacity-50">
                        Lưu
                      </button>
                    </form>
                  </Td>
                  <Td className={hasBookings ? 'font-medium text-midnight' : ''}>{d.capacityReserved}</Td>
                  <Td className={remaining === 0 ? 'text-red-600' : ''}>{remaining}</Td>
                  <Td>
                    {isBlocked ? (
                      <Chip cls="bg-red-50 text-red-700">Đã chặn</Chip>
                    ) : d.isClosed ? (
                      <Chip cls="bg-mist-200 text-ink-soft">Đóng</Chip>
                    ) : remaining === 0 ? (
                      <Chip cls="bg-amber-50 text-amber-800">Hết chỗ</Chip>
                    ) : (
                      <Chip cls="bg-emerald-50 text-emerald-700">Mở bán</Chip>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {!isBlocked && !d.isClosed ? (
                        <MiniForm serviceId={serviceId} date={d.date} act="close" label="Đóng"
                                  action={action} pending={pending} disabled={hasBookings} />
                      ) : null}
                      {!isBlocked && d.isClosed ? (
                        <MiniForm serviceId={serviceId} date={d.date} act="open" label="Mở lại"
                                  action={action} pending={pending} />
                      ) : null}
                      {!isBlocked ? (
                        <MiniForm serviceId={serviceId} date={d.date} act="blackout" label="Chặn"
                                  action={action} pending={pending} disabled={hasBookings} />
                      ) : (
                        <MiniForm serviceId={serviceId} date={d.date} act="unblackout" label="Bỏ chặn"
                                  action={action} pending={pending} />
                      )}
                    </div>
                    {hasBookings ? (
                      <p className="mt-1 text-[0.68rem] text-ink-soft">Đã có khách — không đóng/chặn được</p>
                    ) : null}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function GenerateDays({ serviceId }: { serviceId: string }) {
  const [state, action, pending] = useActionState(updateCalendarAction, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="action" value="generate" />
      <label className="text-sm">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Mở bán thêm
        </span>
        <select name="days" className="h-10 rounded-lg border border-mist bg-ivory-100 px-2 text-sm">
          <option value="30">30 ngày tới</option>
          <option value="90" selected>90 ngày tới</option>
          <option value="180">180 ngày tới</option>
          <option value="365">365 ngày tới</option>
        </select>
      </label>
      <button type="submit" disabled={pending}
              className="h-10 rounded-full bg-midnight px-4 text-sm font-medium text-white hover:bg-midnight-800 disabled:opacity-50">
        {pending ? 'Đang mở…' : 'Mở lịch'}
      </button>
      {state.notice ? <p role="status" className="w-full text-sm text-emerald-700">{state.notice}</p> : null}
      {state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}

function MiniForm({
  serviceId, date, act, label, action, pending, disabled,
}: {
  serviceId: string; date: string; act: string; label: string;
  action: (fd: FormData) => void; pending: boolean; disabled?: boolean;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="action" value={act} />
      <button type="submit" disabled={pending || disabled}
              className="rounded-lg border border-mist px-2 py-1 text-xs text-ink-muted transition-colors hover:border-mist-400 disabled:cursor-not-allowed disabled:opacity-40">
        {label}
      </button>
    </form>
  );
}

function Chip({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-ink-muted ${className ?? ''}`}>{children}</td>;
}
