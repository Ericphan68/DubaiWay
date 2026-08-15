import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'navy' | 'gold' | 'royal' | 'neutral' | 'onImage';

const tones: Record<Tone, string> = {
  navy: 'bg-midnight/[0.06] text-midnight',
  gold: 'bg-champagne-200/60 text-champagne-600',
  royal: 'bg-royal/10 text-royal',
  neutral: 'bg-mist text-ink-muted',
  onImage: 'bg-midnight/70 text-white backdrop-blur-sm',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
