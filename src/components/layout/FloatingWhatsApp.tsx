'use client';

import { usePathname } from 'next/navigation';
import { whatsappLink, whatsappMessages, type WhatsappContext } from '@/lib/whatsapp';
import { IconWhatsapp } from '@/components/ui/icons';

/** Chọn tin nhắn mẫu theo khu vực trang hiện tại. */
function contextForPath(path: string): WhatsappContext {
  if (path.startsWith('/ve-may-bay')) return 'flights';
  if (path.startsWith('/khach-san')) return 'hotels';
  if (path.startsWith('/visa')) return 'visa';
  if (path.startsWith('/events')) return 'events';
  if (path.startsWith('/holy-land')) return 'holyland';
  if (path.startsWith('/dubai')) return 'dubai';
  if (path.startsWith('/signature')) return 'signature';
  if (path.startsWith('/du-lich')) return 'tours';
  return 'default';
}

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const href = whatsappLink(whatsappMessages[contextForPath(pathname)]);

  return (
    <a
      id="whatsapp"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nhắn WhatsApp cho DubaiWay"
      className="group fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-3 text-white shadow-console transition-all duration-300 ease-dubaiway hover:pr-5 sm:bottom-6 sm:right-6"
    >
      <IconWhatsapp className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-dubaiway group-hover:max-w-[10rem] sm:inline">
        Tư vấn WhatsApp
      </span>
    </a>
  );
}
