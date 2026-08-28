import { ImageResponse } from 'next/og';

/** Favicon sinh tự động — tab trình duyệt trước đây trống trơn (404 /favicon.ico). */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#364A63',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#D3B16A',
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        D
      </div>
    ),
    size,
  );
}
