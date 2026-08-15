'use client';

import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { IconMail, IconCheck } from '@/components/ui/icons';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <Section background="ivory">
      <div className="mx-auto max-w-2xl rounded-3xl border border-champagne-200 bg-ivory-100 px-6 py-10 text-center shadow-card sm:px-12">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-champagne-200/60 text-champagne-600">
          <IconMail className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-medium text-midnight sm:text-3xl">
          Nhận cảm hứng &amp; ưu đãi từ DubaiWay
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Mỗi tháng một lá thư: điểm đến mới, mẹo visa, giá vé tốt và lịch khởi hành đoàn.
        </p>

        {done ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
            <IconCheck className="h-4 w-4" /> Cảm ơn bạn! Chúng tôi sẽ gửi thư sớm.
          </p>
        ) : (
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setDone(true);
            }}
          >
            <label className="flex-1">
              <span className="sr-only">Email của bạn</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="h-12 w-full rounded-full border border-mist bg-ivory px-5 text-sm outline-none transition-colors focus:border-royal"
              />
            </label>
            <Button type="submit" variant="primary" size="lg">Đăng ký</Button>
          </form>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Chúng tôi tôn trọng quyền riêng tư của bạn. Có thể huỷ đăng ký bất cứ lúc nào.
        </p>
      </div>
    </Section>
  );
}
