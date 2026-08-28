import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Cố định tên miền gốc để test định tuyến ba khu không phụ thuộc .env.local
    // của từng máy. Suy ra merchant.dubaiway.com và admin.dubaiway.com.
    env: { NEXT_PUBLIC_SITE_URL: 'https://dubaiway.com' },
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
  },
});
