/**
 * Chọn nguồn dữ liệu.
 *
 * Có Supabase → dùng database thật. Chưa có → dùng bản trong bộ nhớ, để lập trình viên
 * chạy được toàn bộ ứng dụng ngay sau khi clone mà không cần tài khoản nào.
 * Tầng gọi không bao giờ biết đang dùng nguồn nào.
 */
import { hasSupabase } from '@/server/env';
import { memoryRepositories } from './memory';
import { supabaseRepositories } from './supabase';
import type { Repositories } from './types';

let cached: Repositories | null = null;

export function getRepositories(): Repositories {
  if (!cached) {
    cached = hasSupabase ? supabaseRepositories : memoryRepositories;
  }
  return cached;
}

export * from './types';
