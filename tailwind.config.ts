import type { Config } from 'tailwindcss';

/**
 * DubaiWay design tokens.
 * Palette: navy base + royal interactive + muted champagne gold on an ivory canvas.
 * Fonts are wired via next/font CSS variables (see src/app/layout.tsx).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Champagne Ivory Royal — nền kem ấm & be cát, navy trầm, nhấn gold champagne.
        midnight: {
          DEFAULT: '#364A63', // Muted Navy — tiêu đề, section tối, nút phụ
          950: '#293A4F', // navy trầm — footer
          900: '#364A63',
          800: '#45596F', // navy nhạt — card/ring trên nền tối
          700: '#55697E',
        },
        royal: {
          // Màu tương tác (link, chip active, focus) — navy trầm.
          DEFAULT: '#364A63',
          600: '#293A4F',
          500: '#45596F',
          400: '#5A6E82',
        },
        champagne: {
          DEFAULT: '#B88A3B', // Champagne Gold — điểm nhấn, nút chính, giá
          600: '#9C7430', // gold đậm — chữ gold trên nền sáng
          500: '#B88A3B',
          400: '#D3B16A', // Light Gold — chữ gold trên nền tối, footer title
          200: '#EAD9B4', // gold pale — nền nhãn, viền
        },
        ivory: {
          DEFAULT: '#F7EEDC', // nền chính kem ấm
          100: '#FFF9EF', // card / surface — kem rất sáng (không trắng lạnh)
          200: '#EEDDC1', // nền phụ — be cát tạo chiều sâu
        },
        mist: {
          // Viền & bề mặt phụ — sắc vàng be ấm.
          DEFAULT: '#DCC8A5', // border
          200: '#EEDDC1', // surface phụ / hover — be cát
          400: '#CBB588', // border đậm hơn
        },
        ink: {
          DEFAULT: '#2E2923', // chữ chính — nâu đen ấm
          muted: '#756B5E', // chữ phụ
          soft: '#9A8E7B', // chú thích
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      maxWidth: {
        shell: '82rem',
      },
      boxShadow: {
        // Shadow mềm, ngả navy trầm ấm — cao cấp, không dày đặc.
        card: '0 1px 2px rgba(54, 74, 99, 0.05), 0 12px 36px rgba(54, 74, 99, 0.09)',
        'card-hover': '0 2px 6px rgba(54, 74, 99, 0.07), 0 22px 48px -14px rgba(54, 74, 99, 0.17)',
        console: '0 24px 60px -22px rgba(54, 74, 99, 0.24)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      transitionTimingFunction: {
        dubaiway: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'draw-line': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
