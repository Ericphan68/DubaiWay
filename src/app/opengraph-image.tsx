import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

/**
 * Ảnh xem trước khi chia sẻ link lên Facebook, Zalo, WhatsApp.
 * Trước đây không có ảnh nào nên link chia sẻ chỉ hiện chữ.
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #293A4F 0%, #364A63 60%, #45596F 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 28,
              border: '2px solid #B88A3B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#D3B16A', fontSize: 30, fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ color: '#FFF9EF', fontSize: 40, fontWeight: 600 }}>DubaiWay</div>
        </div>

        <div style={{ color: '#FFF9EF', fontSize: 68, fontWeight: 600, marginTop: 40, lineHeight: 1.15 }}>
          {siteConfig.tagline}
        </div>

        <div style={{ color: '#D3B16A', fontSize: 28, marginTop: 28 }}>
          Tour · Vé tham quan · Safari sa mạc · Du thuyền · Đưa đón sân bay
        </div>

        <div style={{ color: 'rgba(255,249,239,0.6)', fontSize: 24, marginTop: 'auto' }}>
          {siteConfig.url.replace(/^https?:\/\//, '')}
        </div>
      </div>
    ),
    size,
  );
}
