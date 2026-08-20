// lib/rate-limit.ts

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

/**
 * 内存请求速率限制器
 * @param key 标识符（如客户端 IP 或用户标识）
 * @param limit 允许的最大请求次数（默认 1 分钟 10 次）
 * @param windowMs 时间窗口毫秒数（默认 60000ms = 1分钟）
 */
export function rateLimit(key: string, limit = 10, windowMs = 60000): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = store[key];

  if (!record || now > record.resetTime) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}