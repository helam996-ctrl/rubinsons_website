const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * IP-based in-memory rate limiter
 * @param ip Client IP address
 * @param limit Max allowed requests within window
 * @param windowMs Time window in milliseconds (default 60000ms / 1 min)
 * @returns boolean true if rate limited, false otherwise
 */
export function isRateLimited(ip: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  // Window reset
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > limit;
}
