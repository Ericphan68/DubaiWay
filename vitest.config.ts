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
    env: {
      NEXT_PUBLIC_SITE_URL: 'https://dubaiway.com',
      // Bật tách tên miền cho bộ test định tuyến. Chế độ chung một tên miền
      // được kiểm riêng bằng cách nạp lại module với biến môi trường khác.
      NEXT_PUBLIC_AREA_HOSTS: 'on',
    },
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
  },
});
