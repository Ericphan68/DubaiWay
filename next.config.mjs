/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Tắt tối ưu ảnh on-demand (/_next/image) vì Hostinger không chạy được `sharp`.
    // Ảnh Unsplash đã kèm sẵn kích thước (w=) qua helper img() nên chất lượng vẫn tốt.
    // Khi chuyển sang môi trường có sharp (Vercel/VPS), có thể đặt lại unoptimized: false.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Ngăn CDN/proxy (Hostinger) cache HTML cũ khiến trang không cập nhật sau deploy.
  // Trang HTML: luôn revalidate; file tĩnh có hash (/_next/static) vẫn cache dài hạn.
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
