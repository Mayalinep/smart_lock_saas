let createClient;
try {
  ({ createClient } = require('redis'));
} catch (_) {}

const REDIS_URL = process.env.REDIS_URL;

let redisClient = null;
let isRedisReady = false;

async function init() {
  if (isRedisReady || !createClient || !REDIS_URL) return;
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', () => {});
    await redisClient.connect();
    isRedisReady = true;
  } catch (_) {
    isRedisReady = false;
    redisClient = null;
  }
}

// Fallback mémoire: Map<key, { count: number, resetAt: number }>
const memoryCounters = new Map();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function incrementAndGet(key, windowSeconds, max) {
  await init();
  const windowSec = Math.max(1, windowSeconds);
  const limit = Math.max(1, max);

  if (isRedisReady && redisClient) {
    const redisKey = `ratelimit:${key}`;
    const tx = redisClient.multi();
    tx.incr(redisKey);
    tx.ttl(redisKey);
    const [count, ttl] = await tx.exec();
    if (ttl < 0) {
      await redisClient.expire(redisKey, windowSec);
    }
    const remainingTtl = ttl >= 0 ? ttl : windowSec;
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    return { allowed, count, remaining, resetSeconds: remainingTtl };
  }

  // Memory fallback
  const now = nowSeconds();
  const entry = memoryCounters.get(key);
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowSec;
    memoryCounters.set(key, { count: 1, resetAt });
    return { allowed: true, count: 1, remaining: limit - 1, resetSeconds: windowSec };
  } else {
    entry.count += 1;
    const allowed = entry.count <= limit;
    const remaining = Math.max(0, limit - entry.count);
    return { allowed, count: entry.count, remaining, resetSeconds: Math.max(0, entry.resetAt - now) };
  }
}

module.exports = {
  incrementAndGet,
};

